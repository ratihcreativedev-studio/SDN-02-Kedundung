'use client'

import { useNotifiedAction } from '@/components/ui/notification-provider'

import { useConfirmation } from '@/components/ui/confirmation-dialog'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, Loader2 } from 'lucide-react'
import { deleteAnnouncementAction } from '../actions'

export function DeleteAnnouncementButton({ id, title }: { id: string; title: string }) {
  const runAction = useNotifiedAction()
  const confirmAction = useConfirmation()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={async () => {
        if (!await confirmAction({ title: 'Hapus data?', description: `Hapus pengumuman ${title}?`, confirmLabel: 'Ya, hapus', destructive: true })) return
        startTransition(async () => {
          const result = await runAction(() => deleteAnnouncementAction(id), 'Pengumuman berhasil dihapus.')
          if (result.success) router.refresh()
        })
      }}
      className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-red-600 transition-colors hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 disabled:cursor-wait disabled:opacity-50"
      aria-label={isPending ? 'Menghapus pengumuman...' : `Hapus ${title}`}
      aria-busy={isPending}
      title="Hapus pengumuman"
    >
      {isPending ? <Loader2 className="h-4 w-4 motion-safe:animate-spin" aria-hidden="true" /> : <Trash2 className="h-4 w-4" aria-hidden="true" />}
    </button>
  )
}
