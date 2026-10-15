'use client'

import { useNotifiedAction } from '@/components/ui/notification-provider'

import { useConfirmation } from '@/components/ui/confirmation-dialog'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'
import { deleteStudentAction } from '../actions'

export function DeleteStudentButton({ id, name, showLabel = false }: { id: string; name: string; showLabel?: boolean }) {
  const runAction = useNotifiedAction()
  const confirmAction = useConfirmation()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={async () => {
        if (!await confirmAction({ title: 'Hapus data?', description: `Hapus data siswa ${name}?`, confirmLabel: 'Ya, hapus', destructive: true })) return
        startTransition(async () => {
          const result = await runAction(() => deleteStudentAction(id), 'Data siswa berhasil dihapus.')
          if (result.success) router.refresh()
        })
      }}
      className="inline-flex min-h-11 min-w-11 items-center justify-center gap-1.5 rounded-lg px-2 text-sm font-semibold text-red-700 transition-colors hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700 disabled:opacity-50"
      aria-label={`Hapus ${name}`}
    >
      <Trash2 className="h-4 w-4" aria-hidden="true" />
      {showLabel && (isPending ? 'Menghapus...' : 'Hapus')}
    </button>
  )
}
