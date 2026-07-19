import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'

interface ProtectedLayoutProps {
  /** ProfileMenu dropdown node — passed from AppRouter to avoid circular deps */
  profileMenu: React.ReactNode
}

/**
 * Shell layout for all authenticated pages.
 * Composes: Sidebar (left) + main area (Header top + page content).
 * Mobile: Sidebar is hidden by default, toggled via hamburger.
 */
export function ProtectedLayout({ profileMenu }: ProtectedLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main content area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header
          onMenuToggle={() => setSidebarOpen((prev) => !prev)}
          profileMenu={profileMenu}
        />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
