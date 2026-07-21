import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuthStore } from '@/store/authStore'
import { Role } from '@/types/common'
import { useUsers } from '@/features/employees/hooks/useUsers'
import { EmployeeTable } from '@/features/employees/components/EmployeeTable'
import { Users } from 'lucide-react'

const LIMIT = 10

/**
 * Trang Quản lý Nhân viên (/employees) — Phase 4.
 *
 * Role behaviour (per CONTEXT.md §2 + §11):
 * - Admin: Tabs [Manager | Staff] — mỗi tab có bảng riêng, full CRUD
 * - Manager: chỉ thấy Staff thuộc kho mình (BE tự scope), Sửa/Khóa/Mở khóa
 * - Staff: không có quyền (route guard chặn)
 *
 * sortBy options per api-docs: username | email | createdAt | updatedAt
 */
export function EmployeesPage() {
  const { user } = useAuthStore()
  const isAdmin = user?.role === Role.ADMIN
  const isManager = user?.role === Role.MANAGER

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center gap-3">
        {/* <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Users className="h-5 w-5 text-primary" />
        </div> */}
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            Quản lý Nhân viên
          </h1>
          <p className="text-sm text-muted-foreground">
            {isAdmin
              ? 'Quản lý toàn bộ Manager và Staff trong hệ thống'
              : 'Quản lý nhân viên thuộc kho của bạn'}
          </p>
        </div>
      </div>

      {/* Admin: tabbed view — Manager tab + Staff tab */}
      {isAdmin && <AdminEmployeesView currentUserId={user!.id} />}

      {/* Manager: only Staff in their warehouse */}
      {isManager && (
        <ManagerEmployeesView currentUserId={user!.id} />
      )}
    </div>
  )
}

// ─── Admin tabbed view ────────────────────────────────────────────────────────

function AdminEmployeesView({ currentUserId }: { currentUserId: string }) {
  const [managerPage, setManagerPage] = useState(1)
  const [managerSearch, setManagerSearch] = useState('')
  const [staffPage, setStaffPage] = useState(1)
  const [staffSearch, setStaffSearch] = useState('')

  const { data: managerData, isLoading: isManagerLoading } = useUsers({
    role: Role.MANAGER,
    page: managerPage,
    limit: LIMIT,
    search: managerSearch || undefined,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  })

  const { data: staffData, isLoading: isStaffLoading } = useUsers({
    role: Role.STAFF,
    page: staffPage,
    limit: LIMIT,
    search: staffSearch || undefined,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  })

  return (
    <Tabs defaultValue="manager">
      <TabsList>
        <TabsTrigger value="manager" id="tab-managers">
          Manager
          {managerData && (
            <span className="ml-2 text-xs font-normal text-muted-foreground">
              ({managerData.total})
            </span>
          )}
        </TabsTrigger>
        <TabsTrigger value="staff" id="tab-staff">
          Staff
          {staffData && (
            <span className="ml-2 text-xs font-normal text-muted-foreground">
              ({staffData.total})
            </span>
          )}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="manager" className="mt-4">
        <EmployeeTable
          data={managerData?.data ?? []}
          isLoading={isManagerLoading}
          isAdmin={true}
          currentUserId={currentUserId}
          page={managerPage}
          total={managerData?.total ?? 0}
          limit={LIMIT}
          onPageChange={setManagerPage}
          onSearchChange={(s) => { setManagerSearch(s); setManagerPage(1) }}
        />
      </TabsContent>

      <TabsContent value="staff" className="mt-4">
        <EmployeeTable
          data={staffData?.data ?? []}
          isLoading={isStaffLoading}
          isAdmin={true}
          currentUserId={currentUserId}
          page={staffPage}
          total={staffData?.total ?? 0}
          limit={LIMIT}
          onPageChange={setStaffPage}
          onSearchChange={(s) => { setStaffSearch(s); setStaffPage(1) }}
        />
      </TabsContent>
    </Tabs>
  )
}

// ─── Manager view — Staff only in their warehouse ─────────────────────────────

function ManagerEmployeesView({ currentUserId }: { currentUserId: string }) {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')

  // BE automatically scopes to Manager's warehouse — no warehouseId needed
  const { data, isLoading } = useUsers({
    role: Role.STAFF,
    page,
    limit: LIMIT,
    search: search || undefined,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  })

  return (
    <EmployeeTable
      data={data?.data ?? []}
      isLoading={isLoading}
      isAdmin={false}
      currentUserId={currentUserId}
      page={page}
      total={data?.total ?? 0}
      limit={LIMIT}
      onPageChange={setPage}
      onSearchChange={(s) => { setSearch(s); setPage(1) }}
    />
  )
}
