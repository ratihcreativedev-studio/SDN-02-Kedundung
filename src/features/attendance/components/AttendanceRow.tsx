'use client'

import { useActionState, useId, useState } from 'react'
import { useNotifiedAction } from '@/components/ui/notification-provider'
import { editAttendanceAction } from '../actions'

export type AttendanceValues = { hadir: number; sakit: number; izin: number; alpha: number }
const columns = [{ key: 'hadir', label: 'HADIR' }, { key: 'sakit', label: 'SAKIT' }, { key: 'izin', label: 'IJIN' }, { key: 'alpha', label: 'ALPA' }] as const

export function AttendanceRow({ student, attendance, classId, semester, disabled }: {
  student: { id: string; nisn: string; name: string }
  attendance?: AttendanceValues
  classId: string
  semester: string
  disabled: boolean
}) {
  const [editing, setEditing] = useState(false)
  const formId = useId()
  const runAction = useNotifiedAction()
  const [state, action, pending] = useActionState(async (_previous: { error: string }, data: FormData) => {
    const result = await runAction(() => editAttendanceAction(data), `Absensi ${student.name} berhasil diperbarui.`)
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
            <input form={formId} name={key} aria-label={`${label} ${student.name}`} type="number" min="0" max="2147483647" step="1" required defaultValue={attendance?.[key]} disabled={pending || disabled} className="w-20 rounded-lg border border-border bg-white p-2 text-center focus:outline-primary" />
          ) : (attendance?.[key] ?? '-')}
        </td>
      ))}
      <td className="px-4 py-3">
        {editing ? (
          <form id={formId} action={action} className="space-y-2">
            <input type="hidden" name="classId" value={classId} />
            <input type="hidden" name="semester" value={semester} />
            <input type="hidden" name="studentId" value={student.id} />
            <div className="flex gap-2">
              <button disabled={pending || disabled} className="rounded-lg bg-primary px-3 py-2 text-white disabled:opacity-50">{pending ? 'Menyimpan...' : 'Simpan'}</button>
              <button type="button" disabled={pending} onClick={() => setEditing(false)} className="rounded-lg border border-border px-3 py-2">Batal</button>
            </div>
            {state.error && <p role="alert" className="max-w-52 text-xs text-red-600">{state.error}</p>}
          </form>
        ) : attendance ? (
          <button type="button" disabled={disabled} onClick={() => setEditing(true)} aria-label={`Edit absensi ${student.name}`} className="rounded-lg border border-primary/20 px-3 py-2 font-semibold text-primary disabled:opacity-50">Edit Absensi</button>
        ) : <span className="text-xs text-text-muted">Belum diisi</span>}
      </td>
    </tr>
  )
}
