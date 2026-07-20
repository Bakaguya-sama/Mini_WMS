import { axiosClient } from '@/api/axiosClient'
import { ENDPOINTS } from '@/api/endpoints'
import { ApiResponse, PaginatedData } from '@/types/common'

export interface WarehouseItem {
  id: string
  name: string
  createdAt: string
  updatedAt: string
}

/**
 * GET /warehouses — fetch warehouse list for Admin select filter.
 * Uses a large limit to get all warehouses for the dropdown.
 */
export async function getWarehouses(params?: {
  page?: number
  limit?: number
  search?: string
}): Promise<PaginatedData<WarehouseItem>> {
  const response = await axiosClient.get<ApiResponse<PaginatedData<WarehouseItem>>>(
    ENDPOINTS.WAREHOUSES.BASE,
    { params }
  )
  return response.data.data
}
