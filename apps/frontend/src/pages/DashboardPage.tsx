import { LayoutDashboard, LogOut, Package2, User } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useLogout } from '@/features/auth/hooks/useLogout'
import { Button } from '@/components/ui/button'
import { Role } from '@/types/common'

const roleBadgeStyle: Record<Role, string> = {
  [Role.ADMIN]: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
  [Role.MANAGER]: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  [Role.STAFF]: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
}

const roleLabel: Record<Role, string> = {
  [Role.ADMIN]: 'Admin',
  [Role.MANAGER]: 'Manager',
  [Role.STAFF]: 'Staff',
}

/**
 * Dashboard placeholder — will be replaced with full Dashboard UI in Phase 3.
 * For Phase 1, demonstrates that:
 * 1. Auth works (user info displayed)
 * 2. Logout works
 * 3. Protected route is functioning
 */
export function DashboardPage() {
  const { user } = useAuthStore()
  const { mutate: logoutMutate, isPending: isLoggingOut } = useLogout()

  if (!user) return null

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package2 className="w-5 h-5 text-primary" />
            <span className="font-semibold text-foreground">Mini WMS</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
                <User className="w-4 h-4 text-primary" />
              </div>
              <div className="text-sm">
                <span className="text-foreground font-medium">{user.username}</span>
              </div>
              <span
                className={`text-xs px-2 py-0.5 rounded-full border font-medium ${roleBadgeStyle[user.role]}`}
              >
                {roleLabel[user.role]}
              </span>
            </div>
            <Button
              id="logout-button"
              variant="ghost"
              size="sm"
              onClick={() => logoutMutate()}
              disabled={isLoggingOut}
              className="gap-1.5"
            >
              <LogOut className="w-4 h-4" />
              {isLoggingOut ? 'Đang đăng xuất...' : 'Đăng xuất'}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content — placeholder */}
      <main className="flex-1 flex flex-col items-center justify-center gap-6 p-8">
        <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/20 border border-primary/30">
          <LayoutDashboard className="w-8 h-8 text-primary" />
        </div>
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Xin chào, <span className="text-foreground font-medium">{user.username}</span>!
            Phase 2 sẽ xây dựng layout đầy đủ và Dashboard thật sự.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-3 text-sm text-muted-foreground mt-4">
          <div className="flex flex-col items-center gap-1 p-3 rounded-lg border border-border/50 bg-card/50">
            <span className="text-xs uppercase tracking-wider">Email</span>
            <span className="text-foreground font-medium">{user.email}</span>
          </div>
          <div className="flex flex-col items-center gap-1 p-3 rounded-lg border border-border/50 bg-card/50">
            <span className="text-xs uppercase tracking-wider">Role</span>
            <span className="text-foreground font-medium">{roleLabel[user.role]}</span>
          </div>
          <div className="flex flex-col items-center gap-1 p-3 rounded-lg border border-border/50 bg-card/50">
            <span className="text-xs uppercase tracking-wider">Kho</span>
            <span className="text-foreground font-medium">
              {user.warehouseId ? user.warehouseId.slice(0, 8) + '...' : 'Toàn hệ thống'}
            </span>
          </div>
        </div>
      </main>
    </div>
  )
}
