import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateUser } from '../api/userApi'
import type { UpdateUserInput } from '../types'

export function useUpdateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateUserInput }) =>
      updateUser(id, input),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['users'] }) },
  })
}
