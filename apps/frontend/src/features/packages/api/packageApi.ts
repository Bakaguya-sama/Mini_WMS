import { axiosClient } from '@/api/axiosClient'
import { ENDPOINTS } from '@/api/endpoints'
import { ApiResponse, PaginatedData } from '@/types/common'
import type {
  PackageResponse,
  CreatePackageInput,
  UpdatePackageInput,
  PackageListParams,
} from '../types'

/** GET /packages */
export async function getPackages(
  params?: PackageListParams
): Promise<PaginatedData<PackageResponse>> {
  const response = await axiosClient.get<ApiResponse<PaginatedData<PackageResponse>>>(
    ENDPOINTS.PACKAGES.BASE,
    { params }
  )
  return response.data.data
}

/** GET /packages/:id */
export async function getPackageById(id: string): Promise<PackageResponse> {
  const response = await axiosClient.get<ApiResponse<PackageResponse>>(
    ENDPOINTS.PACKAGES.BY_ID(id)
  )
  return response.data.data
}

/** POST /packages */
export async function createPackage(
  input: CreatePackageInput
): Promise<PackageResponse> {
  const response = await axiosClient.post<ApiResponse<PackageResponse>>(
    ENDPOINTS.PACKAGES.BASE,
    input
  )
  return response.data.data
}

/** 
 * PATCH /packages/:id 
 * Note: input MUST include version for optimistic locking.
 * 409 error will be handled by the interceptor/hook to trigger invalidateQueries.
 */
export async function updatePackage(
  id: string,
  input: UpdatePackageInput
): Promise<PackageResponse> {
  const response = await axiosClient.patch<ApiResponse<PackageResponse>>(
    ENDPOINTS.PACKAGES.BY_ID(id),
    input
  )
  return response.data.data
}
