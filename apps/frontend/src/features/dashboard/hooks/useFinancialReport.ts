import { useQuery } from '@tanstack/react-query'
import { getFinancialReport } from '../api/dashboardApi'
import type { FinancialReportParams } from '../types'

/**
 * Hook for GET /dashboard/financial-report.
 *
 * - Admin: pass `warehouseId` to filter by warehouse, or omit for system-wide
 *   (response will include `byWarehouse[]` breakdown).
 * - Manager: no params needed — BE scopes automatically to their warehouse.
 * - Staff: should NOT be rendered (role guard prevents usage).
 *
 * Refetch interval: inherited from global queryClient config (10s per CONTEXT §7).
 */
export function useFinancialReport(params?: FinancialReportParams, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['dashboard', 'financial-report', params?.warehouseId ?? 'all'],
    queryFn: () => getFinancialReport(params),
    enabled: options?.enabled,
  })
}
