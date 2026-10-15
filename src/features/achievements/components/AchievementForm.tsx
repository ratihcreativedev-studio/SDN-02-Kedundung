'use client'

import { useNotifiedAction } from '@/components/ui/notification-provider'

import { ConfirmationForm } from '@/components/ui/confirmation-dialog'

import { useActionState, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createAchievementAction, updateAchievementAction } from '../actions'
import { Image as ImageIcon, UploadCloud } from 'lucide-react'

const initialState = { error: '', success: false }

export function AchievementForm({
  students,
  achievement,
}: {
  students: { id: string; nisn: string; name: string; class?: { name: string } | null }[]
  achievement?: {
    id: string
    studentId: string
    title: string
    level: string
    rank: string | null
    eventName: string
    imageUrl: string | null
    date: Date | null
    note: string | null
  } | null
}) {
  const runAction = useNotifiedAction()
  const router = useRouter()
  const [previewUrl, setPreviewUrl] = useState<string | null>(achievement?.imageUrl || null)
  const initialStudentName = students.find(s => s.id === achievement?.studentId)?.name || ''
  const [search, setSearch] = useState(initialStudentName)
  const [selectedStudentId, setSelectedStudentId] = useState(achievement?.studentId || '')
  const [showDropdown, setShowDropdown] = useState(false)
  
  const action = achievement ? updateAchievementAction.bind(null, achievement.id) : createAchievementAction
  
  const [state, formAction, isPending] = useActionState(async (_prev: typeof initialState, formData: FormData) => {
    const result = await runAction(() => action(formData), 'Prestasi berhasil disimpan.')
    if (result?.error) return { error: result.error, success: false }
    router.push('/admin/prestasi')
    return { error: '', success: true }
  }, initialState)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    } else {
      setPreviewUrl(achievement?.imageUrl || null)
    }
  }

  return (
    <div className="section-card p-6 animate-fade-in-up animate-delay-100">
      <ConfirmationForm confirmation={{ title: 'Simpan data?', description: 'Anda akan menyimpan prestasi. Pastikan data sudah benar sebelum melanjutkan.', confirmLabel: 'Ya, simpan' }} action={formAction} className="space-y-5">
        {state.error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-900/30 dark:text-red-400">{state.error}</div>}
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="space-y-2 sm:col-span-2 relative">
            <span className="block text-sm font-medium text-primary">Siswa</span>
            <input type="hidden" name="studentId" value={selectedStudentId} required />
            <input 
              type="text" 
              value={search} 
              onChange={e => { 
                setSearch(e.target.value); 
                setShowDropdown(true); 
                if (selectedStudentId) setSelectedStudentId(''); 
              }} 
              onFocus={() => setShowDropdown(true)}
              onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
              placeholder="Ketik nama atau NISN siswa..."
              className="w-full h-11.5 rounded-xl border border-border bg-surface-alt px-4 py-2.5 text-sm text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
              required={!selectedStudentId}
            />
            {showDropdown && (
               <div className="absolute z-10 w-full mt-1 bg-white border border-border rounded-xl shadow-lg max-h-48 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-surface-alt">
                  {students.filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || s.nisn.includes(search)).map(s => (
                     <div 
                       key={s.id} 
                       className="p-3 hover:bg-surface-alt cursor-pointer border-b border-border last:border-0"
                       onClick={() => {
                          setSearch(s.name);
                          setSelectedStudentId(s.id);
                          setShowDropdown(false);
                       }}
                     >
                        <p className="font-semibold text-sm text-primary">{s.name}</p>
                        <p className="text-xs text-text-muted mt-0.5">NISN: {s.nisn} • {s.class?.name ?? 'Tanpa kelas'}</p>
                     </div>
                  ))}
                  {students.filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || s.nisn.includes(search)).length === 0 && (
                     <div className="p-3 text-sm text-text-muted text-center">Siswa tidak ditemukan</div>
                  )}
               </div>
            )}
          </label>
          <label className="space-y-2 sm:col-span-2">
            <span className="block text-sm font-medium text-primary">Judul Prestasi</span>
            <input name="title" required defaultValue={achievement?.title ?? ''} className="w-full h-11.5 rounded-xl border border-border bg-surface-alt px-4 py-2.5 text-sm text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors" />
          </label>
          <label className="space-y-2">
            <span className="block text-sm font-medium text-primary">Tingkat</span>
            <input name="level" required defaultValue={achievement?.level ?? ''} placeholder="Kota, Provinsi, Nasional" className="w-full h-11.5 rounded-xl border border-border bg-surface-alt px-4 py-2.5 text-sm text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors" />
          </label>
          <label className="space-y-2">
            <span className="block text-sm font-medium text-primary">Peringkat</span>
            <input name="rank" defaultValue={achievement?.rank ?? ''} placeholder="Juara 1" className="w-full h-11.5 rounded-xl border border-border bg-surface-alt px-4 py-2.5 text-sm text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors" />
          </label>
          <label className="space-y-2">
            <span className="block text-sm font-medium text-primary">Nama Lomba</span>
            <input name="eventName" required defaultValue={achievement?.eventName ?? ''} className="w-full h-11.5 rounded-xl border border-border bg-surface-alt px-4 py-2.5 text-sm text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors" />
          </label>
          <label className="space-y-2">
            <span className="block text-sm font-medium text-primary">Tanggal</span>
            <input type="date" name="date" defaultValue={achievement?.date ? achievement.date.toISOString().slice(0, 10) : ''} className="w-full h-11.5 rounded-xl border border-border bg-surface-alt px-4 py-2.5 text-sm text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors" />
          </label>
          
          <div className="space-y-2 sm:col-span-2">
            <label className="block text-sm font-medium text-primary">Foto Prestasi</label>
            <div className="group relative flex min-h-50 justify-center overflow-hidden rounded-xl border-2 border-dashed border-border px-4 pb-6 pt-5 sm:px-6 transition-colors hover:border-primary/40">
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
          
          <label className="space-y-2 sm:col-span-2">
            <span className="block text-sm font-medium text-primary">Catatan</span>
            <textarea name="note" rows={3} defaultValue={achievement?.note ?? ''} className="w-full rounded-xl border border-border bg-surface-alt px-4 py-2.5 text-sm text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors" />
          </label>
        </div>
        <div className="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center">
          <button type="submit" disabled={isPending} className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/30 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-lg">
            {isPending ? 'Menyimpan...' : achievement ? 'Simpan Perubahan' : 'Tambah Prestasi'}
          </button>
          <Link href="/admin/prestasi" className="rounded-xl border border-border bg-white px-5 py-2.5 text-center text-sm font-medium text-text-secondary transition-colors hover:bg-surface-alt hover:text-primary">Batal</Link>
        </div>
      </ConfirmationForm>
    </div>
  )
}
