/**
 * Warehouse feature types — matches api-docs.json schemas exactly.
 */

/** WarehouseResponse schema */
export interface WarehouseResponse {
  id: string
  name: string
  createdAt: string
  updatedAt: string
}

/** CreateWarehouseInput: name 3–100 chars, required */
export interface CreateWarehouseInput {
  name: string
}

/** UpdateWarehouseInput: name 3–100 chars, optional */
export interface UpdateWarehouseInput {
  name?: string
}

/** Query params for GET /warehouses (ADMIN only) */
export interface WarehouseListParams {
  page?: number
  limit?: number
  search?: string
}
