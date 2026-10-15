'use client'

import { useNotifiedAction } from '@/components/ui/notification-provider'

import { ConfirmationForm } from '@/components/ui/confirmation-dialog'

import { useActionState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createTeacherAction, updateTeacherAction } from '../actions'

const initialState = { error: '', success: false }

type TeacherFormProps = {
  teacher?: {
    id: string
    name: string
    nip: string | null
    position: string | null
    role: string
  } | null
}

export function TeacherForm({ teacher }: TeacherFormProps) {
  const runAction = useNotifiedAction()
  const router = useRouter()
  const action = teacher ? updateTeacherAction.bind(null, teacher.id) : createTeacherAction
  const [state, formAction, isPending] = useActionState(async (_prev: typeof initialState, formData: FormData) => {
    const result = await runAction(() => action(formData), 'Data guru dan staf berhasil disimpan.')
    if (result?.error) return { error: result.error, success: false }
    router.push('/admin/guru')
    return { error: '', success: true }
  }, initialState)

  return (
    <div className="section-card p-6 animate-fade-in-up animate-delay-100">
      <ConfirmationForm confirmation={{ title: 'Simpan data?', description: 'Anda akan menyimpan data guru dan staf. Pastikan data sudah benar sebelum melanjutkan.', confirmLabel: 'Ya, simpan' }} action={formAction} className="space-y-5">
        {state.error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-900/30 dark:text-red-400">
            {state.error}
          </div>
        )}
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="space-y-2 sm:col-span-2">
            <span className="block text-sm font-medium text-primary">Nama Lengkap</span>
            <input name="name" required defaultValue={teacher?.name ?? ''} className="w-full h-[46px] rounded-xl border border-border bg-surface-alt px-4 py-2.5 text-sm text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors" />
          </label>
          <label className="space-y-2">
            <span className="block text-sm font-medium text-primary">NIP</span>
            <input name="nip" defaultValue={teacher?.nip ?? ''} className="w-full h-[46px] rounded-xl border border-border bg-surface-alt px-4 py-2.5 text-sm text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors" />
          </label>
          <label className="space-y-2">
            <span className="block text-sm font-medium text-primary">Jabatan</span>
            <input name="position" required defaultValue={teacher?.position ?? ''} placeholder="Guru Kelas, Staff TU, Kepala Sekolah" className="w-full h-[46px] rounded-xl border border-border bg-surface-alt px-4 py-2.5 text-sm text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors" />
          </label>
          <label className="space-y-2">
            <span className="block text-sm font-medium text-primary">Role</span>
            <select name="role" defaultValue={teacher?.role ?? 'TEACHER'} className="w-full h-[46px] rounded-xl border border-border bg-surface-alt px-4 py-2.5 text-sm text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors">
              <option value="TEACHER">Guru</option>
              <option value="STAFF">Staff</option>
              <option value="ADMIN">Admin</option>
            </select>
          </label>
        </div>
        <div className="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center">
          <button type="submit" disabled={isPending} className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/30 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-lg">
            {isPending ? 'Menyimpan...' : teacher ? 'Simpan Perubahan' : 'Tambah Guru/Staff'}
          </button>
          <Link href="/admin/guru" className="rounded-xl border border-border bg-white px-5 py-2.5 text-center text-sm font-medium text-text-secondary transition-colors hover:bg-surface-alt hover:text-primary">
            Batal
          </Link>
        </div>
      </ConfirmationForm>
    </div>
  )
}
