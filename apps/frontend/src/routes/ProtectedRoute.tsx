import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { Role } from '@/types/common'

interface ProtectedRouteProps {
  /** If specified, user must have one of these roles. Otherwise, just need to be authenticated. */
  allowedRoles?: Role[]
}

/**
 * Route guard component.
 *
 * - If user is not authenticated (no user in store): redirect to /login
 * - If allowedRoles is specified and user's role is not in it: show 403
 * - Otherwise: render child routes via <Outlet />
 */
export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { user } = useAuthStore()

  // Not authenticated → redirect to login
  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Role check (if specific roles required)
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-destructive/20 border border-destructive/30">
          <span className="text-2xl">🚫</span>
        </div>
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-foreground">Không đủ quyền</h1>
          <p className="text-muted-foreground">
            Tài khoản của bạn không có quyền truy cập trang này.
          </p>
        </div>
        <a
          href="/dashboard"
          className="text-sm text-primary hover:underline"
        >
          ← Quay về Dashboard
        </a>
      </div>
    )
  }

  return <Outlet />
}
