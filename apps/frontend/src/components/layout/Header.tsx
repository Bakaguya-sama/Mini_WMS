import { Menu, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/store/authStore'
import { Role } from '@/types/common'
import { useQuery } from '@tanstack/react-query'
import { getWarehouseById } from '@/features/warehouses/api/warehouseApi'

// ─── Role badge styling ───────────────────────────────────────────────────────
const roleBadgeClass: Record<Role, string> = {
  [Role.ADMIN]: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
  [Role.MANAGER]: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  [Role.STAFF]: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
}

const roleLabel: Record<Role, string> = {
  [Role.ADMIN]: 'Admin',
  [Role.MANAGER]: 'Manager',
  [Role.STAFF]: 'Staff',
}

interface HeaderProps {
  onMenuToggle: () => void
  /** Slot for ProfileMenu dropdown — injected by ProtectedLayout */
  profileMenu: React.ReactNode
}

export function Header({ onMenuToggle, profileMenu }: HeaderProps) {
  const { user } = useAuthStore()

  // Fetch the warehouse name if the user belongs to a specific warehouse
  const { data: userWarehouse } = useQuery({
    queryKey: ['warehouse', user?.warehouseId],
    queryFn: () => getWarehouseById(user!.warehouseId!),
    enabled: !!user?.warehouseId,
  })

  if (!user) return null

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between h-14 px-4 md:px-6 border-b border-border/50 bg-card/80 backdrop-blur-md">
      {/* Left: Mobile hamburger */}
      <div className="flex items-center gap-3">
        <Button
          id="sidebar-toggle"
          variant="ghost"
          size="icon"
          className="lg:hidden h-8 w-8"
          onClick={onMenuToggle}
          aria-label="Mở menu"
        >
          <Menu className="w-4 h-4" />
        </Button>
      </div>

      {/* Right: User info + actions */}
      <div className="flex items-center gap-3">
        {/* Warehouse Indicator */}
        <div className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-muted-foreground bg-muted/50 px-2.5 py-1 rounded-md border border-border/50">
          <MapPin className="w-3.5 h-3.5" />
          {userWarehouse ? userWarehouse.name : 'Hệ thống'}
        </div>

        {/* Role badge */}
        <span
          className={`hidden sm:inline-flex text-[11px] px-2 py-0.5 rounded-full border font-semibold uppercase tracking-wide ${roleBadgeClass[user.role]}`}
        >
          {roleLabel[user.role]}
        </span>

        {/* ProfileMenu dropdown — rendered by ProtectedLayout */}
        {profileMenu}
      </div>
    </header>
  )
}
