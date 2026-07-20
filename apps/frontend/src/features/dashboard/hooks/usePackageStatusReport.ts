import { useQuery } from '@tanstack/react-query'
import { getPackageStatusReport } from '../api/dashboardApi'

interface PackageStatusReportParams {
  /** Admin only: filter by warehouse. Omit for system-wide. */
  warehouseId?: string
}

/**
 * Hook for GET /dashboard/package-status-report.
 * Returns breakdown of package counts by status: PENDING/IN_TRANSIT/DELIVERED/CANCELLED.
 * Admin can pass warehouseId to filter; Manager/Staff scoped automatically by BE.
 * Refetch interval: inherited from global queryClient config (10s per CONTEXT §7).
 */
export function usePackageStatusReport(params?: PackageStatusReportParams) {
  return useQuery({
    queryKey: ['dashboard', 'package-status-report', params?.warehouseId ?? 'all'],
    queryFn: () => getPackageStatusReport(params),
  })
}
