import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, KeyRound } from 'lucide-react'
import { toast } from 'sonner'
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
import { useCreateUser } from '../hooks/useCreateUser'
import { useUpdateUser } from '../hooks/useUpdateUser'
import { useResetPassword } from '../hooks/useResetPassword'
import { useWarehouses } from '@/features/warehouses/hooks/useWarehouses'
import { Role } from '@/types/common'
import type { UserResponse } from '../types'
import { useAuthStore } from '@/store/authStore'

// ─── Schemas per api-docs.json constraints ────────────────────────────────────

const createSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  username: z.string().min(3, 'Ít nhất 3 ký tự').max(50, 'Tối đa 50 ký tự'),
  password: z.string().min(6, 'Mật khẩu ít nhất 6 ký tự'),
  role: z.nativeEnum(Role),
  warehouseId: z.string().nullable().optional(),
})
type CreateValues = z.infer<typeof createSchema>

const editSchema = z.object({
  email: z.string().email('Email không hợp lệ').or(z.literal('')).optional(),
  username: z.string().min(3, 'Ít nhất 3 ký tự').max(50, 'Tối đa 50 ký tự').or(z.literal('')).optional(),
  role: z.nativeEnum(Role).optional(),
  warehouseId: z.string().nullable().optional(),
})
type EditValues = z.infer<typeof editSchema>

// ─── Role options ─────────────────────────────────────────────────────────────

const ALL_ROLE_OPTIONS = [
  { value: Role.ADMIN, label: 'Admin' },
  { value: Role.MANAGER, label: 'Manager' },
  { value: Role.STAFF, label: 'Staff' },
]
const MANAGER_ROLE_OPTIONS = [{ value: Role.STAFF, label: 'Staff' }]

// ─── Props ───────────────────────────────────────────────────────────────────

interface EmployeeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user?: UserResponse
  /** Manager callers see limited role options and no warehouse select */
  isManager?: boolean
}

export function EmployeeDialog({ open, onOpenChange, user, isManager = false }: EmployeeDialogProps) {
  const isEdit = !!user
  const createMutation = useCreateUser()
  const updateMutation = useUpdateUser()
  const resetMutation = useResetPassword()
  const isPending = createMutation.isPending || updateMutation.isPending || resetMutation.isPending
  const { data: warehousesData } = useWarehouses({ enabled: !isManager })
  const roleOptions = isManager ? MANAGER_ROLE_OPTIONS : ALL_ROLE_OPTIONS

  function handleClose() {
    if (!isPending) onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? `Chỉnh sửa: ${user?.username}` : 'Thêm nhân viên mới'}
          </DialogTitle>
        </DialogHeader>
        {isEdit ? (
          <EditForm
            user={user!}
            isPending={isPending}
            updateMutation={updateMutation}
            resetMutation={resetMutation}
            roleOptions={roleOptions}
            warehousesData={warehousesData}
            isManager={isManager}
            onClose={handleClose}
            managerWarehouseId={isManager ? (useAuthStore.getState().user?.warehouseId ?? null) : null}
          />
        ) : (
          <CreateForm
            isPending={isPending}
            createMutation={createMutation}
            roleOptions={roleOptions}
            warehousesData={warehousesData}
            isManager={isManager}
            onClose={handleClose}
            managerWarehouseId={isManager ? (useAuthStore.getState().user?.warehouseId ?? null) : null}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

// ─── Create form ─────────────────────────────────────────────────────────────

function CreateForm({
  isPending, createMutation, roleOptions, warehousesData, isManager, onClose, managerWarehouseId
}: {
  isPending: boolean
  createMutation: ReturnType<typeof useCreateUser>
  roleOptions: { value: Role; label: string }[]
  warehousesData: { data: { id: string; name: string }[] } | undefined
  isManager: boolean
  onClose: () => void
  managerWarehouseId: string | null
}) {
  const form = useForm<CreateValues>({
    resolver: zodResolver(createSchema),
    defaultValues: { email: '', username: '', password: '', role: Role.STAFF, warehouseId: managerWarehouseId },
  })

  async function onSubmit(values: CreateValues) {
    await createMutation.mutateAsync(values)
    form.reset()
    onClose()
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-1">
        <FormField control={form.control} name="email" render={({ field }) => (
          <FormItem>
            <FormLabel>Email <span className="text-destructive">*</span></FormLabel>
            <FormControl><Input id="emp-create-email" type="email" placeholder="staff@miniwms.com" disabled={isPending} {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name="username" render={({ field }) => (
          <FormItem>
            <FormLabel>Tên đăng nhập <span className="text-destructive">*</span></FormLabel>
            <FormControl><Input id="emp-create-username" placeholder="john_doe (viết liền không cách)" disabled={isPending} {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name="password" render={({ field }) => (
          <FormItem>
            <FormLabel>Mật khẩu <span className="text-destructive">*</span></FormLabel>
            <FormControl><Input id="emp-create-password" type="password" placeholder="Tối thiểu 6 ký tự" disabled={isPending} {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name="role" render={({ field }) => (
          <FormItem>
            <FormLabel>Vai trò <span className="text-destructive">*</span></FormLabel>
            <Select disabled={isPending || isManager} value={field.value} onValueChange={field.onChange}>
              <FormControl><SelectTrigger id="emp-create-role"><SelectValue placeholder="Chọn vai trò" /></SelectTrigger></FormControl>
              <SelectContent>{roleOptions.map((r) => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}</SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )} />

        {!isManager && (
          <FormField control={form.control} name="warehouseId" render={({ field }) => (
            <FormItem>
              <FormLabel>Kho hàng</FormLabel>
              <Select disabled={isPending} value={field.value ?? 'none'} onValueChange={(v) => field.onChange(v === 'none' ? null : v)}>
                <FormControl><SelectTrigger id="emp-create-warehouse"><SelectValue placeholder="Không gán kho" /></SelectTrigger></FormControl>
                <SelectContent>
                  <SelectItem value="none">Không gán kho</SelectItem>
                  {warehousesData?.data.map((wh) => <SelectItem key={wh.id} value={wh.id}>{wh.name}</SelectItem>)}
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
            Thêm nhân viên
          </Button>
        </div>
      </form>
    </Form>
  )
}

// ─── Edit form ───────────────────────────────────────────────────────────────

function EditForm({
  user, isPending, updateMutation, resetMutation, roleOptions, warehousesData, isManager, onClose, managerWarehouseId
}: {
  user: UserResponse
  isPending: boolean
  updateMutation: ReturnType<typeof useUpdateUser>
  resetMutation: ReturnType<typeof useResetPassword>
  roleOptions: { value: Role; label: string }[]
  warehousesData: { data: { id: string; name: string }[] } | undefined
  isManager: boolean
  onClose: () => void
  managerWarehouseId: string | null
}) {
  const form = useForm<EditValues>({
    resolver: zodResolver(editSchema),
    defaultValues: { email: user.email, username: user.username, role: user.role, warehouseId: isManager ? managerWarehouseId : user.warehouseId },
  })

  async function handleResetPassword() {
    try {
      const { tempPassword } = await resetMutation.mutateAsync(user.id)
      toast.success(`Mật khẩu mới: ${tempPassword}`, { duration: 15000 })
    } catch (e) {
      // Error handled globally
    }
  }

  async function onSubmit(values: EditValues) {
    const payload: Record<string, unknown> = {}
    if (values.email) payload.email = values.email
    if (values.username) payload.username = values.username
    if (values.role) payload.role = values.role
    if ('warehouseId' in values) payload.warehouseId = values.warehouseId
    await updateMutation.mutateAsync({ id: user.id, input: payload })
    onClose()
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-1">
        <FormField control={form.control} name="email" render={({ field }) => (
          <FormItem>
            <FormLabel>Email</FormLabel>
            <FormControl><Input id="emp-edit-email" type="email" disabled={isPending} {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name="username" render={({ field }) => (
          <FormItem>
            <FormLabel>Tên đăng nhập</FormLabel>
            <FormControl><Input id="emp-edit-username" disabled={isPending} {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <div className="space-y-2">
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Mật khẩu</label>
          <div>
            <Button type="button" variant="outline" size="sm" onClick={handleResetPassword} disabled={isPending}>
              <KeyRound className="mr-2 h-4 w-4" />
              Đặt lại mật khẩu ngẫu nhiên
            </Button>
          </div>
        </div>

        <FormField control={form.control} name="role" render={({ field }) => (
          <FormItem>
            <FormLabel>Vai trò</FormLabel>
            <Select disabled={isPending || isManager} value={field.value} onValueChange={field.onChange}>
              <FormControl><SelectTrigger id="emp-edit-role"><SelectValue /></SelectTrigger></FormControl>
              <SelectContent>{roleOptions.map((r) => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}</SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )} />

        {!isManager && (
          <FormField control={form.control} name="warehouseId" render={({ field }) => (
            <FormItem>
              <FormLabel>Kho hàng</FormLabel>
              <Select disabled={isPending} value={field.value ?? 'none'} onValueChange={(v) => field.onChange(v === 'none' ? null : v)}>
                <FormControl><SelectTrigger id="emp-edit-warehouse"><SelectValue placeholder="Không gán kho" /></SelectTrigger></FormControl>
                <SelectContent>
                  <SelectItem value="none">Không gán kho</SelectItem>
                  {warehousesData?.data.map((wh) => <SelectItem key={wh.id} value={wh.id}>{wh.name}</SelectItem>)}
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
