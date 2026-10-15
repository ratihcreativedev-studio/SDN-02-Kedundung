'use client'

import { useNotifiedAction } from '@/components/ui/notification-provider'

import { useConfirmation } from '@/components/ui/confirmation-dialog'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'
import { deleteClassAction } from '../actions'

export function DeleteClassButton({ id, name }: { id: string; name: string }) {
  const runAction = useNotifiedAction()
  const confirmAction = useConfirmation()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={async () => {
        if (!await confirmAction({ title: 'Hapus data?', description: `Hapus ${name}? Siswa di kelas ini akan menjadi tanpa kelas.`, confirmLabel: 'Ya, hapus', destructive: true })) return
        startTransition(async () => {
          const result = await runAction(() => deleteClassAction(id), 'Kelas berhasil dihapus.')
          if (result.success) router.refresh()
        })
      }}
      className="inline-flex items-center justify-center rounded-md p-2 text-red-500 transition-colors hover:bg-red-50 hover:text-red-700 disabled:opacity-50 dark:hover:bg-red-500/10"
      aria-label={`Hapus ${name}`}
    >
      <Trash2 className="h-4 w-4" />
    </button>
  )
}
