import { useQuery } from '@tanstack/react-query'
import { getWarehouses } from '../api/warehouseApi'
import type { WarehouseListParams } from '../types'

/**
 * Hook for GET /warehouses (paginated list).
 * ADMIN only — enabled flag prevents 403 for other roles.
 * refetchInterval: 10s per CONTEXT §7.
 */
export function useWarehouseList(params?: WarehouseListParams, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['warehouses', 'list', params],
    queryFn: () => getWarehouses(params),
    enabled: options?.enabled ?? true,
  })
}
