import { useQuery } from '@tanstack/react-query'
import { getPackages } from '../api/packageApi'
import type { PackageListParams } from '../types'

/**
 * Hook for GET /packages.
 * refetchInterval: 10s per CONTEXT §7.
 */
export function usePackages(params?: PackageListParams) {
  return useQuery({
    queryKey: ['packages', params],
    queryFn: () => getPackages(params),
    refetchInterval: 10000,
    refetchOnWindowFocus: true,
  })
}
