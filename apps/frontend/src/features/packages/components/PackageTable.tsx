import { useState } from 'react'
import {
  MoreHorizontal,
  Pencil,
  ArrowUpDown,
  ArrowDown,
  ArrowUp,
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
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { PackageDialog } from './PackageDialog'
import { PackageStatusBadge } from './PackageStatusBadge'
import { useUpdatePackage } from '../hooks/useUpdatePackage'
import { PackageStatus, PackageResponse } from '../types'
import { Role } from '@/types/common'

interface PackageTableProps {
  data: PackageResponse[]
  isLoading: boolean
  userRole: Role
  managerWarehouseId?: string | null
  page: number
  total: number
  limit: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  onPageChange: (page: number) => void
  onSortChange: (sortBy: string, sortOrder: 'asc' | 'desc') => void
}

export function PackageTable({
  data,
  isLoading,
  userRole,
  managerWarehouseId,
  page,
  total,
  limit,
  sortBy,
  sortOrder,
  onPageChange,
  onSortChange,
}: PackageTableProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingPkg, setEditingPkg] = useState<PackageResponse | undefined>()
  
  const updateMutation = useUpdatePackage()
  const isAdmin = userRole === Role.ADMIN
  const isStaff = userRole === Role.STAFF
  const totalPages = Math.ceil(total / limit)

  function formatCurrency(value: number) {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(value)
  }

  function handleEdit(pkg: PackageResponse) {
    setEditingPkg(pkg)
    setDialogOpen(true)
  }

  async function handleStatusChangeInline(pkg: PackageResponse, newStatus: PackageStatus) {
    if (newStatus === pkg.status) return
    // Optimistic locking: pass version
    await updateMutation.mutateAsync({
      id: pkg.id,
      input: { status: newStatus, version: pkg.version },
    })
  }

  function renderSortIcon(columnName: string) {
    if (sortBy !== columnName) return <ArrowUpDown className="ml-2 h-4 w-4 text-muted-foreground/50" />
    return sortOrder === 'asc' ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />
  }

  function toggleSort(columnName: string) {
    if (sortBy === columnName) {
      onSortChange(columnName, sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      onSortChange(columnName, 'desc')
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border border-border overflow-hidden">
        <Table>
          <TableHeader className="sticky top-0 bg-muted/50">
            <TableRow>
              <TableHead 
                className="cursor-pointer hover:bg-muted/80" 
                onClick={() => toggleSort('code')}
              >
                <div className="flex items-center">Mã kiện hàng {renderSortIcon('code')}</div>
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted/80" 
                onClick={() => toggleSort('price')}
              >
                <div className="flex items-center">Giá trị {renderSortIcon('price')}</div>
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted/80" 
                onClick={() => toggleSort('status')}
              >
                <div className="flex items-center">Trạng thái {renderSortIcon('status')}</div>
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted/80" 
                onClick={() => toggleSort('createdAt')}
              >
                <div className="flex items-center">Ngày tạo {renderSortIcon('createdAt')}</div>
              </TableHead>
              {/* Only Admin/Manager have a general Actions column, but keep header consistent */}
              <TableHead className="text-right w-[80px]">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 5 }).map((__, j) => (
                    <TableCell key={j}><Skeleton className="h-5 w-full" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-10">
                  Không có kiện hàng nào
                </TableCell>
              </TableRow>
            ) : (
              data.map((pkg) => (
                <TableRow key={pkg.id}>
                  <TableCell className="font-medium">{pkg.code}</TableCell>
                  <TableCell>{formatCurrency(pkg.price)}</TableCell>
                  <TableCell>
                    {isStaff ? (
                      <div className="w-[140px]">
                        <Select
                          disabled={updateMutation.isPending}
                          value={pkg.status}
                          onValueChange={(val) => handleStatusChangeInline(pkg, val as PackageStatus)}
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={PackageStatus.PENDING}>Chờ xử lý</SelectItem>
                            <SelectItem value={PackageStatus.IN_TRANSIT}>Đang giao</SelectItem>
                            <SelectItem value={PackageStatus.DELIVERED}>Đã giao</SelectItem>
                            <SelectItem value={PackageStatus.CANCELLED}>Đã hủy</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    ) : (
                      <PackageStatusBadge status={pkg.status} />
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(pkg.createdAt).toLocaleDateString('vi-VN')}
                  </TableCell>
                  <TableCell className="text-right">
                    {!isStaff && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Thao tác</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(pkg)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Chỉnh sửa
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Tổng {total} kiện hàng</span>
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

      {/* Re-use PackageDialog for Editing, passed via handleEdit */}
      {!isStaff && (
        <PackageDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          pkg={editingPkg}
          isAdmin={isAdmin}
          managerWarehouseId={managerWarehouseId}
        />
      )}
    </div>
  )
}
