import { axiosClient } from '@/api/axiosClient'
import { ENDPOINTS } from '@/api/endpoints'
import { ApiResponse, PaginatedData } from '@/types/common'
import type {
  UserResponse,
  CreateUserInput,
  UpdateUserInput,
  UserListParams,
} from '../types'

/** GET /users — Admin/Manager, paginated + filterable */
export async function getUsers(
  params?: UserListParams
): Promise<PaginatedData<UserResponse>> {
  const response = await axiosClient.get<ApiResponse<PaginatedData<UserResponse>>>(
    ENDPOINTS.USERS.BASE,
    { params }
  )
  return response.data.data
}

/** GET /users/:id — Admin/Manager */
export async function getUserById(id: string): Promise<UserResponse> {
  const response = await axiosClient.get<ApiResponse<UserResponse>>(
    ENDPOINTS.USERS.BY_ID(id)
  )
  return response.data.data
}

/** POST /users — Admin (any role) / Manager (STAFF in own warehouse only) */
export async function createUser(input: CreateUserInput): Promise<UserResponse> {
  const response = await axiosClient.post<ApiResponse<UserResponse>>(
    ENDPOINTS.USERS.BASE,
    input
  )
  return response.data.data
}

/** PATCH /users/:id — Admin (any) / Manager (own warehouse users) */
export async function updateUser(
  id: string,
  input: UpdateUserInput
): Promise<UserResponse> {
  const response = await axiosClient.patch<ApiResponse<UserResponse>>(
    ENDPOINTS.USERS.BY_ID(id),
    input
  )
  return response.data.data
}

/** DELETE /users/:id — ADMIN only, soft-delete, 204 */
export async function deleteUser(id: string): Promise<void> {
  await axiosClient.delete(ENDPOINTS.USERS.BY_ID(id))
}

/** PATCH /users/:id/ban — Admin/Manager */
export async function banUser(id: string): Promise<UserResponse> {
  const response = await axiosClient.patch<ApiResponse<UserResponse>>(
    ENDPOINTS.USERS.BAN(id)
  )
  return response.data.data
}

/** PATCH /users/:id/unban — Admin/Manager */
export async function unbanUser(id: string): Promise<UserResponse> {
  const response = await axiosClient.patch<ApiResponse<UserResponse>>(
    ENDPOINTS.USERS.UNBAN(id)
  )
  return response.data.data
}
