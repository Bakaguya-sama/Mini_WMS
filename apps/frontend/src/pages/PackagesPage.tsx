import { useState, useEffect } from 'react'
import { Search, Plus } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { Role } from '@/types/common'
import { usePackages } from '@/features/packages/hooks/usePackages'
import { useWarehouses } from '@/features/warehouses/hooks/useWarehouses'
import { PackageTable } from '@/features/packages/components/PackageTable'
import { PackageDialog } from '@/features/packages/components/PackageDialog'
import { PackageStatus } from '@/features/packages/types'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const LIMIT = 10

export function PackagesPage() {
  const { user } = useAuthStore()
  if (!user) return null

  const isAdmin = user.role === Role.ADMIN
  const isManager = user.role === Role.MANAGER
  const isStaff = user.role === Role.STAFF

  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('') // for the input field before submit
  const [statusFilter, setStatusFilter] = useState<PackageStatus | 'ALL'>('ALL')
  const [warehouseFilter, setWarehouseFilter] = useState<string>('ALL')

  const [sortBy, setSortBy] = useState<string>('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  const [createDialogOpen, setCreateDialogOpen] = useState(false)

  // Auto-search debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput)
      setPage(1)
    }, 1000)
    return () => clearTimeout(timer)
  }, [searchInput])

  // Fetch warehouses for Admin filter
  const { data: warehousesData } = useWarehouses({ enabled: isAdmin })

  // Query packages
  const { data, isLoading } = usePackages({
    page,
    limit: LIMIT,
    search: search || undefined,
    status: statusFilter === 'ALL' ? undefined : statusFilter,
    warehouseId: (isAdmin && warehouseFilter !== 'ALL') ? warehouseFilter : undefined,
    sortBy: sortBy as any,
    sortOrder,
  })

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSearch(searchInput)
    setPage(1)
  }

  function handleSortChange(newSortBy: string, newSortOrder: 'asc' | 'desc') {
    setSortBy(newSortBy)
    setSortOrder(newSortOrder)
    setPage(1)
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center gap-3">
        {/* <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Package className="h-5 w-5 text-primary" />
        </div> */}
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            Quản lý Kiện hàng
          </h1>
          <p className="text-sm text-muted-foreground">
            {isAdmin ? 'Quản lý toàn bộ kiện hàng trong hệ thống' : 'Quản lý kiện hàng trong kho của bạn'}
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex flex-wrap gap-2 items-center">
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-8 w-[280px] h-10"
                placeholder="Tìm mã kiện hàng..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>
            <Button type="submit" variant="outline" className="h-10 px-6">Tìm</Button>
          </form>

          <Select
            value={statusFilter}
            onValueChange={(v) => { setStatusFilter(v as any); setPage(1) }}
          >
            <SelectTrigger className="w-[180px] h-10">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
              <SelectItem value={PackageStatus.PENDING}>Chờ xử lý</SelectItem>
              <SelectItem value={PackageStatus.IN_TRANSIT}>Đang giao</SelectItem>
              <SelectItem value={PackageStatus.DELIVERED}>Đã giao</SelectItem>
              <SelectItem value={PackageStatus.CANCELLED}>Đã hủy</SelectItem>
            </SelectContent>
          </Select>

          {isAdmin && (
            <Select
              value={warehouseFilter}
              onValueChange={(v) => { setWarehouseFilter(v); setPage(1) }}
            >
              <SelectTrigger className="w-[220px] h-10">
                <SelectValue placeholder="Chọn kho" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tất cả kho hàng</SelectItem>
                {warehousesData?.data.map((wh) => (
                  <SelectItem key={wh.id} value={wh.id}>{wh.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Create button for Admin and Manager only */}
        {!isStaff && (
          <Button onClick={() => setCreateDialogOpen(true)} className="h-10 px-4">
            <Plus className="mr-1.5 h-4 w-4" />
            Thêm kiện hàng
          </Button>
        )}
      </div>

      {/* Main Table */}
      <PackageTable
        data={data?.data ?? []}
        isLoading={isLoading}
        userRole={user.role}
        managerWarehouseId={isManager ? user.warehouseId : null}
        page={page}
        total={data?.total ?? 0}
        limit={LIMIT}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onPageChange={setPage}
        onSortChange={handleSortChange}
      />

      {/* Create Dialog */}
      {!isStaff && (
        <PackageDialog
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
          isAdmin={isAdmin}
          managerWarehouseId={isManager ? user.warehouseId : null}
        />
      )}
    </div>
  )
}
