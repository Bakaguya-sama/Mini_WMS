import { useState } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAuthStore } from '@/store/authStore'
import { Role } from '@/types/common'
import { useFinancialReport } from '@/features/dashboard/hooks/useFinancialReport'
import { usePackageStatusReport } from '@/features/dashboard/hooks/usePackageStatusReport'
import { useWarehouses } from '@/features/warehouses/hooks/useWarehouses'
import { FinancialReportCard } from '@/features/dashboard/components/FinancialReportCard'
import { PackageStatusReport } from '@/features/dashboard/components/PackageStatusReport'
import { WarehouseBreakdownTable } from '@/features/dashboard/components/WarehouseBreakdownTable'
import { DashboardSkeleton } from '@/features/dashboard/components/DashboardSkeleton'
import { AlertCircle } from 'lucide-react'

const ROLE_LABEL: Record<Role, string> = {
  [Role.ADMIN]: 'Admin',
  [Role.MANAGER]: 'Manager',
  [Role.STAFF]: 'Staff',
}

/**
 * Dashboard page — full implementation (Phase 3).
 *
 * Role behaviour (per CONTEXT.md §8):
 * - Admin: Revenue card + filter by warehouse or system-wide + byWarehouse breakdown
 * - Manager: Revenue card (own warehouse, BE scopes automatically) + no filter
 * - Staff: Only "Tong kien hang" card (no revenue)
 *
 * Data freshness: refetchInterval=10s inherited from global queryClient (per CONTEXT §7).
 */
export function DashboardPage() {
  const { user } = useAuthStore()
  const isAdmin = user?.role === Role.ADMIN
  const isStaff = user?.role === Role.STAFF

  // Admin-only: warehouse filter state
  // 'all' = no warehouseId param (system-wide, returns byWarehouse[])
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>('all')

  // Warehouses list for Admin filter dropdown
  const { data: warehousesData } = useWarehouses()

  // Financial report — Admin passes warehouseId filter if not 'all'
  const financialParams =
    isAdmin && selectedWarehouseId !== 'all'
      ? { warehouseId: selectedWarehouseId }
      : undefined

  const {
    data: financialData,
    isLoading: isFinancialLoading,
    isError: isFinancialError,
  } = useFinancialReport(isStaff ? undefined : financialParams)

  // Package status report — all roles
  const {
    data: statusData,
    isLoading: isStatusLoading,
    isError: isStatusError,
  } = usePackageStatusReport()

  const isLoading = isFinancialLoading || isStatusLoading
  const isError = isFinancialError || isStatusError

  if (isLoading) {
    return <DashboardSkeleton />
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            Dashboard
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Xin chào,{' '}
            <span className="font-medium text-foreground">{user?.username}</span>
            {' · '}
            <span className="text-muted-foreground">
              {ROLE_LABEL[user?.role ?? Role.STAFF]}
            </span>
          </p>
        </div>

        {/* Admin-only: warehouse filter */}
        {isAdmin && (
          <Select
            value={selectedWarehouseId}
            onValueChange={setSelectedWarehouseId}
          >
            <SelectTrigger
              id="dashboard-warehouse-filter"
              className="w-[220px]"
              aria-label="Lọc theo kho"
            >
              <SelectValue placeholder="Toàn hệ thống" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toàn hệ thống</SelectItem>
              {warehousesData?.data.map((wh) => (
                <SelectItem key={wh.id} value={wh.id}>
                  {wh.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Error state */}
      {isError && (
        <div className="flex items-center gap-2 p-4 rounded-lg border border-destructive/30 bg-destructive/10 text-destructive text-sm">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>
            Không thể tải dữ liệu dashboard. Vui lòng thử lại hoặc làm mới
            trang.
          </span>
        </div>
      )}

      {/* Financial report cards */}
      {!isStaff && financialData && (
        <FinancialReportCard
          totalRevenue={financialData.totalRevenue}
          totalPackages={financialData.totalPackages}
          showRevenue={true}
        />
      )}

      {/* Staff: only package count card */}
      {isStaff && financialData && (
        <FinancialReportCard
          totalRevenue={0}
          totalPackages={financialData.totalPackages}
          showRevenue={false}
        />
      )}

      {/* Admin system-wide: warehouse breakdown table */}
      {isAdmin &&
        selectedWarehouseId === 'all' &&
        financialData?.byWarehouse &&
        financialData.byWarehouse.length > 0 && (
          <WarehouseBreakdownTable data={financialData.byWarehouse} />
        )}

      {/* Package status report — all roles */}
      {statusData && <PackageStatusReport data={statusData} />}
    </div>
  )
}
