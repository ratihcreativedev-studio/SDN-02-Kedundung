'use client'

import { useNotifiedAction } from '@/components/ui/notification-provider'

import { ConfirmationForm } from '@/components/ui/confirmation-dialog'

import { useActionState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClassAction, updateClassAction } from '../actions'

const initialState = { error: '', success: false }

type ClassFormProps = {
  classData?: { id: string; name: string; homeroomId: string | null } | null
  teachers: { id: string; name: string; position: string | null }[]
}

export function ClassForm({ classData, teachers }: ClassFormProps) {
  const runAction = useNotifiedAction()
  const router = useRouter()
  const action = classData ? updateClassAction.bind(null, classData.id) : createClassAction
  const [state, formAction, isPending] = useActionState(async (_prev: typeof initialState, formData: FormData) => {
    const result = await runAction(() => action(formData), 'Data kelas berhasil disimpan.')
    if (result?.error) return { error: result.error, success: false }
    router.push('/admin/kelas')
    return { error: '', success: true }
  }, initialState)

  return (
    <div className="section-card p-6 animate-fade-in-up animate-delay-100">
      <ConfirmationForm confirmation={{ title: 'Simpan data?', description: 'Anda akan menyimpan data kelas. Pastikan data sudah benar sebelum melanjutkan.', confirmLabel: 'Ya, simpan' }} action={formAction} className="space-y-5">
        {state.error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-900/30 dark:text-red-400">{state.error}</div>}
        <label className="space-y-2">
          <span className="block text-sm font-medium text-primary">Nama Kelas</span>
          <input name="name" required defaultValue={classData?.name ?? ''} placeholder="Kelas 1A" className="w-full h-[46px] rounded-xl border border-border bg-surface-alt px-4 py-2.5 text-sm text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors" />
        </label>
        <label className="space-y-2">
          <span className="block text-sm font-medium text-primary">Wali Kelas</span>
          <select name="homeroomId" defaultValue={classData?.homeroomId ?? ''} className="w-full h-[46px] rounded-xl border border-border bg-surface-alt px-4 py-2.5 text-sm text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors">
            <option value="">Belum ditetapkan</option>
            {teachers.map((teacher) => (
              <option key={teacher.id} value={teacher.id}>
                {teacher.name} {teacher.position ? `- ${teacher.position}` : ''}
              </option>
            ))}
          </select>
        </label>
        <div className="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center">
          <button type="submit" disabled={isPending} className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/30 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-lg">
            {isPending ? 'Menyimpan...' : classData ? 'Simpan Perubahan' : 'Tambah Kelas'}
          </button>
          <Link href="/admin/kelas" className="rounded-xl border border-border bg-white px-5 py-2.5 text-center text-sm font-medium text-text-secondary transition-colors hover:bg-surface-alt hover:text-primary">
            Batal
          </Link>
        </div>
      </ConfirmationForm>
    </div>
  )
}
