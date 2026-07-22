import { create } from 'zustand'
import { Role } from '@/types/common'

// ─── AuthUser shape — matches AuthUser schema in api-docs.json ────────────────
export interface AuthUser {
  id: string
  email: string
  username: string
  role: Role
  warehouseId: string | null
}

// ─── Store State & Actions ───────────────────────────────────────────────────
interface AuthState {
  accessToken: string | null
  user: AuthUser | null

  /** Called after successful login — sets all auth state */
  setAuth: (accessToken: string, user: AuthUser) => void

  /** Called after successful token refresh — updates accessToken only */
  updateTokens: (accessToken: string) => void

  /** Called on logout or when refresh token fails — clears all auth state */
  clearAuth: () => void
}

/**
 * Zustand auth store — intentionally NOT persisted (in-memory only).
 *
 * Per CONTEXT.md §5: Tokens stored in-memory for XSS safety.
 * F5 → AuthProvider will silently refresh session before app mounts.
 *
 * Do NOT add localStorage/sessionStorage persistence here.
 */
export const useAuthStore = create<AuthState>()((set) => ({
  accessToken: null,
  user: null,

  setAuth: (accessToken, user) =>
    set({ accessToken, user }),

  updateTokens: (accessToken) =>
    set({ accessToken }),

  clearAuth: () =>
    set({ accessToken: null, user: null }),
}))
