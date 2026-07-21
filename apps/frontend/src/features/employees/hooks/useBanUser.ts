import { useMutation, useQueryClient } from '@tanstack/react-query'
import { banUser } from '../api/userApi'

export function useBanUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => banUser(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['users'] }) },
  })
}
