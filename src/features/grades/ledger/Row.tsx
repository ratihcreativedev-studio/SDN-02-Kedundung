'use client'

import { useActionState, useId, useState } from 'react'
import { useNotifiedAction } from '@/components/ui/notification-provider'
import { editLedgerAction } from './actions'
import { useLedgerBusy } from './Upload'
import type { LedgerCategory } from './format'

export function LedgerRow({ student, columns, values, classId, semester, category }: {
  student: { id: string; name: string; nisn: string }
  columns: { code: string; name: string; label: string }[]
  values?: Record<string, string | number | null>
  classId: string
  semester: string
  category: LedgerCategory
}) {
  const [editing, setEditing] = useState(false)
  const formId = useId()
  const busy = useLedgerBusy()
  const runAction = useNotifiedAction()
  const [state, action, pending] = useActionState(async (_previous: { error: string }, data: FormData) => {
    const result = await runAction(() => editLedgerAction(data), `Nilai ${student.name} berhasil diperbarui.`)
    if (result?.error) return { error: result.error }
    setEditing(false)
    return { error: '' }
  }, { error: '' })
  const disabled = busy || pending
  return (
    <tr className="border-b border-border hover:bg-surface-alt/40">
      <td className="px-4 py-3 text-primary">{student.nisn}</td>
      <td className="min-w-56 px-4 py-3 font-medium">{student.name}</td>
      {columns.map(column => (
        <td key={column.code} className="px-3 py-3 text-center">
          {editing ? category === 'mata-pelajaran' ? (
            <input form={formId} name={column.code} aria-label={`${column.name} ${student.name}`} type="number" min="0" max="100" step="any" defaultValue={values?.[column.code] ?? ''} disabled={disabled} className="w-20 rounded-lg border border-border bg-white p-2 text-center focus:outline-primary" />
          ) : (
            <select form={formId} name={column.code} aria-label={`${column.name} ${student.name}`} defaultValue={values?.[column.code] ?? ''} disabled={disabled} className="w-20 rounded-lg border border-border bg-white p-2 text-center focus:outline-primary">
              <option value="">-</option>
              {['SB', 'B', 'C', 'K'].map(value => <option key={value} value={value}>{value}</option>)}
            </select>
          ) : (values?.[column.code] ?? '-')}
        </td>
      ))}
      <td className="px-4 py-3">
        {editing ? (
          <form id={formId} action={action} className="space-y-2">
            <input type="hidden" name="classId" value={classId} />
            <input type="hidden" name="semester" value={semester} />
            <input type="hidden" name="studentId" value={student.id} />
            <input type="hidden" name="category" value={category} />
            <div className="flex gap-2">
              <button disabled={disabled} className="rounded-lg bg-primary px-3 py-2 text-white disabled:opacity-50">{pending ? 'Menyimpan...' : 'Simpan'}</button>
              <button type="button" disabled={disabled} onClick={() => setEditing(false)} className="rounded-lg border border-border px-3 py-2">Batal</button>
            </div>
            {state.error && <p role="alert" className="min-w-40 text-xs text-red-600">{state.error}</p>}
          </form>
        ) : values ? (
          <button type="button" disabled={disabled} onClick={() => setEditing(true)} aria-label={`Edit nilai ${student.name}`} className="whitespace-nowrap rounded-lg border border-primary/20 px-3 py-2 font-semibold text-primary disabled:opacity-50">Edit Nilai</button>
        ) : <span className="text-xs text-text-muted">Belum diisi</span>}
      </td>
    </tr>
  )
}
