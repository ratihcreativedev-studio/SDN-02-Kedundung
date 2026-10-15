'use client'

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { CheckCircle2, CircleAlert, X } from 'lucide-react'
import { executeNotifiedAction, type ActionResult, type NotificationKind } from './notification-action'

type Notice = { id: number; message: string; kind: NotificationKind }
type Notify = (message: string, kind: NotificationKind) => void
const NotificationContext = createContext<Notify | null>(null)

function Toast({ notice, dismiss }: { notice: Notice; dismiss: (id: number) => void }) {
  const [paused, setPaused] = useState(false)
  useEffect(() => {
    if (paused || notice.kind === 'error') return
    const timer = setTimeout(() => dismiss(notice.id), 6000)
    return () => clearTimeout(timer)
  }, [paused, dismiss, notice.id, notice.kind])

  return <div onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocus={() => setPaused(true)} onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false) }} className={`pointer-events-auto flex items-start gap-3 rounded-2xl border bg-white p-4 shadow-xl ${notice.kind === 'success' ? 'border-emerald-200' : 'border-red-200'}`}>
    {notice.kind === 'success' ? <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" aria-hidden="true" /> : <CircleAlert className="mt-0.5 h-5 w-5 shrink-0 text-red-600" aria-hidden="true" />}
    <div className="min-w-0 flex-1" role={notice.kind === 'error' ? 'alert' : 'status'}>
      <p className="text-sm font-semibold text-primary">{notice.kind === 'success' ? 'Berhasil' : 'Tindakan gagal'}</p>
      <p className="mt-1 break-words text-sm leading-5 text-text-secondary">{notice.message}</p>
    </div>
    <button type="button" onClick={() => dismiss(notice.id)} aria-label="Tutup notifikasi" className="-mr-2 -mt-2 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-text-muted hover:bg-surface-alt focus-visible:outline-2 focus-visible:outline-primary"><X className="h-4 w-4" aria-hidden="true" /></button>
  </div>
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notices, setNotices] = useState<Notice[]>([])
  const nextId = useRef(0)
  const notify = useCallback<Notify>((message, kind) => {
    const id = ++nextId.current
    setNotices(previous => [...previous.slice(-3), { id, message, kind }])
  }, [])
  const dismiss = useCallback((id: number) => setNotices(previous => previous.filter(notice => notice.id !== id)), [])

  return <NotificationContext.Provider value={notify}>
    {children}
    <div aria-label="Notifikasi" className="pointer-events-none fixed inset-x-3 top-20 z-[100] flex max-h-[calc(100dvh-6rem)] flex-col gap-3 overflow-y-auto sm:left-auto sm:right-6 sm:w-96">
      {notices.map(notice => <Toast key={notice.id} notice={notice} dismiss={dismiss} />)}
    </div>
  </NotificationContext.Provider>
}

export function useNotifiedAction() {
  const notify = useContext(NotificationContext)
  if (!notify) throw new Error('useNotifiedAction requires NotificationProvider')
  return useCallback((action: () => Promise<ActionResult>, successMessage: string) => executeNotifiedAction(action, successMessage, notify), [notify])
}
