'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { StickyNote, X } from 'lucide-react'
import { StudentNoteForm } from './StudentNoteForm'

export function StudentNoteDialog({ studentId, name, initialNote, onClose }: {
  studentId: string
  name: string
  initialNote: string | null
  onClose: () => void
}) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  const descriptionId = useId()
  const [pending, setPending] = useState(false)

  useEffect(() => {
    const dialog = dialogRef.current
    dialog?.showModal()
    return () => { dialog?.close() }
  }, [])

  return <dialog
    ref={dialogRef}
    aria-labelledby={titleId}
    aria-describedby={descriptionId}
    onCancel={event => { event.preventDefault(); if (!pending) onClose() }}
    className="fixed inset-0 m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-xl overflow-y-auto rounded-2xl border border-border bg-white p-0 text-left text-text-primary shadow-2xl backdrop:bg-slate-950/45 backdrop:backdrop-blur-sm"
  >
    <div className="flex items-start justify-between gap-4 border-b border-border p-5 sm:p-6">
      <div>
        <h2 id={titleId} className="flex items-center gap-2 text-lg font-bold text-primary"><StickyNote className="h-5 w-5 text-amber-500" aria-hidden="true" />Catatan Siswa</h2>
        <p id={descriptionId} className="mt-1 text-sm text-text-secondary">{name}</p>
      </div>
      <button type="button" onClick={onClose} disabled={pending} aria-label="Tutup catatan siswa" className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-text-secondary hover:bg-surface-alt focus-visible:outline-2 focus-visible:outline-primary disabled:opacity-50"><X className="h-5 w-5" aria-hidden="true" /></button>
    </div>
    <StudentNoteForm studentId={studentId} initialNote={initialNote} onSaved={onClose} onCancel={onClose} onPendingChange={setPending} />
  </dialog>
}
