'use client'

import { useNotifiedAction } from '@/components/ui/notification-provider'

import { ConfirmationForm } from '@/components/ui/confirmation-dialog'

import { useActionState } from 'react'
import { updateSubjectClassesAction } from '../actions'

const initialState = { error: '', success: false }

export function SubjectAllocationForm({
  subjectId,
  classes,
  selectedClassIds,
}: {
  subjectId: string
  classes: { id: string; name: string }[]
  selectedClassIds: string[]
}) {
  const runAction = useNotifiedAction()
  const [state, formAction, isPending] = useActionState(async (_prev: typeof initialState, formData: FormData) => {
    const result = await runAction(() => updateSubjectClassesAction(subjectId, formData), 'Alokasi mata pelajaran berhasil disimpan.')
    if (result?.error) return { error: result.error, success: false }
    return { error: '', success: true }
  }, initialState)

  return (
    <ConfirmationForm confirmation={{ title: 'Simpan data?', description: 'Anda akan menyimpan alokasi mata pelajaran. Pastikan data sudah benar sebelum melanjutkan.', confirmLabel: 'Ya, simpan' }} action={formAction} className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {classes.map((cls) => (
          <label key={cls.id} className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-text-secondary transition-colors has-checked:border-primary/30 has-checked:bg-primary/10 has-checked:text-primary">
            <input type="checkbox" name="classIds" value={cls.id} defaultChecked={selectedClassIds.includes(cls.id)} className="h-3.5 w-3.5 rounded border-border text-primary focus:ring-primary" />
            {cls.name}
          </label>
        ))}
      </div>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <button type="submit" disabled={isPending} className="rounded-xl bg-primary px-4 py-1.5 text-xs font-semibold text-white shadow-md shadow-primary/20 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/30 disabled:opacity-50 disabled:hover:translate-y-0">
          {isPending ? 'Menyimpan...' : 'Simpan Alokasi'}
        </button>
        {state.success && <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Tersimpan</span>}
        {state.error && <span className="text-xs font-medium text-red-600 dark:text-red-400">{state.error}</span>}
      </div>
    </ConfirmationForm>
  )
}
