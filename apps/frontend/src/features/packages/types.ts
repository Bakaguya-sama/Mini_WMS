/**
 * Package feature types — matches api-docs.json schemas exactly.
 */

export enum PackageStatus {
  PENDING = 'PENDING',
  IN_TRANSIT = 'IN_TRANSIT',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

/** PackageResponse schema */
export interface PackageResponse {
  id: string
  code: string
  price: number
  warehouseId: string
  status: PackageStatus
  version: number
  createdAt: string
  updatedAt: string
}

/** CreatePackageInput */
export interface CreatePackageInput {
  code: string
  price?: number
  warehouseId: string
  status?: PackageStatus
}

/** UpdatePackageInput — version is required for optimistic locking */
export interface UpdatePackageInput {
  code?: string
  price?: number
  status?: PackageStatus
  warehouseId?: string
  version: number
}

/** Query params for GET /packages */
export interface PackageListParams {
  page?: number
  limit?: number
  warehouseId?: string
  status?: PackageStatus
  search?: string
  sortBy?: 'code' | 'price' | 'status' | 'createdAt' | 'updatedAt'
  sortOrder?: 'asc' | 'desc'
}
