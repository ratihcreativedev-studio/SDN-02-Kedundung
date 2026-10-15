'use client'

import { useNotifiedAction } from '@/components/ui/notification-provider'

import { ConfirmationForm } from '@/components/ui/confirmation-dialog'

import { useActionState, useEffect, useState } from 'react'
import { createAnnouncementAction, updateAnnouncementAction } from '../actions'
import { useRouter } from 'next/navigation'
import { Save, ArrowLeft, Image as ImageIcon, UploadCloud } from 'lucide-react'
import Link from 'next/link'

const initialState = { error: '', success: false }

export function AnnouncementForm({
  announcement,
}: {
  announcement?: {
    id: string
    title: string
    content: string
    status: string
    thumbnail: string | null
  } | null
}) {
  const runAction = useNotifiedAction()
  const router = useRouter()
  const [previewUrl, setPreviewUrl] = useState<string | null>(announcement?.thumbnail || null)
  useEffect(() => () => {
    if (previewUrl?.startsWith('blob:')) URL.revokeObjectURL(previewUrl)
  }, [previewUrl])
  const action = announcement ? updateAnnouncementAction.bind(null, announcement.id) : createAnnouncementAction
  const [state, formAction, isPending] = useActionState(
    async (_prevState: typeof initialState, formData: FormData) => {
      const result = await runAction(() => action(formData), formData.get('status') === 'PUBLISHED' ? 'Pengumuman berhasil dipublikasikan.' : 'Pengumuman berhasil disimpan sebagai draft.')
      if (result?.success) {
        router.push('/admin/pengumuman')
        return { success: true, error: '' }
      }
      return { success: false, error: result?.error || 'Gagal menyimpan' }
    },
    initialState
  )

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    } else {
      setPreviewUrl(announcement?.thumbnail || null)
    }
  }

  return (
    <div className="w-full">
      <div className="mb-6 flex items-start gap-3 sm:items-center sm:gap-4">
        <Link href="/admin/pengumuman" className="p-2 hover:bg-surface-alt rounded-full transition-colors">
          <ArrowLeft className="h-5 w-5 text-text-secondary" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-primary sm:text-2xl">{announcement ? 'Edit Pengumuman' : 'Tambah Pengumuman'}</h1>
          <p className="text-sm text-text-secondary mt-1">Simpan sebagai draft untuk dilanjutkan nanti, atau unggah agar langsung tampil di website.</p>
        </div>
      </div>

      <div className="section-card animate-fade-in-up animate-delay-100">
        <ConfirmationForm confirmation={submitter => submitter?.value === 'PUBLISHED' ? { title: 'Unggah pengumuman?', description: 'Pengumuman akan langsung ditampilkan di website sekolah.', confirmLabel: 'Ya, unggah' } : { title: 'Simpan sebagai draft?', description: 'Pengumuman disimpan sebagai draft dan tidak ditampilkan di website. Anda dapat mengeditnya kembali nanti.', confirmLabel: 'Ya, simpan draft' }} action={formAction} className="grid grid-cols-1 gap-6 p-4 sm:p-6 lg:grid-cols-3 lg:p-8">
          {state.error && (
            <div role="alert" className="lg:col-span-3 p-3 bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400 text-sm rounded-md border border-red-200 dark:border-red-500/20">
              {state.error}
            </div>
          )}

          <div className="space-y-6 lg:col-span-2">
          <div className="space-y-2">
            <label htmlFor="title" className="block text-sm font-medium text-primary">
              Judul Pengumuman
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              defaultValue={announcement?.title ?? ''}
              placeholder="Contoh: Libur Semester Ganjil"
              className="w-full h-11.5 rounded-xl border border-border bg-surface-alt px-4 py-2.5 text-sm text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="content" className="block text-sm font-medium text-primary">
              Konten Berita
            </label>
            <textarea
              id="content"
              name="content"
              required
              rows={12}
              defaultValue={announcement?.content ?? ''}
              placeholder="Tuliskan isi pengumuman secara detail di sini..."
              className="w-full rounded-xl border border-border bg-surface-alt px-4 py-2.5 text-sm text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors resize-y"
            />
          </div>

          </div>
          <div className="space-y-2">
              <label htmlFor="image" className="block text-sm font-medium text-primary">
                Thumbnail Pengumuman
              </label>
              <div className="group relative flex min-h-56 lg:min-h-72 justify-center overflow-hidden rounded-xl border-2 border-dashed border-border px-4 pb-6 pt-5 sm:px-6 transition-colors hover:border-primary/40">
                {previewUrl ? (
                  <div className="absolute inset-0 w-full h-full">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <p className="text-white font-medium text-sm flex items-center gap-2">
                        <UploadCloud className="h-4 w-4" /> Ganti Gambar
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1 text-center self-center">
                    <ImageIcon className="mx-auto h-12 w-12 text-text-muted" />
                    <div className="flex text-sm text-text-secondary justify-center">
                      <p className="pl-1">Klik untuk memilih file gambar</p>
                    </div>
                    <p className="text-xs text-text-muted">PNG, JPG, WEBP hingga 5MB</p>
                  </div>
                )}
                <input
                  id="image"
                  name="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
            </div>

          <div className="flex flex-col gap-4 border-t border-border pt-5 lg:col-span-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-text-muted">Simpan = draft · Unggah = langsung terpublikasi</p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button type="submit" name="status" value="DRAFT" disabled={isPending} className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border bg-white px-5 text-sm font-semibold text-primary hover:bg-surface-alt disabled:opacity-50">
                <Save className="h-4 w-4" aria-hidden="true" />
                {isPending ? 'Memproses...' : 'Simpan Pengumuman'}
              </button>
              <button type="submit" name="status" value="PUBLISHED" disabled={isPending} className="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-white shadow-md shadow-primary/20 hover:bg-primary/90 disabled:opacity-50">
                <UploadCloud className="h-4 w-4" aria-hidden="true" />
                {isPending ? 'Memproses...' : 'Unggah Pengumuman'}
              </button>
            </div>
          </div>
        </ConfirmationForm>
      </div>
    </div>
  )
}
