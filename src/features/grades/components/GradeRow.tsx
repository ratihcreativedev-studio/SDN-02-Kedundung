'use client'

import { useActionState, useId, useState } from 'react'
import { useNotifiedAction } from '@/components/ui/notification-provider'
import { editGradeAction } from '../actions'

export type GradeValues = { uh: number | null; asts: number | null; asas: number | null; score: number }
const columns = [{ key: 'uh', label: 'UH' }, { key: 'asts', label: 'ASTS' }, { key: 'asas', label: 'ASAS' }, { key: 'score', label: 'Nilai Rapor' }] as const

export function GradeRow({ subjectCode, student, grade, classId, semester, disabled }: {
  subjectCode: string
  student: { id: string; nisn: string; name: string }
  grade?: GradeValues
  classId: string
  semester: string
  disabled: boolean
}) {
  const [editing, setEditing] = useState(false)
  const formId = useId()
  const runAction = useNotifiedAction()
  const [state, action, pending] = useActionState(async (_previous: { error: string }, data: FormData) => {
    const result = await runAction(() => editGradeAction(data), `Nilai ${student.name} berhasil diperbarui.`)
    if (result?.error) return { error: result.error }
    setEditing(false)
    return { error: '' }
  }, { error: '' })
  return (
    <tr className="border-b border-border hover:bg-surface-alt/40">
      <td className="px-4 py-3 text-primary">{student.nisn}</td>
      <td className="px-4 py-3 font-medium">{student.name}</td>
      {columns.map(({ key, label }) => (
        <td key={key} className="px-3 py-3 text-center">
          {editing ? (
            <input form={formId} name={key} aria-label={`${label} ${student.name}`} type="number" min="0" max="100" step="any" required={key === 'score'} placeholder="-" defaultValue={grade?.[key] ?? ''} disabled={pending || disabled} className="w-20 rounded-lg border border-border bg-white p-2 text-center focus:outline-primary" />
          ) : (grade?.[key] ?? '-')}
        </td>
      ))}
      <td className="px-4 py-3">
        {editing ? (
          <form id={formId} action={action} className="space-y-2">
            <input type="hidden" name="subjectCode" value={subjectCode} />
            <input type="hidden" name="classId" value={classId} />
            <input type="hidden" name="semester" value={semester} />
            <input type="hidden" name="studentId" value={student.id} />
            <div className="flex gap-2">
              <button disabled={pending || disabled} className="rounded-lg bg-primary px-3 py-2 text-white disabled:opacity-50">{pending ? 'Menyimpan...' : 'Simpan'}</button>
              <button type="button" disabled={pending} onClick={() => setEditing(false)} className="rounded-lg border border-border px-3 py-2">Batal</button>
            </div>
            {state.error && <p role="alert" className="max-w-52 text-xs text-red-600">{state.error}</p>}
          </form>
        ) : grade ? (
          <button type="button" disabled={disabled} onClick={() => setEditing(true)} aria-label={`Edit nilai ${student.name}`} className="rounded-lg border border-primary/20 px-3 py-2 font-semibold text-primary disabled:opacity-50">Edit Nilai</button>
        ) : <span className="text-xs text-text-muted">Belum diisi</span>}
      </td>
    </tr>
  )
}
