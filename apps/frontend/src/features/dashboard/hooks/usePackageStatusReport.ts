import { useQuery } from '@tanstack/react-query'
import { getPackageStatusReport } from '../api/dashboardApi'

/**
 * Hook for GET /dashboard/package-status-report.
 * Returns breakdown of package counts by status: PENDING/IN_TRANSIT/DELIVERED/CANCELLED.
 * Accessible by all roles.
 * Refetch interval: inherited from global queryClient config (10s per CONTEXT §7).
 */
export function usePackageStatusReport() {
  return useQuery({
    queryKey: ['dashboard', 'package-status-report'],
    queryFn: getPackageStatusReport,
  })
}
