import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useCreateWarehouse } from '../hooks/useCreateWarehouse'
import { useUpdateWarehouse } from '../hooks/useUpdateWarehouse'
import type { WarehouseResponse } from '../types'

// ─── Zod schema — name 3–100 chars per api-docs.json CreateWarehouseInput ───
const warehouseSchema = z.object({
  name: z
    .string()
    .min(3, 'Tên kho phải có ít nhất 3 ký tự')
    .max(100, 'Tên kho tối đa 100 ký tự'),
})

type WarehouseFormValues = z.infer<typeof warehouseSchema>

interface WarehouseDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Pass warehouse to edit; omit for create mode */
  warehouse?: WarehouseResponse
}

/**
 * Create/Edit warehouse dialog.
 * - Create mode (warehouse = undefined): POST /warehouses (ADMIN only)
 * - Edit mode (warehouse present): PATCH /warehouses/:id (Admin/Manager own)
 */
export function WarehouseDialog({ open, onOpenChange, warehouse }: WarehouseDialogProps) {
  const isEdit = !!warehouse
  const createMutation = useCreateWarehouse()
  const updateMutation = useUpdateWarehouse()
  const isPending = createMutation.isPending || updateMutation.isPending

  const form = useForm<WarehouseFormValues>({
    resolver: zodResolver(warehouseSchema),
    values: { name: warehouse?.name ?? '' },
  })

  async function onSubmit(values: WarehouseFormValues) {
    if (isEdit && warehouse) {
      await updateMutation.mutateAsync({ id: warehouse.id, input: values })
    } else {
      await createMutation.mutateAsync(values)
    }
    form.reset()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!isPending) { form.reset(); onOpenChange(v) } }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Cập nhật kho hàng' : 'Thêm kho hàng mới'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên kho hàng</FormLabel>
                  <FormControl>
                    <Input
                      id="warehouse-name-input"
                      placeholder="VD: Kho Hà Nội"
                      disabled={isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                disabled={isPending}
                onClick={() => { form.reset(); onOpenChange(false) }}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEdit ? 'Cập nhật' : 'Thêm mới'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
