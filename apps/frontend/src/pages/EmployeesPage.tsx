import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuthStore } from "@/store/authStore";
import { Role } from "@/types/common";
import { useUsers } from "@/features/employees/hooks/useUsers";
import { EmployeeTable } from "@/features/employees/components/EmployeeTable";

const LIMIT = 10;

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
  const { user } = useAuthStore();
  const isAdmin = user?.role === Role.ADMIN;
  const isManager = user?.role === Role.MANAGER;

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
              ? "Quản lý toàn bộ Manager và Staff trong hệ thống"
              : "Quản lý nhân viên thuộc kho của bạn"}
          </p>
        </div>
      </div>

      {/* Admin: tabbed view — Manager tab + Staff tab */}
      {isAdmin && <AdminEmployeesView currentUserId={user!.id} />}

      {/* Manager: only Staff in their warehouse */}
      {isManager && <ManagerEmployeesView currentUserId={user!.id} />}
    </div>
  );
}

// ─── Admin tabbed view ────────────────────────────────────────────────────────

function AdminEmployeesView({ currentUserId }: { currentUserId: string }) {
  const [managerParams, setManagerParams] = useState({
    page: 1, search: "", isBanned: undefined as boolean | undefined, warehouseId: undefined as string | undefined,
    sortBy: "createdAt" as "username" | "email" | "createdAt" | "updatedAt", sortOrder: "desc" as "asc" | "desc"
  });

  const [staffParams, setStaffParams] = useState({
    page: 1, search: "", isBanned: undefined as boolean | undefined, warehouseId: undefined as string | undefined,
    sortBy: "createdAt" as "username" | "email" | "createdAt" | "updatedAt", sortOrder: "desc" as "asc" | "desc"
  });

  const { data: managerData, isLoading: isManagerLoading } = useUsers({
    role: Role.MANAGER,
    limit: LIMIT,
    ...managerParams,
    search: managerParams.search || undefined,
  });

  const { data: staffData, isLoading: isStaffLoading } = useUsers({
    role: Role.STAFF,
    limit: LIMIT,
    ...staffParams,
    search: staffParams.search || undefined,
  });

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
          total={managerData?.total ?? 0}
          limit={LIMIT}
          page={managerParams.page}
          onPageChange={(page) => setManagerParams(p => ({ ...p, page }))}
          onSearchChange={(search) => setManagerParams(p => ({ ...p, search, page: 1 }))}
          isBannedFilter={managerParams.isBanned}
          onIsBannedFilterChange={(isBanned) => setManagerParams(p => ({ ...p, isBanned, page: 1 }))}
          warehouseIdFilter={managerParams.warehouseId}
          onWarehouseIdFilterChange={(warehouseId) => setManagerParams(p => ({ ...p, warehouseId, page: 1 }))}
          sortBy={managerParams.sortBy}
          sortOrder={managerParams.sortOrder}
          onSortChange={(field) => {
            setManagerParams(p => {
              if (p.sortBy === field) {
                return { ...p, sortOrder: p.sortOrder === 'asc' ? 'desc' : 'asc' };
              }
              return { ...p, sortBy: field, sortOrder: 'asc' };
            });
          }}
        />
      </TabsContent>

      <TabsContent value="staff" className="mt-4">
        <EmployeeTable
          data={staffData?.data ?? []}
          isLoading={isStaffLoading}
          isAdmin={true}
          currentUserId={currentUserId}
          total={staffData?.total ?? 0}
          limit={LIMIT}
          page={staffParams.page}
          onPageChange={(page) => setStaffParams(p => ({ ...p, page }))}
          onSearchChange={(search) => setStaffParams(p => ({ ...p, search, page: 1 }))}
          isBannedFilter={staffParams.isBanned}
          onIsBannedFilterChange={(isBanned) => setStaffParams(p => ({ ...p, isBanned, page: 1 }))}
          warehouseIdFilter={staffParams.warehouseId}
          onWarehouseIdFilterChange={(warehouseId) => setStaffParams(p => ({ ...p, warehouseId, page: 1 }))}
          sortBy={staffParams.sortBy}
          sortOrder={staffParams.sortOrder}
          onSortChange={(field) => {
            setStaffParams(p => {
              if (p.sortBy === field) {
                return { ...p, sortOrder: p.sortOrder === 'asc' ? 'desc' : 'asc' };
              }
              return { ...p, sortBy: field, sortOrder: 'asc' };
            });
          }}
        />
      </TabsContent>
    </Tabs>
  );
}

// ─── Manager view — Staff only in their warehouse ─────────────────────────────

function ManagerEmployeesView({ currentUserId }: { currentUserId: string }) {
  const [params, setParams] = useState({
    page: 1, search: "", isBanned: undefined as boolean | undefined,
    sortBy: "createdAt" as "username" | "email" | "createdAt" | "updatedAt", sortOrder: "desc" as "asc" | "desc"
  });

  // BE automatically scopes to Manager's warehouse — no warehouseId needed
  const { data, isLoading } = useUsers({
    role: Role.STAFF,
    limit: LIMIT,
    ...params,
    search: params.search || undefined,
  });

  return (
    <EmployeeTable
      data={data?.data ?? []}
      isLoading={isLoading}
      isAdmin={false}
      currentUserId={currentUserId}
      total={data?.total ?? 0}
      limit={LIMIT}
      page={params.page}
      onPageChange={(page) => setParams(p => ({ ...p, page }))}
      onSearchChange={(search) => setParams(p => ({ ...p, search, page: 1 }))}
      isBannedFilter={params.isBanned}
      onIsBannedFilterChange={(isBanned) => setParams(p => ({ ...p, isBanned, page: 1 }))}
      sortBy={params.sortBy}
      sortOrder={params.sortOrder}
      onSortChange={(field) => {
        setParams(p => {
          if (p.sortBy === field) {
            return { ...p, sortOrder: p.sortOrder === 'asc' ? 'desc' : 'asc' };
          }
          return { ...p, sortBy: field, sortOrder: 'asc' };
        });
      }}
    />
  );
}
