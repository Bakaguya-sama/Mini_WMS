import { useQuery } from '@tanstack/react-query'
import { getUsers } from '../api/userApi'
import type { UserListParams } from '../types'

/**
 * Hook for GET /users (paginated, filterable).
 * Admin/Manager only — BE scopes Manager automatically to their warehouse.
 * refetchInterval: 10s per CONTEXT §7.
 */
export function useUsers(params?: UserListParams) {
  return useQuery({
    queryKey: ['users', params],
    queryFn: () => getUsers(params),
    refetchInterval: 10000,
    refetchOnWindowFocus: true,
  })
}
