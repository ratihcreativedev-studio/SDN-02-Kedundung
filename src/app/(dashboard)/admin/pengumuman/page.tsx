import { announcementService } from '@/features/announcements/services'
import { DeleteAnnouncementButton } from '@/features/announcements/components/DeleteAnnouncementButton'
import { PublishAnnouncementButton } from '@/features/announcements/components/PublishAnnouncementButton'
import { Megaphone, Pencil } from 'lucide-react'
import Link from 'next/link'
import { PageHeader } from '@/components/layout/page-header'

export const metadata = {
  title: 'Manajemen Pengumuman | SIPANDA Admin',
}

export default async function PengumumanPage() {
  const announcements = await announcementService.getAll()
  const published = announcements.filter(item => item.status === 'PUBLISHED').length

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
        title="Pengumuman"
        description="Kelola berita dan pengumuman untuk siswa dan orang tua."
        icon={Megaphone}
        iconGradient="from-blue-500 to-blue-600"
        actionLabel="Tambah Baru"
        actionHref="/admin/pengumuman/tambah"
      />

      <div className="animate-fade-in-up animate-delay-100">
        {announcements.length === 0 ? (
          <div className="section-card">
            <div className="empty-state">
              <Megaphone className="h-10 w-10 text-text-muted mb-3 opacity-40" />
              <p className="text-sm font-medium text-text-secondary">Belum ada pengumuman yang dibuat.</p>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2 text-sm">
              <p className="font-semibold text-primary">{announcements.length} pengumuman</p>
              <p className="text-xs text-text-muted">{published} terpublikasi · {announcements.length - published} draft</p>
            </div>
            {/* Mobile: Card view */}
            <div className="space-y-3 md:hidden">
              {announcements.map((item) => (
                <div key={item.id} className="section-card p-4">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <h3 className="min-w-0 break-words text-sm font-semibold leading-6 text-primary">{item.title}</h3>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                      item.status === 'PUBLISHED'
                        ? 'border border-emerald-200 bg-emerald-50 text-emerald-700'
                        : 'bg-surface-alt text-text-secondary border border-border/50'
                    }`}>
                      {item.status === 'PUBLISHED' ? 'Published' : 'Draft'}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/50 pt-3">
                    <span className="text-xs text-text-muted">
                      {new Date(item.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                    <div className="flex flex-wrap items-center justify-end gap-1">
                      {item.status === 'DRAFT' && (
                        <PublishAnnouncementButton id={item.id} title={item.title} />
                      )}
                      <Link href={`/admin/pengumuman/${item.id}/edit`} aria-label={`Edit ${item.title}`} title="Edit pengumuman" className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-primary transition-colors hover:bg-primary/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
                        <Pencil className="h-4 w-4" aria-hidden="true" />
                      </Link>
                      <DeleteAnnouncementButton id={item.id} title={item.title} />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop: Table view */}
            <div className="section-card overflow-hidden hidden md:block">
              <div className="overflow-x-auto">
                <table className="w-full table-fixed text-left text-sm">
                  <caption className="sr-only">Daftar pengumuman sekolah beserta status dan aksi</caption>
                  <thead className="bg-surface-alt/70 text-text-muted border-b border-border/50">
                    <tr>
                      <th scope="col" className="px-5 py-4 font-semibold text-xs uppercase tracking-wider">Judul Pengumuman</th>
                      <th scope="col" className="w-32 px-4 py-4 font-semibold text-xs uppercase tracking-wider">Status</th>
                      <th scope="col" className="w-36 px-4 py-4 font-semibold text-xs uppercase tracking-wider">Tanggal</th>
                      <th scope="col" className="w-44 px-5 py-4 font-semibold text-xs uppercase tracking-wider text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {announcements.map((item) => (
                      <tr key={item.id} className="hover:bg-surface-alt/30 transition-colors">
                        <td className="break-words px-5 py-4 font-semibold leading-6 text-primary">{item.title}</td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${item.status === 'PUBLISHED' ? 'border border-emerald-200 bg-emerald-50 text-emerald-700' : 'bg-surface-alt text-text-secondary border border-border'}`}>
                            {item.status === 'PUBLISHED' ? 'Published' : 'Draft'}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-xs tabular-nums text-text-secondary whitespace-nowrap">{new Date(item.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                        <td className="px-5 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {item.status === 'DRAFT' && (
                              <PublishAnnouncementButton id={item.id} title={item.title} />
                            )}
                            <Link href={`/admin/pengumuman/${item.id}/edit`} aria-label={`Edit ${item.title}`} title="Edit pengumuman" className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-primary transition-colors hover:bg-primary/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
                              <Pencil className="h-4 w-4" aria-hidden="true" />
                            </Link>
                            <DeleteAnnouncementButton id={item.id} title={item.title} />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
