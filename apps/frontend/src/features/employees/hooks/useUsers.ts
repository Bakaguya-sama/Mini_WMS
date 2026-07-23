import { useQuery } from '@tanstack/react-query'
import { getUsers } from '../api/userApi'
import type { UserListParams } from '../types'

/**
 * Hook for GET /users (paginated, filterable).
 * Admin/Manager only — BE scopes Manager automatically to their warehouse.
 */
export function useUsers(params?: UserListParams) {
  return useQuery({
    queryKey: ['users', 'list', params],
    queryFn: () => getUsers(params),
  })
}
