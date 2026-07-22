import { NavLink, useLocation } from "react-router-dom";
import { LayoutDashboard, Package, Warehouse, Users, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import { Role } from "@/types/common";
import { Button } from "@/components/ui/button";

// ─── Nav item definition ──────────────────────────────────────────────────────
interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  /** If specified, only these roles can see this item */
  allowedRoles?: Role[];
}

const NAV_ITEMS: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    allowedRoles: [Role.ADMIN, Role.MANAGER],
  },
  {
    label: "Kiện hàng",
    href: "/packages",
    icon: Package,
  },
  {
    label: "Kho hàng",
    href: "/warehouses",
    icon: Warehouse,
    allowedRoles: [Role.ADMIN, Role.MANAGER],
  },
  {
    label: "Nhân viên",
    href: "/employees",
    icon: Users,
    allowedRoles: [Role.ADMIN, Role.MANAGER],
  },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const { user } = useAuthStore();
  const location = useLocation();

  const visibleItems = NAV_ITEMS.filter((item) => {
    if (!item.allowedRoles) return true;
    if (!user) return false;
    return item.allowedRoles.includes(user.role);
  });

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-border/50 bg-card/80 backdrop-blur-md",
          "transition-transform duration-300 ease-in-out",
          "lg:static lg:translate-x-0 lg:z-auto lg:flex",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-center px-4 py-4 border-b border-border/50">
          <div className="flex items-center gap-2.5">
            {/* <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/20 border border-primary/30">
              <Package className="w-4 h-4 text-primary" />
            </div> */}
            <div>
              <span className="text-2xl font-bold items-center text-foreground tracking-tight">
                Mini WMS
              </span>
            </div>
          </div>
          {/* Close button — mobile only */}
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 lg:hidden"
            onClick={onClose}
            aria-label="Đóng menu"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {visibleItems.map((item) => {
            const isActive =
              item.href === "/dashboard"
                ? location.pathname === "/dashboard"
                : location.pathname.startsWith(item.href);

            return (
              <NavLink
                key={item.href}
                to={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium",
                  "transition-all duration-150",
                  isActive
                    ? "bg-primary/15 text-primary border border-primary/20 shadow-sm shadow-primary/10"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground border border-transparent",
                )}
                aria-current={isActive ? "page" : undefined}
              >
                <item.icon
                  className={cn(
                    "w-4 h-4 flex-shrink-0",
                    isActive ? "text-primary" : "text-muted-foreground",
                  )}
                />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        {/* Sidebar Footer — role indicator */}
        {/* <div className="px-4 py-3 border-t border-border/50">
          <p className="text-[11px] text-muted-foreground">
            Đăng nhập với quyền{" "}
            <span className="font-semibold text-foreground">
              {user?.role ?? "—"}
            </span>
          </p>
        </div> */}
      </aside>
    </>
  );
}
