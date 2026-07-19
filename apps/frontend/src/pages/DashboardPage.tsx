import { LayoutDashboard } from 'lucide-react'

/**
 * Dashboard page placeholder — Phase 2.
 * Full Dashboard content (cards, charts, reports) will be implemented in Phase 3.
 * Header, Sidebar, and profile actions are handled by ProtectedLayout.
 */
export function DashboardPage() {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[60vh] gap-4 text-center">
      <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20">
        <LayoutDashboard className="w-7 h-7 text-primary/60" />
      </div>
      <div className="space-y-1.5">
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Cards doanh thu và thống kê kiện hàng sẽ được xây dựng trong{' '}
          <span className="font-medium text-primary">Phase 3</span>.
        </p>
      </div>
    </div>
  )
}
