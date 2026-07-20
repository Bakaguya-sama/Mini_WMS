import { axiosClient } from '@/api/axiosClient'
import { ENDPOINTS } from '@/api/endpoints'
import { ApiResponse } from '@/types/common'
import type {
  FinancialReportData,
  FinancialReportParams,
  PackageStatusCount,
} from '../types'

/**
 * GET /dashboard/financial-report
 *
 * Role behaviour (enforced server-side):
 * - Admin: can pass `warehouseId` to filter; omit for system-wide (returns byWarehouse[])
 * - Manager: no params needed — BE scopes to their own warehouse automatically
 * - Staff: not supposed to call this; role guard on page prevents it
 */
export async function getFinancialReport(
  params?: FinancialReportParams
): Promise<FinancialReportData> {
  const response = await axiosClient.get<ApiResponse<FinancialReportData>>(
    ENDPOINTS.DASHBOARD.FINANCIAL_REPORT,
    { params }
  )
  return response.data.data
}

/**
 * GET /dashboard/package-status-report
 * Returns array of { status, count } for all package statuses.
 * Accessible by all roles (Admin/Manager/Staff).
 */
export async function getPackageStatusReport(): Promise<PackageStatusCount[]> {
  const response = await axiosClient.get<ApiResponse<PackageStatusCount[]>>(
    ENDPOINTS.DASHBOARD.PACKAGE_STATUS_REPORT
  )
  return response.data.data
}
