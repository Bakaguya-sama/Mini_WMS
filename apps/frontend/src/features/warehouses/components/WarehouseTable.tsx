import { useState } from 'react'
import { Pencil, Trash2, MoreHorizontal, Plus, Search } from 'lucide-react'
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
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { WarehouseDialog } from './WarehouseDialog'
import { useDeleteWarehouse } from '../hooks/useDeleteWarehouse'
import type { WarehouseResponse } from '../types'

interface WarehouseTableProps {
  data: WarehouseResponse[]
  isLoading: boolean
  isAdmin: boolean
  /** Current user's warehouseId — Manager can only edit their own */
  currentUserWarehouseId?: string | null
  // Pagination props
  page: number
  total: number
  limit: number
  onPageChange: (page: number) => void
  onSearchChange: (search: string) => void
}

export function WarehouseTable({
  data,
  isLoading,
  isAdmin,
  currentUserWarehouseId,
  page,
  total,
  limit,
  onPageChange,
  onSearchChange,
}: WarehouseTableProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingWarehouse, setEditingWarehouse] = useState<WarehouseResponse | undefined>()
  const [deleteTarget, setDeleteTarget] = useState<WarehouseResponse | null>(null)
  const [searchValue, setSearchValue] = useState('')
  const deleteMutation = useDeleteWarehouse()

  const totalPages = Math.ceil(total / limit)

  function handleEdit(wh: WarehouseResponse) {
    setEditingWarehouse(wh)
    setDialogOpen(true)
  }

  function handleAddNew() {
    setEditingWarehouse(undefined)
    setDialogOpen(true)
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
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="warehouse-search"
              className="pl-8 w-[240px]"
              placeholder="Tìm theo tên kho..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
          </div>
          <Button type="submit" variant="outline" size="sm">Tìm</Button>
        </form>

        {isAdmin && (
          <Button id="btn-add-warehouse" onClick={handleAddNew} size="sm">
            <Plus className="mr-1.5 h-4 w-4" />
            Thêm kho mới
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="rounded-md border border-border overflow-hidden">
        <Table>
          <TableHeader className="sticky top-0 bg-muted/50">
            <TableRow>
              <TableHead className="w-[280px]">Tên kho</TableHead>
              <TableHead>Mã kho (ID)</TableHead>
              <TableHead>Ngày tạo</TableHead>
              <TableHead className="text-right w-[80px]">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 4 }).map((__, j) => (
                    <TableCell key={j}><Skeleton className="h-5 w-full" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-10">
                  Không có kho hàng nào
                </TableCell>
              </TableRow>
            ) : (
              data.map((wh) => {
                const canEdit = isAdmin || wh.id === currentUserWarehouseId
                return (
                  <TableRow key={wh.id}>
                    <TableCell className="font-medium">{wh.name}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">{wh.id}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(wh.createdAt).toLocaleDateString('vi-VN')}
                    </TableCell>
                    <TableCell className="text-right">
                      {canEdit && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Thao tác</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(wh)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Sửa tên
                            </DropdownMenuItem>
                            {isAdmin && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-destructive focus:text-destructive"
                                  onClick={() => setDeleteTarget(wh)}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Xóa kho
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
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
          <span>Tổng {total} kho</span>
          <div className="flex gap-2">
            <Button
              variant="outline" size="sm"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
            >Trước</Button>
            <span className="flex items-center px-2">{page} / {totalPages}</span>
            <Button
              variant="outline" size="sm"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
            >Sau</Button>
          </div>
        </div>
      )}

      {/* Create/Edit dialog */}
      <WarehouseDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        warehouse={editingWarehouse}
      />

      {/* Delete confirm dialog — Admin only */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa kho hàng</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn sắp xóa kho <span className="font-semibold text-foreground">"{deleteTarget?.name}"</span>.
              Hành động này không thể hoàn tác. Các dữ liệu liên quan có thể bị ảnh hưởng.
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
