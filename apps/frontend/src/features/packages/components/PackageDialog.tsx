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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useCreatePackage } from '../hooks/useCreatePackage'
import { useUpdatePackage } from '../hooks/useUpdatePackage'
import { useWarehouses } from '@/features/warehouses/hooks/useWarehouses'
import { PackageStatus } from '../types'
import type { PackageResponse } from '../types'

// ─── Schemas ─────────────────────────────────────────────────────────────────

const createSchema = z.object({
  code: z.string().min(1, 'Vui lòng nhập mã kiện hàng').max(50, 'Tối đa 50 ký tự'),
  price: z.coerce.number().min(0, 'Giá trị không hợp lệ').default(0),
  warehouseId: z.string().min(1, 'Vui lòng chọn kho hàng'),
  status: z.nativeEnum(PackageStatus).default(PackageStatus.PENDING),
})
type CreateValues = z.infer<typeof createSchema>

// Edit schema expects version (for optimistic locking).
const editSchema = z.object({
  code: z.string().min(1, 'Vui lòng nhập mã kiện hàng').max(50, 'Tối đa 50 ký tự').optional(),
  price: z.coerce.number().min(0, 'Giá trị không hợp lệ').optional(),
  warehouseId: z.string().min(1, 'Vui lòng chọn kho hàng').optional(),
  status: z.nativeEnum(PackageStatus).optional(),
  version: z.number(),
})
type EditValues = z.infer<typeof editSchema>

// ─── Status options ──────────────────────────────────────────────────────────

const STATUS_OPTIONS = [
  { value: PackageStatus.PENDING, label: 'Chờ xử lý' },
  { value: PackageStatus.IN_TRANSIT, label: 'Đang giao' },
  { value: PackageStatus.DELIVERED, label: 'Đã giao' },
  { value: PackageStatus.CANCELLED, label: 'Đã hủy' },
]

// ─── Props ───────────────────────────────────────────────────────────────────

interface PackageDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  pkg?: PackageResponse
  isAdmin: boolean
  managerWarehouseId?: string | null
}

export function PackageDialog({
  open,
  onOpenChange,
  pkg,
  isAdmin,
  managerWarehouseId,
}: PackageDialogProps) {
  const isEdit = !!pkg
  const createMutation = useCreatePackage()
  const updateMutation = useUpdatePackage()
  const isPending = createMutation.isPending || updateMutation.isPending

  // Admin can select warehouse.
  const { data: warehousesData } = useWarehouses({ enabled: isAdmin })

  function handleClose() {
    if (!isPending) onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? `Sửa kiện hàng: ${pkg?.code}` : 'Thêm kiện hàng mới'}
          </DialogTitle>
        </DialogHeader>

        {isEdit ? (
          <EditForm
            pkg={pkg!}
            isPending={isPending}
            updateMutation={updateMutation}
            warehousesData={warehousesData}
            isAdmin={isAdmin}
            onClose={handleClose}
          />
        ) : (
          <CreateForm
            isPending={isPending}
            createMutation={createMutation}
            warehousesData={warehousesData}
            isAdmin={isAdmin}
            managerWarehouseId={managerWarehouseId}
            onClose={handleClose}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

// ─── Create form ─────────────────────────────────────────────────────────────

function CreateForm({
  isPending,
  createMutation,
  warehousesData,
  isAdmin,
  managerWarehouseId,
  onClose,
}: {
  isPending: boolean
  createMutation: ReturnType<typeof useCreatePackage>
  warehousesData: any
  isAdmin: boolean
  managerWarehouseId?: string | null
  onClose: () => void
}) {
  const form = useForm<CreateValues>({
    resolver: zodResolver(createSchema),
    defaultValues: {
      code: '',
      price: 0,
      warehouseId: isAdmin ? '' : managerWarehouseId || '',
      status: PackageStatus.PENDING,
    },
  })

  async function onSubmit(values: CreateValues) {
    await createMutation.mutateAsync(values)
    form.reset()
    onClose()
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-1">
        <FormField control={form.control} name="code" render={({ field }) => (
          <FormItem>
            <FormLabel>Mã kiện hàng <span className="text-destructive">*</span></FormLabel>
            <FormControl><Input placeholder="VD: PKG-1234" disabled={isPending} {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name="price" render={({ field }) => (
          <FormItem>
            <FormLabel>Giá trị (VND) <span className="text-destructive">*</span></FormLabel>
            <FormControl><Input type="number" disabled={isPending} {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name="status" render={({ field }) => (
          <FormItem>
            <FormLabel>Trạng thái</FormLabel>
            <Select disabled={isPending} value={field.value} onValueChange={field.onChange}>
              <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
              <SelectContent>
                {STATUS_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )} />

        {isAdmin && (
          <FormField control={form.control} name="warehouseId" render={({ field }) => (
            <FormItem>
              <FormLabel>Kho hàng <span className="text-destructive">*</span></FormLabel>
              <Select disabled={isPending} value={field.value} onValueChange={field.onChange}>
                <FormControl><SelectTrigger><SelectValue placeholder="Chọn kho hàng" /></SelectTrigger></FormControl>
                <SelectContent>
                  {warehousesData?.data.map((wh: any) => (
                    <SelectItem key={wh.id} value={wh.id}>{wh.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" disabled={isPending} onClick={() => { form.reset(); onClose() }}>Hủy</Button>
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Tạo mới
          </Button>
        </div>
      </form>
    </Form>
  )
}

// ─── Edit form ───────────────────────────────────────────────────────────────

function EditForm({
  pkg,
  isPending,
  updateMutation,
  warehousesData,
  isAdmin,
  onClose,
}: {
  pkg: PackageResponse
  isPending: boolean
  updateMutation: ReturnType<typeof useUpdatePackage>
  warehousesData: any
  isAdmin: boolean
  onClose: () => void
}) {
  const form = useForm<EditValues>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      code: pkg.code,
      price: pkg.price,
      status: pkg.status,
      warehouseId: pkg.warehouseId,
      version: pkg.version, // MUST include version for optimistic locking
    },
  })

  async function onSubmit(values: EditValues) {
    // Only send fields if they exist
    const payload: Record<string, unknown> = { version: values.version }
    if (values.code !== undefined) payload.code = values.code
    if (values.price !== undefined) payload.price = values.price
    if (values.status !== undefined) payload.status = values.status
    if (values.warehouseId !== undefined) payload.warehouseId = values.warehouseId

    await updateMutation.mutateAsync({ id: pkg.id, input: payload as any })
    onClose()
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-1">
        {/* Hidden version field just to keep track, it's submitted anyway */}
        <input type="hidden" {...form.register('version')} />
        
        <FormField control={form.control} name="code" render={({ field }) => (
          <FormItem>
            <FormLabel>Mã kiện hàng</FormLabel>
            <FormControl><Input disabled={isPending} {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name="price" render={({ field }) => (
          <FormItem>
            <FormLabel>Giá trị (VND)</FormLabel>
            <FormControl><Input type="number" disabled={isPending} {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name="status" render={({ field }) => (
          <FormItem>
            <FormLabel>Trạng thái</FormLabel>
            <Select disabled={isPending} value={field.value} onValueChange={field.onChange}>
              <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
              <SelectContent>
                {STATUS_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )} />

        {isAdmin && (
          <FormField control={form.control} name="warehouseId" render={({ field }) => (
            <FormItem>
              <FormLabel>Kho hàng</FormLabel>
              <Select disabled={isPending} value={field.value} onValueChange={field.onChange}>
                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                <SelectContent>
                  {warehousesData?.data.map((wh: any) => (
                    <SelectItem key={wh.id} value={wh.id}>{wh.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" disabled={isPending} onClick={onClose}>Hủy</Button>
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Lưu thay đổi
          </Button>
        </div>
      </form>
    </Form>
  )
}
