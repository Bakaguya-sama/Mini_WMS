/**
 * Dashboard feature types — matches api-docs.json schemas exactly.
 * FinancialReportResponse, PackageStatusReportResponse
 */

// ─── Financial Report ─────────────────────────────────────────────────────────

/** One row in the byWarehouse breakdown (only present when warehouseId is omitted) */
export interface WarehouseBreakdown {
  warehouseId: string
  totalPackages: number
  totalRevenue: number
}

/**
 * `data` field of FinancialReportResponse.
 * `byWarehouse` is present ONLY when Admin calls without warehouseId filter.
 */
export interface FinancialReportData {
  warehouseId: string | null
  totalPackages: number
  totalRevenue: number
  byWarehouse?: WarehouseBreakdown[]
}

/** Query params for GET /dashboard/financial-report */
export interface FinancialReportParams {
  /** Admin only: filter by a specific warehouse. Omit for system-wide. */
  warehouseId?: string
}

// ─── Package Status Report ────────────────────────────────────────────────────

/** One item in PackageStatusReportResponse.data array */
export interface PackageStatusCount {
  status: 'PENDING' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED'
  count: number
}
