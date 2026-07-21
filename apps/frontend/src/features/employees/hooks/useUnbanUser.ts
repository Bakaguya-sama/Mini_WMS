import { useMutation, useQueryClient } from '@tanstack/react-query'
import { unbanUser } from '../api/userApi'

export function useUnbanUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => unbanUser(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['users'] }) },
  })
}
