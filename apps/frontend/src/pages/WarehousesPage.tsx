import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";
import { Role } from "@/types/common";
import { useWarehouseList } from "@/features/warehouses/hooks/useWarehouseList";
import { getWarehouseById } from "@/features/warehouses/api/warehouseApi";
import { WarehouseTable } from "@/features/warehouses/components/WarehouseTable";
import type { WarehouseResponse } from "@/features/warehouses/types";

const LIMIT = 10;

/**
 * Trang Quản lý Kho hàng (/warehouses) — Phase 4.
 *
 * Role behaviour (per CONTEXT.md §2):
 * - Admin: xem toàn bộ danh sách, thêm/sửa/xóa mọi kho
 * - Manager: chỉ xem kho của mình, được sửa tên kho đó
 * - Staff: không có quyền (route guard chặn, trang này không render)
 */
export function WarehousesPage() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === Role.ADMIN;
  const isManager = user?.role === Role.MANAGER;

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center gap-3">
        {/* <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Building2 className="h-5 w-5 text-primary" />
        </div> */}
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            Quản lý Kho hàng
          </h1>
          <p className="text-sm text-muted-foreground">
            {isAdmin
              ? "Quản lý toàn bộ kho hàng trong hệ thống"
              : "Thông tin kho hàng của bạn"}
          </p>
        </div>
      </div>

      {isAdmin && (
        <AdminWarehouseView
          page={page}
          search={search}
          onPageChange={setPage}
          onSearchChange={(s) => {
            setSearch(s);
            setPage(1);
          }}
        />
      )}

      {isManager && <ManagerWarehouseView warehouseId={user?.warehouseId} />}
    </div>
  );
}

// ─── Admin subview ────────────────────────────────────────────────────────────

function AdminWarehouseView({
  page,
  search,
  onPageChange,
  onSearchChange,
}: {
  page: number;
  search: string;
  onPageChange: (p: number) => void;
  onSearchChange: (s: string) => void;
}) {
  const { data, isLoading } = useWarehouseList(
    { page, limit: LIMIT, search: search || undefined },
    { enabled: true },
  );

  return (
    <WarehouseTable
      data={data?.data ?? []}
      isLoading={isLoading}
      isAdmin={true}
      currentUserWarehouseId={null}
      page={page}
      total={data?.total ?? 0}
      limit={LIMIT}
      onPageChange={onPageChange}
      onSearchChange={onSearchChange}
    />
  );
}

// ─── Manager subview — single warehouse via GET /warehouses/:id ───────────────

function ManagerWarehouseView({
  warehouseId,
}: {
  warehouseId: string | null | undefined;
}) {
  const { data, isLoading } = useQuery<WarehouseResponse>({
    queryKey: ["warehouses", "by-id", warehouseId],
    queryFn: () => getWarehouseById(warehouseId!),
    enabled: !!warehouseId,
  });

  const warehouseList: WarehouseResponse[] = data ? [data] : [];

  return (
    <WarehouseTable
      data={warehouseList}
      isLoading={isLoading}
      isAdmin={false}
      currentUserWarehouseId={warehouseId}
      page={1}
      total={warehouseList.length}
      limit={10}
      onPageChange={() => {}}
      onSearchChange={() => {}}
    />
  );
}
