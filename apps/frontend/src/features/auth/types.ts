import { Role } from '@/types/common'

// ─── Auth User — matches AuthUser schema in api-docs.json ──────────────────
export interface AuthUser {
  id: string
  email: string
  username: string
  role: Role
  warehouseId: string | null
}

// ─── Login ─────────────────────────────────────────────────────────────────
/** POST /auth/login request body — matches LoginInput in api-docs.json */
export interface LoginInput {
  email: string
  password: string
}

/** data field of LoginResponse in api-docs.json */
export interface LoginResponseData {
  accessToken: string
  user: AuthUser
}

// ─── Refresh ───────────────────────────────────────────────────────────────
/** data field of /auth/refresh response */
export interface RefreshResponseData {
  accessToken: string
}
