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
  refreshToken: string | null
  user: AuthUser | null

  /** Called after successful login — sets all auth state */
  setAuth: (accessToken: string, refreshToken: string, user: AuthUser) => void

  /** Called after successful token refresh — updates both tokens only */
  updateTokens: (accessToken: string, refreshToken: string) => void

  /** Called on logout or when refresh token fails — clears all auth state */
  clearAuth: () => void
}

/**
 * Zustand auth store — intentionally NOT persisted (in-memory only).
 *
 * Per CONTEXT.md §5: Tokens stored in-memory for XSS safety.
 * F5 → session lost → redirect to /login. This is ACCEPTED behavior.
 *
 * Do NOT add localStorage/sessionStorage persistence here.
 */
export const useAuthStore = create<AuthState>()((set) => ({
  accessToken: null,
  refreshToken: null,
  user: null,

  setAuth: (accessToken, refreshToken, user) =>
    set({ accessToken, refreshToken, user }),

  updateTokens: (accessToken, refreshToken) =>
    set({ accessToken, refreshToken }),

  clearAuth: () =>
    set({ accessToken: null, refreshToken: null, user: null }),
}))
