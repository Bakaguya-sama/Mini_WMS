import { axiosClient } from '@/api/axiosClient'
import { ENDPOINTS } from '@/api/endpoints'
import { ApiResponse, PaginatedData } from '@/types/common'
import type {
  WarehouseResponse,
  CreateWarehouseInput,
  UpdateWarehouseInput,
  WarehouseListParams,
} from '../types'

export type { WarehouseResponse }

/** GET /warehouses — ADMIN only, paginated */
export async function getWarehouses(
  params?: WarehouseListParams
): Promise<PaginatedData<WarehouseResponse>> {
  const response = await axiosClient.get<ApiResponse<PaginatedData<WarehouseResponse>>>(
    ENDPOINTS.WAREHOUSES.BASE,
    { params }
  )
  return response.data.data
}

/** GET /warehouses/:id — Admin/Manager/Staff */
export async function getWarehouseById(id: string): Promise<WarehouseResponse> {
  const response = await axiosClient.get<ApiResponse<WarehouseResponse>>(
    ENDPOINTS.WAREHOUSES.BY_ID(id)
  )
  return response.data.data
}

/** POST /warehouses — ADMIN only */
export async function createWarehouse(
  input: CreateWarehouseInput
): Promise<WarehouseResponse> {
  const response = await axiosClient.post<ApiResponse<WarehouseResponse>>(
    ENDPOINTS.WAREHOUSES.BASE,
    input
  )
  return response.data.data
}

/** PATCH /warehouses/:id — Admin (any) / Manager (own warehouse only) */
export async function updateWarehouse(
  id: string,
  input: UpdateWarehouseInput
): Promise<WarehouseResponse> {
  const response = await axiosClient.patch<ApiResponse<WarehouseResponse>>(
    ENDPOINTS.WAREHOUSES.BY_ID(id),
    input
  )
  return response.data.data
}

/** DELETE /warehouses/:id — ADMIN only, soft-delete, returns 204 */
export async function deleteWarehouse(id: string): Promise<void> {
  await axiosClient.delete(ENDPOINTS.WAREHOUSES.BY_ID(id))
}
