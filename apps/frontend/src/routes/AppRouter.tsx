import { createBrowserRouter, Navigate } from 'react-router-dom'
import { ProtectedRoute } from './ProtectedRoute'
import { ProtectedLayout } from '@/components/layout/ProtectedLayout'
import { ProfileMenu } from '@/features/profile/components/ProfileMenu'
import { LoginPage } from '@/pages/LoginPage'
import { DashboardPage } from '@/pages/DashboardPage'

// Placeholder pages for future phases — prevents broken links in Sidebar
import { PlaceholderPage } from '@/pages/PlaceholderPage'

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
            element: <PlaceholderPage title="Quản lý Kiện hàng" phase="Phase 5" />,
          },
          {
            path: '/warehouses',
            element: <PlaceholderPage title="Quản lý Kho hàng" phase="Phase 4" />,
          },
          {
            path: '/employees',
            element: <PlaceholderPage title="Quản lý Nhân viên" phase="Phase 4" />,
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
