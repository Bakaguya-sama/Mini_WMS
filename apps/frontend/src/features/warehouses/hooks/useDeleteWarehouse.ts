import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteWarehouse } from '../api/warehouseApi'

/** Mutation for DELETE /warehouses/:id (ADMIN only). Invalidates warehouse list on success. */
export function useDeleteWarehouse() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteWarehouse(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouses'] })
    },
  })
}
