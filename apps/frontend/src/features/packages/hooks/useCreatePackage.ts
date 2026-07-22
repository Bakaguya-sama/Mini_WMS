import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createPackage } from '../api/packageApi'
import type { CreatePackageInput } from '../types'

export function useCreatePackage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreatePackageInput) => createPackage(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packages'] })
    },
  })
}
