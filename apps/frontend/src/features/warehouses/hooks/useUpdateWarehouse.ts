import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateWarehouse } from '../api/warehouseApi'
import type { UpdateWarehouseInput } from '../types'

/** Mutation for PATCH /warehouses/:id (Admin any / Manager own). Invalidates warehouse list on success. */
export function useUpdateWarehouse() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateWarehouseInput }) =>
      updateWarehouse(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouses'] })
    },
  })
}
