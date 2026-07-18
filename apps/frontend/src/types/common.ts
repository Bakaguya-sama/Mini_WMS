/**
 * Common types used across the entire application.
 * Shapes must match api-docs.json exactly — do NOT add fields not in spec.
 */

// ─── API Response Envelope ───────────────────────────────────────────────────

/** Wrapper for all successful API responses: { success: true, data: T } */
export interface ApiResponse<T> {
  success: true
  data: T
}

/**
 * Flat error shape (NOT nested) — matches api-docs ErrorResponse exactly.
 * Use error.response.data.message — NOT error.response.data.error.message
 */
export interface ErrorResponse {
  success: false
  statusCode: number
  message: string
  stack: string | null
}

// ─── Role Enum ───────────────────────────────────────────────────────────────

/** User roles — must match enum in api-docs.json exactly */
export enum Role {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  STAFF = 'STAFF',
}

// ─── Pagination ───────────────────────────────────────────────────────────────

/** Generic paginated list data shape used by list endpoints */
export interface PaginatedData<T> {
  data: T[]
  total: number
  page: number
  limit: number
}

// ─── Query Params ────────────────────────────────────────────────────────────

export interface PaginationParams {
  page?: number
  limit?: number
}
