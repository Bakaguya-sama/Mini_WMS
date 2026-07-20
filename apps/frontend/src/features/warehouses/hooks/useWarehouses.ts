import { useQuery } from '@tanstack/react-query'
import { getWarehouses } from '../api/warehouseApi'

/**
 * Fetch all warehouses for dropdown selects.
 * Uses limit=100 to get all in one request (Admin filter use case).
 * Only called when user is ADMIN (guarded at component level).
 */
export function useWarehouses() {
  return useQuery({
    queryKey: ['warehouses', 'list-all'],
    queryFn: () => getWarehouses({ limit: 100 }),
  })
}
