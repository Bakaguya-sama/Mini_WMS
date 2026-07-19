import { axiosClient } from "@/api/axiosClient";
import { ENDPOINTS } from "@/api/endpoints";
import { ApiResponse } from "@/types/common";
import type {
  LoginInput,
  LoginResponseData,
  RefreshResponseData,
} from "../types";

/**
 * POST /auth/login
 * No Bearer token — axiosClient interceptor skips attachment for this URL.
 */
export async function login(data: LoginInput): Promise<LoginResponseData> {
  const response = await axiosClient.post<ApiResponse<LoginResponseData>>(
    ENDPOINTS.AUTH.LOGIN,
    data,
  );
  return response.data.data;
}

/**
 * POST /auth/logout
 * Requires Bearer token (attached by request interceptor automatically).
 * Returns 204 — no response body.
 */
export async function logout(): Promise<void> {
  await axiosClient.post(ENDPOINTS.AUTH.LOGOUT);
}

/**
 * POST /auth/refresh
 * No Bearer token needed per api-docs.json (security: []).
 * Called internally by axiosClient interceptor — exposed here for testing.
 */
export async function refreshTokens(
  refreshToken: string,
): Promise<RefreshResponseData> {
  const response = await axiosClient.post<ApiResponse<RefreshResponseData>>(
    ENDPOINTS.AUTH.REFRESH,
    { refreshToken },
  );
  return response.data.data;
}
