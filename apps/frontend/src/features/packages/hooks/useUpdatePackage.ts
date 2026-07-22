import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updatePackage } from '../api/packageApi'
import type { UpdatePackageInput } from '../types'
import { AxiosError } from 'axios'

export function useUpdatePackage() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdatePackageInput }) =>
      updatePackage(id, input),
    onSuccess: () => {
      // Invalidate both list and potential single item queries
      queryClient.invalidateQueries({ queryKey: ['packages'] })
    },
    onError: (error: AxiosError<{ statusCode: number }>) => {
      // Handle Optimistic Locking conflict (409)
      // The toast is automatically shown by axiosClient interceptor.
      // We just need to refresh the data so the user gets the latest version.
      if (error.response?.data?.statusCode === 409) {
        queryClient.invalidateQueries({ queryKey: ['packages'] })
      }
    }
  })
}
