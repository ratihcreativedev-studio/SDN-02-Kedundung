'use client'

import { useNotifiedAction } from '@/components/ui/notification-provider'

import { ConfirmationForm } from '@/components/ui/confirmation-dialog'

import { useActionState } from 'react'
import { updateSchoolProfileAction } from '../actions'
import { Save } from 'lucide-react'
import type { SchoolProfileInput } from '../schemas'

const initialState = { error: '', success: false }

type SchoolProfileFormData = Partial<{
  [Key in keyof SchoolProfileInput]: SchoolProfileInput[Key] | null
}>

export function SchoolProfileForm({ initialData }: { initialData: SchoolProfileFormData | null }) {
  const runAction = useNotifiedAction()
  const [state, formAction, isPending] = useActionState(
    async (_prevState: typeof initialState, formData: FormData) => {
      const result = await runAction(() => updateSchoolProfileAction(formData), 'Profil sekolah berhasil diperbarui.')
      if (result?.success) {
        return { success: true, error: '' }
      }
      return { success: false, error: result?.error || 'Gagal menyimpan' }
    },
    initialState
  )

  const inputClass = 'w-full rounded-xl border border-border bg-surface-alt px-4 py-2.5 text-sm text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors resize-y'

  return (
    <ConfirmationForm confirmation={{ title: 'Simpan data?', description: 'Anda akan menyimpan profil sekolah. Pastikan data sudah benar sebelum melanjutkan.', confirmLabel: 'Ya, simpan' }} action={formAction} className="grid grid-cols-1 gap-6 p-4 sm:p-6 xl:grid-cols-3 xl:gap-8 xl:p-8">
      {state.error && (
        <div role="alert" className="xl:col-span-3 p-3 bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400 text-sm rounded-xl border border-red-200 dark:border-red-500/20">
          {state.error}
        </div>
      )}
      
      {state.success && (
        <div role="status" className="xl:col-span-3 p-3 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 text-sm rounded-xl border border-emerald-200 dark:border-emerald-500/20">
          Profil sekolah berhasil diperbarui!
        </div>
      )}

      <div className="min-w-0 space-y-6 xl:col-span-2">
      <div className="border-b border-border pb-3">
        <h2 className="text-lg font-bold text-primary">Profil & arah pendidikan</h2>
        <p className="mt-1 text-sm text-text-secondary">Kelola deskripsi, visi, dan misi yang tampil di website sekolah.</p>
      </div>
      <div className="space-y-2">
        <label htmlFor="description" className="block text-sm font-medium text-primary">
          Deskripsi Sekolah
        </label>
        <textarea
          id="description"
          name="description"
          rows={12}
          defaultValue={initialData?.description || ''}
          className={inputClass}
          placeholder="Masukkan deskripsi sekolah di sini..."
          required
        />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="vision" className="block text-sm font-medium text-primary">
            Visi
          </label>
          <textarea
            id="vision"
            name="vision"
            rows={8}
            defaultValue={initialData?.vision || ''}
            className={inputClass}
            placeholder="Tuliskan visi sekolah..."
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="mission" className="block text-sm font-medium text-primary">
            Misi
          </label>
          <textarea
            id="mission"
            name="mission"
            rows={8}
            defaultValue={initialData?.mission || ''}
            className={inputClass}
            aria-describedby="mission-help"
            placeholder="Tulis satu poin misi per baris..."
          />
          <p id="mission-help" className="text-xs text-text-muted">Gunakan baris baru untuk memisahkan setiap poin misi.</p>
        </div>
      </div>

      </div>
      <div className="min-w-0 space-y-6 rounded-2xl border border-border bg-surface-alt/30 p-4 sm:p-5">
      <div className="border-b border-border pb-3">
        <h2 className="text-lg font-bold text-primary">Organisasi & kontak</h2>
        <p className="mt-1 text-sm text-text-secondary">Informasi pengelola dan kontak sekolah.</p>
      </div>
      <div className="space-y-2">
        <label htmlFor="organization" className="block text-sm font-medium text-primary">
          Struktur Organisasi
        </label>
        <textarea
          id="organization"
          name="organization"
          rows={3}
          defaultValue={initialData?.organization || ''}
          className={inputClass}
          placeholder="Kepala Sekolah, Wali Kelas, Komite, dan struktur lain..."
        />
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="space-y-2">
          <label htmlFor="contactEmail" className="block text-sm font-medium text-primary">
            Email Kontak
          </label>
          <input
            type="email"
            id="contactEmail"
            name="contactEmail"
            defaultValue={initialData?.contactEmail || ''}
            className={inputClass}
            placeholder="Email sekolah"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="contactPhone" className="block text-sm font-medium text-primary">
            Nomor Telepon
          </label>
          <input
            type="tel"
            id="contactPhone"
            name="contactPhone"
            defaultValue={initialData?.contactPhone || ''}
            className={inputClass}
            placeholder="Nomor telepon sekolah"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="address" className="block text-sm font-medium text-primary">
          Alamat Lengkap
        </label>
        <textarea
          id="address"
          name="address"
          rows={2}
          defaultValue={initialData?.address || ''}
          className={inputClass}
          placeholder="Alamat lengkap sekolah"
        />
      </div>

      </div>
      <div className="flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between xl:col-span-3">
        <p className="text-sm text-text-muted">Perubahan akan tampil di website setelah disimpan.</p>
        <button
          type="submit"
          disabled={isPending}
          className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/30 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-lg flex items-center justify-center gap-2"
        >
          {isPending ? (
            <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {isPending ? 'Menyimpan...' : 'Simpan Perubahan'}
        </button>
      </div>
    </ConfirmationForm>
  )
}
