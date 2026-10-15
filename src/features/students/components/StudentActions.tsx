'use client'

import { useNotifiedAction } from '@/components/ui/notification-provider'

import { useConfirmation } from '@/components/ui/confirmation-dialog'

import { useId, useRef, useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { EllipsisVertical, Info, Upload, Pencil, Trash2, StickyNote } from 'lucide-react'
import { deleteStudentAction } from '../actions'

export function StudentActions({ id, name }: { id: string; name: string }) {
  const runAction = useNotifiedAction()
  const confirmAction = useConfirmation()
  const popoverId = useId()
  const popover = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const [error, setError] = useState('')
  const [pending, startTransition] = useTransition()
  const router = useRouter()
  const itemClass = 'flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-left text-sm font-medium text-text-secondary hover:bg-surface-alt focus-visible:outline-2 focus-visible:outline-primary'

  return (
    <>
      <button type="button" popoverTarget={popoverId} aria-label={`Aksi untuk ${name}`} title={`Aksi untuk ${name}`} onClick={event => {
        const rect = event.currentTarget.getBoundingClientRect()
        setPosition({ top: Math.max(8, Math.min(rect.bottom + 6, window.innerHeight - 280)), left: Math.max(8, Math.min(rect.right - 208, window.innerWidth - 216)) })
      }} className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-white text-text-secondary transition-colors hover:border-primary/30 hover:bg-primary/5 hover:text-primary focus-visible:outline-2 focus-visible:outline-primary">
        <EllipsisVertical className="h-5 w-5" aria-hidden="true" />
      </button>
      <div ref={popover} id={popoverId} popover="auto" aria-label={`Aksi siswa ${name}`} style={{ ...position, right: 'auto', bottom: 'auto' }} className="fixed m-0 max-h-[calc(100dvh-1rem)] w-52 overflow-y-auto rounded-xl border border-border bg-white p-1.5 shadow-xl">
        <Link href={`/admin/data-siswa/${id}`} onClick={() => popover.current?.hidePopover()} className={itemClass}><Info className="h-4 w-4" aria-hidden="true" />Informasi</Link>
        <Link href={`/admin/data-siswa/${id}#ijazah`} onClick={() => popover.current?.hidePopover()} className={itemClass}><Upload className="h-4 w-4" aria-hidden="true" />Upload Ijazah</Link>
        <Link href={`/admin/data-siswa/${id}/catatan`} onClick={() => popover.current?.hidePopover()} className={itemClass}><StickyNote className="h-4 w-4" aria-hidden="true" />Catatan</Link>
        <Link href={`/admin/data-siswa/${id}/edit`} onClick={() => popover.current?.hidePopover()} className={itemClass}><Pencil className="h-4 w-4" aria-hidden="true" />Edit</Link>
        <div className="my-1 border-t border-border" />
        <button type="button" disabled={pending} onClick={async () => {
          if (!await confirmAction({ title: 'Hapus data?', description: `Hapus data siswa ${name}?`, confirmLabel: 'Ya, hapus', destructive: true })) return
          setError('')
          startTransition(async () => {
            try {
              const result = await runAction(() => deleteStudentAction(id), 'Data siswa berhasil dihapus.')
              if (result.error) { setError(result.error); return }
              popover.current?.hidePopover()
              router.refresh()
            } catch {
              setError('Gagal menghapus siswa. Silakan coba lagi.')
            }
          })
        }} className={`${itemClass} text-red-700 hover:bg-red-50 disabled:opacity-50`}><Trash2 className="h-4 w-4" aria-hidden="true" />{pending ? 'Menghapus...' : 'Hapus'}</button>
      </div>
      {error && <p role="alert" className="mt-2 max-w-56 text-left text-xs text-red-700">{error}</p>}
    </>
  )
}
