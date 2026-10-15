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
            {/* Mobile: Card view */}
            <div className="space-y-2.5 sm:hidden">
              {announcements.map((item) => (
                <div key={item.id} className="mobile-data-card">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="text-sm font-semibold text-primary line-clamp-1">{item.title}</h3>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                      item.status === 'PUBLISHED'
                        ? 'bg-emerald-50 text-emerald-600'
                        : 'bg-surface-alt text-text-secondary border border-border/50'
                    }`}>
                      {item.status === 'PUBLISHED' ? 'Published' : 'Draft'}
                    </span>
                  </div>
                  <p className="text-xs text-text-secondary line-clamp-2 mb-2.5">{item.content}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-text-muted">
                      {new Date(item.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                    <div className="flex items-center gap-0.5">
                      {item.status === 'DRAFT' && (
                        <PublishAnnouncementButton id={item.id} title={item.title} />
                      )}
                      <Link href={`/admin/pengumuman/${item.id}/edit`} className="rounded-lg p-1.5 text-primary transition-colors hover:bg-primary/10">
                        <Pencil className="h-3.5 w-3.5" />
                      </Link>
                      <DeleteAnnouncementButton id={item.id} title={item.title} />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop: Table view */}
            <div className="section-card overflow-hidden hidden sm:block">
              <div className="overflow-x-auto">
                <table className="min-w-175 w-full text-left text-sm">
                  <thead className="bg-surface-alt/80 text-text-secondary border-b border-border/50">
                    <tr>
                      <th className="px-5 py-3.5 font-semibold text-xs uppercase tracking-wider">Judul</th>
                      <th className="px-5 py-3.5 font-semibold text-xs uppercase tracking-wider">Konten</th>
                      <th className="px-5 py-3.5 font-semibold text-xs uppercase tracking-wider">Status</th>
                      <th className="px-5 py-3.5 font-semibold text-xs uppercase tracking-wider">Tanggal</th>
                      <th className="px-5 py-3.5 font-semibold text-xs uppercase tracking-wider text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {announcements.map((item) => (
                      <tr key={item.id} className="hover:bg-surface-alt/30 transition-colors">
                        <td className="px-5 py-3.5 font-medium text-primary whitespace-nowrap">{item.title}</td>
                        <td className="px-5 py-3.5 text-text-secondary truncate max-w-xs">{item.content}</td>
                        <td className="px-5 py-3.5">
                          <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${item.status === 'PUBLISHED' ? 'bg-emerald-50 text-emerald-600' : 'bg-surface-alt text-text-secondary border border-border'}`}>
                            {item.status === 'PUBLISHED' ? 'Published' : 'Draft'}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-text-secondary whitespace-nowrap">{new Date(item.createdAt).toLocaleDateString('id-ID')}</td>
                        <td className="px-5 py-3.5 text-right">
                          <div className="flex justify-end gap-1">
                            {item.status === 'DRAFT' && (
                              <PublishAnnouncementButton id={item.id} title={item.title} />
                            )}
                            <Link href={`/admin/pengumuman/${item.id}/edit`} className="rounded-lg p-2 text-primary transition-colors hover:bg-primary/10">
                              <Pencil className="h-4 w-4" />
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
