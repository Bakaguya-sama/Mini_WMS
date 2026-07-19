import { axiosClient } from '@/api/axiosClient'
import { ENDPOINTS } from '@/api/endpoints'
import { ApiResponse } from '@/types/common'

// ─── Types — per UpdateProfileInput in api-docs.json ─────────────────────────

/** PATCH /users/profile body — all fields optional */
export interface UpdateProfileInput {
  email?: string
  username?: string
  /** min length 6 per api-docs.json */
  password?: string
}

/** Returned UserResponse from PATCH /users/profile */
export interface UserResponse {
  id: string
  email: string
  username: string
  role: string
  warehouseId: string | null
}

/**
 * PATCH /users/profile
 * Updates the authenticated user's own email, username, or password.
 * Bearer token is attached automatically by the axios request interceptor.
 * Cannot change role or warehouseId — those are admin-only operations.
 */
export async function updateProfile(
  data: UpdateProfileInput
): Promise<UserResponse> {
  const response = await axiosClient.patch<ApiResponse<UserResponse>>(
    ENDPOINTS.USERS.PROFILE,
    data
  )
  return response.data.data
}
