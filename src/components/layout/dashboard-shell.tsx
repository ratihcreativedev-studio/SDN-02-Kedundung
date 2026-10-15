'use client'

import { useCallback, useState } from 'react'
import { ConfirmationProvider } from '@/components/ui/confirmation-dialog'
import { Header } from '@/components/layout/header'
import { Sidebar } from '@/components/layout/sidebar'

export function DashboardShell({
  email,
  photoURL,
  children,
}: {
  email?: string
  photoURL?: string
  children: React.ReactNode
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const closeSidebar = useCallback(() => setIsSidebarOpen(false), [])

  return (
    <ConfirmationProvider>
    <div className="admin-shell flex h-dvh overflow-hidden bg-background">
      <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Header email={email} photoURL={photoURL} isMenuOpen={isSidebarOpen} onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="min-w-0 flex-1 overflow-y-auto">
          <div className="mx-auto max-w-7xl px-3 py-4 sm:px-5 sm:py-6 lg:px-8 lg:py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
    </ConfirmationProvider>
  )
}
