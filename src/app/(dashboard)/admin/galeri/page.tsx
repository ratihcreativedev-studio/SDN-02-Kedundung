import { galleryService } from '@/features/galleries/services'
import { DeleteGalleryButton } from '@/features/galleries/components/DeleteGalleryButton'
import { Image as ImageIcon } from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'

export const metadata = {
  title: 'Manajemen Galeri | SIPANDA Admin',
}

export default async function GaleriPage() {
  const galleries = await galleryService.getAll()

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
        title="Galeri"
        description="Kelola foto-foto kegiatan sekolah."
        icon={ImageIcon}
        iconGradient="from-fuchsia-500 to-fuchsia-600"
        actionLabel="Tambah Foto"
        actionHref="/admin/galeri/tambah"
      />

      <div className="animate-fade-in-up animate-delay-100">
        {galleries.length === 0 ? (
          <div className="section-card">
            <div className="empty-state">
              <ImageIcon className="h-10 w-10 text-text-muted mb-3 opacity-40" />
              <p className="text-sm font-medium text-text-secondary">Belum ada foto yang diunggah.</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-3 lg:grid-cols-4">
            {galleries.map((item) => (
              <div key={item.id} className="relative section-card overflow-hidden hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300">
                <div className="aspect-square bg-surface-alt relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.imageUrl} alt={item.caption || 'Foto Galeri'} className="object-cover w-full h-full" />
                </div>
                <div className="flex flex-col gap-3 border-t border-border/50 p-3">
                  <p className="line-clamp-2 min-h-10 wrap-break-word text-sm font-medium text-primary" title={item.caption || 'Foto kegiatan sekolah'}>
                    {item.caption || 'Foto kegiatan sekolah'}
                  </p>
                  <DeleteGalleryButton id={item.id} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
