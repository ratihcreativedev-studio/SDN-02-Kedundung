'use client'

import { createContext, useCallback, useContext, useEffect, useId, useRef, useState, type ComponentProps, type ReactNode } from 'react'
import { CircleHelp, TriangleAlert } from 'lucide-react'

type Confirmation = { title?: string; description: string; confirmLabel?: string; destructive?: boolean }
type Confirm = (options: Confirmation) => Promise<boolean>
const ConfirmationContext = createContext<Confirm | null>(null)

export function ConfirmationProvider({ children }: { children: ReactNode }) {
  const [options, setOptions] = useState<Confirmation | null>(null)
  const resolveRef = useRef<((answer: boolean) => void) | null>(null)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const cancelRef = useRef<HTMLButtonElement>(null)
  const titleId = useId()
  const descriptionId = useId()

  const confirm = useCallback<Confirm>(options => {
    // Ignore repeated requests while a confirmation is already open.
    if (resolveRef.current) return Promise.resolve(false)
    return new Promise(resolve => {
      resolveRef.current = resolve
      setOptions(options)
    })
  }, [])

  const finish = useCallback((answer: boolean) => {
    const resolve = resolveRef.current
    resolveRef.current = null
    dialogRef.current?.close()
    setOptions(null)
    resolve?.(answer)
  }, [])

  useEffect(() => {
    if (options && !dialogRef.current?.open) {
      dialogRef.current?.showModal()
      cancelRef.current?.focus()
    }
  }, [options])

  useEffect(() => () => {
    resolveRef.current?.(false)
    resolveRef.current = null
  }, [])

  return (
    <ConfirmationContext.Provider value={confirm}>
      {children}
      <dialog ref={dialogRef} aria-labelledby={titleId} aria-describedby={descriptionId} onCancel={event => { event.preventDefault(); finish(false) }} onClose={() => { if (resolveRef.current) finish(false) }} className="fixed inset-0 m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl border border-border bg-white p-0 text-text-primary shadow-2xl backdrop:bg-slate-950/45 backdrop:backdrop-blur-sm">
        <div className="p-6">
          <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl ${options?.destructive ? 'bg-red-50 text-red-600' : 'bg-primary/10 text-primary'}`}>
            {options?.destructive ? <TriangleAlert aria-hidden="true" /> : <CircleHelp aria-hidden="true" />}
          </div>
          <h2 id={titleId} className="text-lg font-bold text-primary">{options?.title || 'Konfirmasi tindakan'}</h2>
          <p id={descriptionId} className="mt-2 break-words text-sm leading-6 text-text-secondary">{options?.description}</p>
        </div>
        <div className="flex flex-col-reverse gap-3 border-t border-border bg-surface-alt/50 px-6 py-4 sm:flex-row sm:justify-end">
          <button ref={cancelRef} type="button" onClick={() => finish(false)} className="min-h-11 rounded-xl border border-border bg-white px-5 text-sm font-semibold text-text-secondary focus-visible:outline-2 focus-visible:outline-primary">Batal</button>
          <button type="button" onClick={() => finish(true)} className={`min-h-11 rounded-xl px-5 text-sm font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 ${options?.destructive ? 'bg-red-600 hover:bg-red-700 focus-visible:outline-red-600' : 'bg-primary hover:bg-primary/90 focus-visible:outline-primary'}`}>{options?.confirmLabel || 'Ya, lanjutkan'}</button>
        </div>
      </dialog>
    </ConfirmationContext.Provider>
  )
}

export function useConfirmation() {
  const confirm = useContext(ConfirmationContext)
  if (!confirm) throw new Error('useConfirmation must be used within ConfirmationProvider')
  return confirm
}

export function ConfirmationForm({ confirmation, ...props }: Omit<ComponentProps<'form'>, 'onSubmit'> & { confirmation: Confirmation | ((submitter: HTMLButtonElement | HTMLInputElement | null) => Confirmation) }) {
  const confirm = useConfirmation()
  const approved = useRef(false)
  const waiting = useRef(false)

  return <form {...props} onSubmit={async event => {
    if (approved.current) { approved.current = false; return }
    event.preventDefault()
    if (waiting.current) return
    const form = event.currentTarget
    const submitter = (event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | HTMLInputElement | null
    waiting.current = true
    try {
      if (await confirm(typeof confirmation === 'function' ? confirmation(submitter) : confirmation) && form.isConnected) {
        approved.current = true
        // Preserve browser validation, submitter values and React action state.
        form.requestSubmit(submitter)
        approved.current = false
      }
    } finally { waiting.current = false }
  }} />
}
