'use client'

import { useNotifiedAction } from '@/components/ui/notification-provider'

import { useConfirmation } from '@/components/ui/confirmation-dialog'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Globe, Loader2 } from 'lucide-react'
import { publishAnnouncementAction } from '../actions'

export function PublishAnnouncementButton({ id, title }: { id: string; title: string }) {
  const runAction = useNotifiedAction()
  const confirmAction = useConfirmation()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()


  return (
    <button
      type="button"
      disabled={isPending}
      onClick={async () => {
        if (!await confirmAction({ title: 'Publikasikan pengumuman?', description: `Unggah pengumuman "${title}"? Pengumuman akan tampil di halaman publik.`, confirmLabel: 'Ya, publikasikan', destructive: false })) return
        startTransition(async () => {
          const result = await runAction(() => publishAnnouncementAction(id), 'Pengumuman berhasil dipublikasikan.')
          if (result.success) router.refresh()
        })
      }}
      className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-emerald-600 transition-colors hover:bg-emerald-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 disabled:cursor-wait disabled:opacity-50"
      aria-label={isPending ? 'Mengunggah pengumuman...' : `Unggah ${title}`}
      aria-busy={isPending}
      title="Unggah pengumuman"
    >
      {isPending ? <Loader2 className="h-4 w-4 motion-safe:animate-spin" aria-hidden="true" /> : <Globe className="h-4 w-4" aria-hidden="true" />}
    </button>
  )
}
