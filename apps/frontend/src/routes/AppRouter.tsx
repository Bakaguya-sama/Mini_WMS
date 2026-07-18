import { createBrowserRouter, Navigate } from 'react-router-dom'
import { ProtectedRoute } from './ProtectedRoute'
import { LoginPage } from '@/pages/LoginPage'
import { DashboardPage } from '@/pages/DashboardPage'

/**
 * Application router definition.
 * Phase 1 routes — will be extended in Phase 2+ with layout and more pages.
 */
export const router = createBrowserRouter([
  // ── Public routes ──────────────────────────────────────────────────────────
  {
    path: '/login',
    element: <LoginPage />,
  },

  // ── Protected routes (authenticated users only) ───────────────────────────
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: '/',
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: '/dashboard',
        element: <DashboardPage />,
      },
    ],
  },

  // ── Catch-all: redirect to login ──────────────────────────────────────────
  {
    path: '*',
    element: <Navigate to="/login" replace />,
  },
])
