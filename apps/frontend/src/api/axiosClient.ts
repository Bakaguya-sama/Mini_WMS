import axios, { AxiosInstance, InternalAxiosRequestConfig } from "axios";
import { toast } from "sonner";
import { ENDPOINTS } from "./endpoints";
import { useAuthStore } from "@/store/authStore";

// ─── Extend Axios config to support _retry flag ───────────────────────────────
declare module "axios" {
  interface InternalAxiosRequestConfig {
    _retry?: boolean;
  }
}

// ─── Base URL (from api-docs.json servers[0].url) ─────────────────────────────
const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000/api/v1";

// ─── Race condition guard ─────────────────────────────────────────────────────
// If multiple requests get 401 simultaneously, only ONE refresh call is made.
// All others queue up, waiting for the single refresh result.
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: string) => void;
  reject: (reason?: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null) {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
}

// ─── Axios Instance ───────────────────────────────────────────────────────────
export const axiosClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// ─── Request Interceptor: Attach Bearer token ─────────────────────────────────
axiosClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Skip token attachment for public auth endpoints
    const isPublicEndpoint =
      config.url === ENDPOINTS.AUTH.LOGIN ||
      config.url === ENDPOINTS.AUTH.REFRESH;

    if (!isPublicEndpoint) {
      const { accessToken } = useAuthStore.getState();
      if (accessToken) {
        config.headers["Authorization"] = `Bearer ${accessToken}`;
      }
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// ─── Response Interceptor: Handle 401 → Refresh → Retry ──────────────────────
axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as InternalAxiosRequestConfig;

    // Extract error details per CONTEXT.md §3 (flat error shape)
    const statusCode: number | undefined = error.response?.data?.statusCode;
    const message: string =
      error.response?.data?.message || "Đã xảy ra lỗi, vui lòng thử lại.";

    // ── Handle 403: Insufficient permissions ──────────────────────────────────
    if (statusCode === 403) {
      toast.error("Không đủ quyền thực hiện thao tác này.");
      return Promise.reject(error);
    }

    // ── Handle 401: Try token refresh ─────────────────────────────────────────
    if (statusCode === 401) {
      // If 401 on login, it's just wrong credentials, don't trigger refresh logic
      if (originalRequest.url === ENDPOINTS.AUTH.LOGIN) {
        toast.error(message)
        return Promise.reject(error)
      }

      // Case 1: The refresh request itself failed → full logout
      if (originalRequest.url === ENDPOINTS.AUTH.REFRESH) {
        useAuthStore.getState().clearAuth();
        if (window.location.pathname !== '/login') {
          window.location.href = "/login";
        }
        return Promise.reject(error);
      }

      // Case 2: Already retried once → don't retry again
      if (originalRequest._retry) {
        useAuthStore.getState().clearAuth();
        if (window.location.pathname !== '/login') {
          window.location.href = "/login";
        }
        return Promise.reject(error);
      }

      // Case 3: Another refresh is already in-flight → queue this request
      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((newAccessToken) => {
            originalRequest.headers["Authorization"] =
              `Bearer ${newAccessToken}`;
            return axiosClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      // Case 4: First 401 → initiate refresh
      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // POST /auth/refresh — no Bearer token needed (browser sends cookie)
        const response = await axiosClient.post(ENDPOINTS.AUTH.REFRESH);
        const { accessToken: newAccessToken } = response.data.data;

        // Update store with the new token
        useAuthStore.getState().updateTokens(newAccessToken);

        // Process queued requests with new token
        processQueue(null, newAccessToken);

        // Retry the original failed request
        originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
        return axiosClient(originalRequest);
      } catch (refreshError) {
        // Refresh also failed → full logout
        processQueue(refreshError, null);
        useAuthStore.getState().clearAuth();
        if (window.location.pathname !== '/login') {
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // ── Handle other errors: show toast with server message ───────────────────
    // Per CONTEXT.md §3: use error.response.data.message (flat, NOT nested)
    if (error.response && statusCode !== 401) {
      toast.error(message);
    } else if (!error.response) {
      toast.error(
        "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.",
      );
    }

    return Promise.reject(error);
  },
);
