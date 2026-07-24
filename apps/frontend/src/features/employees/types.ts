/**
 * Employee (User) feature types — matches api-docs.json schemas exactly.
 * Note: isBanned was added to UserResponse in updated api-docs.
 */
import type { Role } from '@/types/common'

/** UserResponse schema — per updated api-docs.json */
export interface UserResponse {
  id: string
  email: string
  username: string
  role: Role
  warehouseId: string | null
  isBanned: boolean
  createdAt: string
  updatedAt: string
}

/** CreateUserInput — required: email, username, password, role; optional: warehouseId */
export interface CreateUserInput {
  email: string
  username: string
  password: string
  role: Role
  warehouseId?: string | null
}

/**
 * UpdateUserInput — all optional.
 * Admin: can change role, warehouseId.
 * Manager: can update users in their warehouse (no role/warehouse change).
 */
export interface UpdateUserInput {
  email?: string
  username?: string
  role?: Role
  warehouseId?: string | null
}

/** Query params for GET /users */
export interface UserListParams {
  page?: number
  limit?: number
  search?: string
  role?: Role
  warehouseId?: string
  isBanned?: boolean
  sortBy?: 'username' | 'email' | 'createdAt' | 'updatedAt'
  sortOrder?: 'asc' | 'desc'
}
