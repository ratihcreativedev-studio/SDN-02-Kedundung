'use client'

import Link, { useLinkStatus } from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
  BookOpen,
  CalendarCheck,
  ClipboardList,
  GraduationCap,
  LayoutDashboard,
  Loader2,
  Megaphone,
  School,
  Trophy,
  Users,
  X,
} from 'lucide-react'
import { useEffect, useRef } from 'react'

const navSections = [
  {
    label: 'Utama',
    items: [
      { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    ],
  },
  {
    label: 'Akademik',
    items: [
      { name: 'Siswa', href: '/admin/data-siswa', icon: GraduationCap },
      { name: 'Alumni', href: '/admin/alumni', icon: GraduationCap },
      { name: 'Kelas', href: '/admin/kelas', icon: School },
      { name: 'Guru & Staff', href: '/admin/guru', icon: Users },
      { name: 'Mata Pelajaran', href: '/admin/mata-pelajaran', icon: BookOpen },
    ],
  },
  {
    label: 'Penilaian',
    items: [
      { name: 'Absensi', href: '/admin/absensi', icon: CalendarCheck },
      { name: 'Nilai', href: '/admin/nilai', icon: ClipboardList },
      { name: 'Prestasi', href: '/admin/prestasi', icon: Trophy },
    ],
  },
  {
    label: 'Informasi',
    items: [
      { name: 'Pengumuman', href: '/admin/pengumuman', icon: Megaphone },
      { name: 'Profil Sekolah', href: '/admin/profil', icon: School },
    ],
  },
]

function NavigationPending() {
  const { pending } = useLinkStatus()

  return (
    <span className="ml-auto flex h-4 w-4 shrink-0 items-center" role="status">
      {pending && <>
        <Loader2 className="h-4 w-4 motion-safe:animate-spin" aria-hidden="true" />
        <span className="sr-only">Memuat halaman...</span>
      </>}
    </span>
  )
}

function NavLinks({ pathname, onClick }: { pathname: string; onClick?: () => void }) {
  return (
    <nav aria-label="Navigasi admin" className="min-h-0 flex-1 overflow-y-auto px-3 py-4 space-y-5">
      {navSections.map((section) => (
        <div key={section.label}>
          <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-text-muted">
            {section.label}
          </p>
          <div className="space-y-0.5">
            {section.items.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== '/admin' && pathname.startsWith(item.href))
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={onClick}
                  aria-current={isActive ? 'page' : undefined}
                  className={`group flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                    isActive
                      ? 'bg-primary text-white shadow-md shadow-primary/25'
                      : 'text-text-secondary hover:bg-primary/5 hover:text-primary active:scale-[0.98]'
                  }`}
                >
                  <item.icon
                    className={`h-4.5 w-4.5 shrink-0 transition-colors ${
                      isActive
                        ? 'text-white'
                        : 'text-text-muted group-hover:text-primary'
                    }`}
                  />
                  <span>{item.name}</span>
                  <NavigationPending />
                </Link>
              )
            })}
          </div>
        </div>
      ))}
    </nav>
  )
}

export function Sidebar({
  isOpen = false,
  onClose,
}: {
  isOpen?: boolean
  onClose?: () => void
}) {
  const pathname = usePathname()
  const dialogRef = useRef<HTMLDialogElement>(null)

  // Native modal behavior keeps focus inside the menu and restores it on close.
  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (!isOpen) {
      if (dialog.open) dialog.close()
      return
    }

    const desktop = window.matchMedia('(min-width: 1024px)')
    if (desktop.matches) {
      onClose?.()
      return
    }
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    if (!dialog.open) dialog.showModal()
    const closeOnDesktop = () => { if (desktop.matches) onClose?.() }
    desktop.addEventListener('change', closeOnDesktop)
    return () => {
      document.body.style.overflow = previousOverflow
      desktop.removeEventListener('change', closeOnDesktop)
      if (dialog.open) dialog.close()
    }
  }, [isOpen, onClose])

  return (
    <>
      {/* Mobile Sidebar */}
      <dialog
        ref={dialogRef}
        id="mobile-admin-menu"
        aria-labelledby="mobile-admin-menu-title"
        onCancel={onClose}
        onClick={(event) => {
          if (event.target !== event.currentTarget) return
          const bounds = event.currentTarget.getBoundingClientRect()
          if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) onClose?.()
        }}
        className="fixed inset-y-0 left-0 m-0 h-dvh max-h-none w-72 max-w-[calc(100vw-2rem)] border-0 border-r border-border bg-white p-0 text-text-primary shadow-2xl backdrop:bg-zinc-950/50 backdrop:backdrop-blur-sm lg:hidden"
      >
        <div className="flex h-full flex-col">
          <div className="flex h-16 shrink-0 items-center justify-between border-b border-border/50 px-4">
            <div className="flex items-center gap-2.5">
              <Image
                src="/images/logo-sdn2kedundung.png"
                alt="Logo SDN Kedundung 2"
                width={32}
                height={32}
                className="object-contain"
              />
              <div>
                <h2 id="mobile-admin-menu-title" className="text-sm font-bold text-primary leading-tight">SIPANDA</h2>
                <p className="text-[10px] text-text-muted leading-tight">Admin Panel</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-11 w-11 items-center justify-center rounded-xl text-text-secondary transition-all hover:bg-surface-alt hover:text-primary active:scale-95 focus-visible:outline-2 focus-visible:outline-primary"
              aria-label="Tutup menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <NavLinks pathname={pathname} onClick={onClose} />
        </div>
      </dialog>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-65 lg:shrink-0 lg:border-r lg:border-border/50 lg:bg-white/60 lg:backdrop-blur-xl">
        <div className="flex h-16 shrink-0 items-center gap-2.5 border-b border-border/50 px-5">
          <Image
            src="/images/logo-sdn2kedundung.png"
            alt="Logo SDN Kedundung 2"
            width={32}
            height={32}
            className="object-contain"
          />
          <div>
            <h2 className="text-sm font-bold text-primary leading-tight">SIPANDA</h2>
            <p className="text-[10px] text-text-muted leading-tight">Admin Panel</p>
          </div>
        </div>
        <NavLinks pathname={pathname} />
      </aside>
    </>
  )
}
