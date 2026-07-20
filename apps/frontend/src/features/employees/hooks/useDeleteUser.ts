import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteUser } from '../api/userApi'

/** DELETE /users/:id — ADMIN only soft-delete. Shows confirm dialog before calling. */
export function useDeleteUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteUser(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['users'] }) },
  })
}
