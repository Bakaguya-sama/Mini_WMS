import { createBrowserRouter, Navigate } from 'react-router-dom'
import { ProtectedRoute } from './ProtectedRoute'
import { ProtectedLayout } from '@/components/layout/ProtectedLayout'
import { ProfileMenu } from '@/features/profile/components/ProfileMenu'
import { LoginPage } from '@/pages/LoginPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { WarehousesPage } from '@/pages/WarehousesPage'
import { EmployeesPage } from '@/pages/EmployeesPage'
import { PackagesPage } from '@/pages/PackagesPage'


/**
 * Application router.
 * Phase 2: ProtectedLayout wraps all authenticated routes.
 * ProfileMenu is injected here to avoid circular import (Layout → Profile → Logout → Layout).
 */
export const router = createBrowserRouter([
  // ── Public routes ──────────────────────────────────────────────────────────
  {
    path: '/login',
    element: <LoginPage />,
  },

  // ── Protected routes — wrapped in ProtectedRoute + ProtectedLayout ─────────
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: (
          <ProtectedLayout profileMenu={<ProfileMenu />} />
        ),
        children: [
          {
            path: '/',
            element: <Navigate to="/dashboard" replace />,
          },
          {
            path: '/dashboard',
            element: <DashboardPage />,
          },
          // Placeholder routes — will be replaced in Phase 4 & 5
          {
            path: '/packages',
            element: <PackagesPage />,
          },
          {
            path: '/warehouses',
            element: <WarehousesPage />,
          },
          {
            path: '/employees',
            element: <EmployeesPage />,
          },
        ],
      },
    ],
  },

  // ── Catch-all ──────────────────────────────────────────────────────────────
  {
    path: '*',
    element: <Navigate to="/login" replace />,
  },
])
