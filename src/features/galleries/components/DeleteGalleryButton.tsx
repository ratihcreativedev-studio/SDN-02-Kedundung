'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'
import { deleteGalleryAction } from '../actions'

export function DeleteGalleryButton({ id }: { id: string }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        if (!window.confirm('Hapus foto galeri ini?')) return
        startTransition(async () => {
          await deleteGalleryAction(id)
          router.refresh()
        })
      }}
      className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-lg border border-red-200 bg-white px-2 text-sm font-semibold text-red-700 transition-colors hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700 disabled:opacity-50"
      aria-label="Hapus foto"
    >
      <Trash2 className="h-4 w-4 shrink-0" aria-hidden="true" />
      {isPending ? 'Menghapus...' : 'Hapus foto'}
    </button>
  )
}
