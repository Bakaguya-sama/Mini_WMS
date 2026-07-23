import { useState, useEffect } from 'react'
import {
  MoreHorizontal,
  Pencil,
  ShieldBan,
  ShieldCheck,
  Trash2,
  Plus,
  Search,
} from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { EmployeeDialog } from './EmployeeDialog'
import { useBanUser } from '../hooks/useBanUser'
import { useUnbanUser } from '../hooks/useUnbanUser'
import { useDeleteUser } from '../hooks/useDeleteUser'
import { useWarehouses } from '@/features/warehouses/hooks/useWarehouses'
import { getWarehouseById } from '@/features/warehouses/api/warehouseApi'
import { useAuthStore } from '@/store/authStore'
import { useQuery } from '@tanstack/react-query'
import { Role } from '@/types/common'
import type { UserResponse } from '../types'

// ─── Role badge ───────────────────────────────────────────────────────────────

const ROLE_BADGE: Record<Role, { label: string; className: string }> = {
  [Role.ADMIN]: {
    label: 'Admin',
    className: 'bg-violet-500/20 text-violet-600 border-violet-500/30',
  },
  [Role.MANAGER]: {
    label: 'Manager',
    className: 'bg-blue-500/20 text-blue-600 border-blue-500/30',
  },
  [Role.STAFF]: {
    label: 'Staff',
    className: 'bg-emerald-500/20 text-emerald-600 border-emerald-500/30',
  },
}

// ─── Props ───────────────────────────────────────────────────────────────────

interface EmployeeTableProps {
  data: UserResponse[]
  isLoading: boolean
  isAdmin: boolean
  /** Current logged-in user id — prevent self-ban */
  currentUserId: string
  page: number
  total: number
  limit: number
  onPageChange: (page: number) => void
  onSearchChange: (search: string) => void
}

export function EmployeeTable({
  data,
  isLoading,
  isAdmin,
  currentUserId,
  page,
  total,
  limit,
  onPageChange,
  onSearchChange,
}: EmployeeTableProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<UserResponse | undefined>()
  const [deleteTarget, setDeleteTarget] = useState<UserResponse | null>(null)
  const [searchValue, setSearchValue] = useState('')

  const banMutation = useBanUser()
  const unbanMutation = useUnbanUser()
  const deleteMutation = useDeleteUser()

  // Fetch warehouses to map warehouseId -> name (only enabled for admin)
  const { data: warehousesData } = useWarehouses({ enabled: isAdmin })
  
  // For Manager, fetch their specific warehouse
  const { user: currentUser } = useAuthStore()
  const { data: managerWarehouse } = useQuery({
    queryKey: ['warehouse', currentUser?.warehouseId],
    queryFn: () => getWarehouseById(currentUser!.warehouseId!),
    enabled: !isAdmin && !!currentUser?.warehouseId,
  })

  const warehouseMap = new Map(
    warehousesData?.data.map((w) => [w.id, w.name]) || []
  )
  if (managerWarehouse) {
    warehouseMap.set(managerWarehouse.id, managerWarehouse.name)
  }

  // Auto-search debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange(searchValue)
      onPageChange(1)
    }, 1000)
    return () => clearTimeout(timer)
  }, [searchValue])

  const totalPages = Math.ceil(total / limit)

  function handleEdit(user: UserResponse) {
    setEditingUser(user)
    setDialogOpen(true)
  }

  function handleAddNew() {
    setEditingUser(undefined)
    setDialogOpen(true)
  }

  function handleBanToggle(user: UserResponse) {
    if (user.isBanned) {
      unbanMutation.mutate(user.id)
    } else {
      banMutation.mutate(user.id)
    }
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget) return
    await deleteMutation.mutateAsync(deleteTarget.id)
    setDeleteTarget(null)
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSearchChange(searchValue)
    onPageChange(1)
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="employee-search"
              className="pl-8 w-[280px] h-10"
              placeholder="Tìm theo tên / email..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
          </div>
          <Button type="submit" variant="outline" className="h-10 px-6">Tìm</Button>
        </form>

        <Button id="btn-add-employee" onClick={handleAddNew} className="h-10 px-4">
          <Plus className="mr-1.5 h-4 w-4" />
          Thêm nhân viên
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-md border border-border overflow-hidden">
        <Table>
          <TableHeader className="sticky top-0 bg-muted/50">
            <TableRow>
              <TableHead>Tên đăng nhập</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Vai trò</TableHead>
              <TableHead>Kho</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Ngày tạo</TableHead>
              <TableHead className="text-right w-[80px]">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 7 }).map((__, j) => (
                    <TableCell key={j}><Skeleton className="h-5 w-full" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-10">
                  Không có nhân viên nào
                </TableCell>
              </TableRow>
            ) : (
              data.map((user) => {
                const roleCfg = ROLE_BADGE[user.role]
                const isSelf = user.id === currentUserId
                const canBan = !isSelf && user.role !== Role.ADMIN
                return (
                  <TableRow key={user.id} className={user.isBanned ? 'opacity-60' : ''}>
                    <TableCell className="font-medium">{user.username}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{user.email}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`text-xs font-semibold ${roleCfg.className}`}
                      >
                        {roleCfg.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm font-medium">
                      {user.warehouseId
                        ? warehouseMap.get(user.warehouseId) || 'Không xác định'
                        : 'Hệ thống'}
                    </TableCell>
                    <TableCell>
                      {user.isBanned ? (
                        <Badge
                          variant="outline"
                          className="text-xs bg-red-500/10 text-red-600 border-red-500/30"
                        >
                          Đã khóa
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="text-xs bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                        >
                          Hoạt động
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Thao tác</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {/* Edit — Admin/Manager */}
                          <DropdownMenuItem onClick={() => handleEdit(user)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Chỉnh sửa
                          </DropdownMenuItem>

                          {/* Ban/Unban — Admin/Manager (not self, not admin) */}
                          {canBan && (
                            <DropdownMenuItem
                              onClick={() => handleBanToggle(user)}
                              className={user.isBanned
                                ? 'text-emerald-600 focus:text-emerald-600'
                                : 'text-amber-600 focus:text-amber-600'}
                            >
                              {user.isBanned ? (
                                <>
                                  <ShieldCheck className="mr-2 h-4 w-4" />
                                  Mở khóa
                                </>
                              ) : (
                                <>
                                  <ShieldBan className="mr-2 h-4 w-4" />
                                  Khóa tài khoản
                                </>
                              )}
                            </DropdownMenuItem>
                          )}

                          {/* Delete — Admin only, separate section */}
                          {isAdmin && !isSelf && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => setDeleteTarget(user)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Xóa vĩnh viễn
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Tổng {total} nhân viên</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
              Trước
            </Button>
            <span className="flex items-center px-2">{page} / {totalPages}</span>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
              Sau
            </Button>
          </div>
        </div>
      )}

      {/* Create/Edit dialog */}
      <EmployeeDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        user={editingUser}
        isManager={!isAdmin}
      />

      {/* Delete confirm — Admin only */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa tài khoản nhân viên</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn sắp xóa tài khoản{' '}
              <span className="font-semibold text-foreground">"{deleteTarget?.username}"</span>{' '}
              ({deleteTarget?.email}). Hành động này{' '}
              <span className="text-destructive font-semibold">không thể hoàn tác</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDeleteConfirm}
              disabled={deleteMutation.isPending}
            >
              Xóa vĩnh viễn
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
