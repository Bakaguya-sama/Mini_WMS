import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createWarehouse } from '../api/warehouseApi'
import type { CreateWarehouseInput } from '../types'

/** Mutation for POST /warehouses (ADMIN only). Invalidates warehouse list on success. */
export function useCreateWarehouse() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateWarehouseInput) => createWarehouse(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouses'] })
    },
  })
}
