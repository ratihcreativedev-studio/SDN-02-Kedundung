'use client'

import { Menu, LogOut, ChevronRight } from 'lucide-react'
import { useRouter, usePathname } from 'next/navigation'
import { logoutAction } from '@/features/auth/actions'

// Helper: get page title from pathname
function getPageTitle(pathname: string): string {
  const map: Record<string, string> = {
    '/admin': 'Dashboard',
    '/admin/data-siswa': 'Data Siswa',
    '/admin/kelas': 'Data Kelas',
    '/admin/guru': 'Guru & Staff',
    '/admin/mata-pelajaran': 'Mata Pelajaran',
    '/admin/absensi': 'Absensi',
    '/admin/nilai': 'Daftar Nilai',
    '/admin/prestasi': 'Prestasi',
    '/admin/pengumuman': 'Pengumuman',
    '/admin/galeri': 'Galeri',
    '/admin/profil': 'Profil Sekolah',
  }
  // Check exact match first
  if (map[pathname]) return map[pathname]
  // Then prefix match
  for (const [key, val] of Object.entries(map)) {
    if (pathname.startsWith(key) && key !== '/admin') return val
  }
  return 'Admin'
}

export function Header({
  email,
  photoURL,
  isMenuOpen = false,
  onMenuClick,
}: {
  email?: string
  photoURL?: string
  isMenuOpen?: boolean
  onMenuClick: () => void
}) {
  const router = useRouter()
  const pathname = usePathname()
  const pageTitle = getPageTitle(pathname)

  const handleLogout = async () => {
    await logoutAction()
    router.push('/login')
  }

  return (
    <header className="sticky top-0 z-20 flex h-14 shrink-0 sm:h-16 items-center justify-between border-b border-border/50 bg-white/80 backdrop-blur-xl px-3 sm:px-5 lg:px-6 transition-colors">
      {/* Left: Hamburger + Breadcrumb */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <button
          type="button"
          onClick={onMenuClick}
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-text-secondary transition-all hover:bg-surface-alt hover:text-primary active:scale-95 focus-visible:outline-2 focus-visible:outline-primary lg:hidden"
          aria-label="Buka menu admin"
          aria-expanded={isMenuOpen}
          aria-controls="mobile-admin-menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Breadcrumb / Page title */}
        <div className="flex items-center gap-1.5 text-sm min-w-0">
          <span className="hidden sm:inline text-text-muted">Admin</span>
          <ChevronRight className="hidden sm:inline h-3.5 w-3.5 text-text-muted" />
          <span className="font-semibold text-primary truncate">{pageTitle}</span>
        </div>
      </div>

      {/* Right: Profile + Logout */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Email - only on desktop */}
        <div className="hidden md:block text-right mr-1">
          <p className="text-xs font-medium text-text-secondary leading-tight">Administrator</p>
          <p className="max-w-48 truncate text-[11px] text-text-muted">{email}</p>
        </div>

        {/* Avatar */}
        <div className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-primary to-primary-light font-bold text-white text-xs overflow-hidden ring-2 ring-primary/10 ring-offset-1 ring-offset-white">
          {photoURL ? (
            <img
              src={photoURL}
              alt="Profile"
              className="h-full w-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            email?.[0].toUpperCase() || 'A'
          )}
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex h-11 w-11 items-center justify-center rounded-xl text-text-secondary hover:text-red-700 hover:bg-red-50 transition-all active:scale-95 focus-visible:outline-2 focus-visible:outline-primary"
          title="Keluar"
          aria-label="Keluar dari akun admin"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  )
}
