'use client'

import { useNotifiedAction } from '@/components/ui/notification-provider'

import { useActionState, useEffect, useId, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ConfirmationForm } from '@/components/ui/confirmation-dialog'
import { updateStudentNoteAction } from '../actions'

export function StudentNoteForm({ studentId, initialNote, onSaved, onCancel, onPendingChange }: { studentId: string; initialNote: string | null; onSaved?: () => void; onCancel?: () => void; onPendingChange?: (pending: boolean) => void }) {
  const noteId = useId()
  const helpId = useId()
  const countId = useId()
  const runAction = useNotifiedAction()
  const router = useRouter()
  const [note, setNote] = useState(initialNote || '')
  const [state, formAction, pending] = useActionState(async (_previous: { error: string; success: boolean }, formData: FormData) => {
    const result = await runAction(() => updateStudentNoteAction(studentId, formData), 'Catatan siswa berhasil disimpan.')
    if (result.success) {
      if (onSaved) { router.refresh(); onSaved() }
      else router.push('/admin/data-siswa')
    }
    return { error: result.error || '', success: !!result.success }
  }, { error: '', success: false })

  useEffect(() => { onPendingChange?.(pending) }, [pending, onPendingChange])

  return (
    <ConfirmationForm action={formAction} confirmation={{ title: note.trim() ? 'Simpan catatan siswa?' : 'Hapus catatan siswa?', description: note.trim() ? 'Catatan ini akan ditampilkan pada halaman data siswa di website sekolah.' : 'Catatan akan dihapus dari halaman data siswa di website sekolah.', confirmLabel: 'Ya, simpan' }} className="section-card space-y-5 p-5 sm:p-6">
      <div>
        <label htmlFor={noteId} className="mb-2 block text-sm font-semibold text-primary">Catatan untuk siswa</label>
        <p id={helpId} className="mb-3 text-sm text-text-secondary">Catatan dapat dibaca pada halaman detail siswa melalui pencarian NIM/NISN. Kosongkan untuk menghapus catatan.</p>
        <textarea id={noteId} name="note" value={note} onChange={event => setNote(event.target.value)} maxLength={5000} rows={8} disabled={pending} aria-describedby={`${helpId} ${countId}`} placeholder="Tuliskan catatan atau pesan untuk siswa..." className="w-full resize-y rounded-xl border border-border bg-white px-4 py-3 text-sm leading-6 text-primary focus:outline-2 focus:outline-primary disabled:opacity-60" />
        <p id={countId} className="mt-1 text-right text-xs text-text-muted">{note.length.toLocaleString('id-ID')} / 5.000 karakter</p>
      </div>
      {state.error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{state.error}</p>}
      {state.success && <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">Catatan berhasil disimpan.</p>}
      <div className="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row">
        <button type="submit" disabled={pending} className="min-h-11 rounded-xl bg-primary px-5 text-sm font-semibold text-white disabled:opacity-50">{pending ? 'Menyimpan...' : 'Simpan Catatan'}</button>
        {onCancel ? <button type="button" disabled={pending} onClick={onCancel} className="min-h-11 rounded-xl border border-border px-5 text-sm font-medium text-text-secondary disabled:opacity-50">Batal</button> : <Link href="/admin/data-siswa" className="inline-flex min-h-11 items-center justify-center rounded-xl border border-border px-5 text-sm font-medium text-text-secondary">Kembali ke Data Siswa</Link>}
      </div>
    </ConfirmationForm>
  )
}
