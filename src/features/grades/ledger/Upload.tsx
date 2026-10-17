'use client'

import { createContext, useContext, useActionState, useId, useRef, useState, type ReactNode } from 'react'
import Link from 'next/link'
import { UploadCloud, FileSpreadsheet, Info, X } from 'lucide-react'
import { useNotifiedAction } from '@/components/ui/notification-provider'
import { ConfirmationForm } from '@/components/ui/confirmation-dialog'
import { uploadLedgerAction, deleteLedgerRecapAction } from './actions'
import type { LedgerCategory } from './format'

const LedgerBusyContext = createContext(false)
export const useLedgerBusy = () => useContext(LedgerBusyContext)

const initialState = { error: '', success: false }

export function LedgerUpload({ classId, className, semester, category, count, children }: {
  classId: string
  className: string
  semester: string
  category: LedgerCategory
  count: number
  children: ReactNode
}) {
  const subjects = category === 'mata-pelajaran'
  const uploadHref = `/admin/nilai/mata-pelajaran?${new URLSearchParams({ classId, semester }).toString()}`
  const runAction = useNotifiedAction()
  const dialogRef = useRef<HTMLDialogElement>(null)
  const uploadTitleId = useId()
  const [showUploadError, setShowUploadError] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploadState, uploadAction, uploading] = useActionState(async (_previous: typeof initialState, data: FormData) => {
    if (selectedFile) data.set('file', selectedFile)
    const result = await runAction(() => uploadLedgerAction(data), 'Nilai mata pelajaran dan ekstrakurikuler berhasil diperbarui.')
    if (result?.error) {
      setShowUploadError(true)
      return { error: result.error, success: false }
    }
    dialogRef.current?.close()
    setSelectedFile(null)
    if (inputRef.current) inputRef.current.value = ''
    return { error: '', success: true }
  }, initialState)
  const [deleteState, deleteAction, deleting] = useActionState(async (_previous: typeof initialState, data: FormData) => {
    const result = await runAction(() => deleteLedgerRecapAction(data), 'Rekap nilai berhasil dihapus.')
    return result?.error ? { error: result.error, success: false } : { error: '', success: true }
  }, initialState)
  const hasData = count > 0
  const busy = uploading || deleting

  const uploadForm = (
        <ConfirmationForm action={uploadAction} confirmation={{ title: hasData ? 'Update rekap nilai?' : 'Simpan rekap nilai?', description: `Nilai mata pelajaran dan ekstrakurikuler dari Excel akan disimpan untuk ${className}, ${semester}. Nilai siswa yang tercantum pada file akan diperbarui; siswa yang tidak tercantum tetap tersimpan. Sel kosong akan mengosongkan nilai sebelumnya.`, confirmLabel: 'Ya, simpan rekap' }} className={`${hasData ? '' : 'section-card'} p-6 flex flex-col items-center justify-center text-center`}>
          <input type="hidden" name="classId" value={classId} />
          <input type="hidden" name="semester" value={semester} />
          <input type="hidden" name="category" value={category} />
          <h3 id={uploadTitleId} className="text-lg font-bold text-primary mb-2">{hasData ? 'Update Rekap Nilai' : 'Upload Data Nilai'}</h3>
          <p className="text-sm text-text-secondary mb-2">Format Excel: <strong>NAMA SISWA | NISN | NIS | MATA PELAJARAN | KETIDAKHADIRAN | EKSTRA KURIKULER</strong></p>
          <p className="text-sm text-text-secondary mb-2">Satu file leger sekaligus mengisi nilai mata pelajaran dan ekstrakurikuler. Gunakan kode atau nama yang terdaftar untuk kolom tambahan di kelompok yang sesuai.</p>
          <p className="text-xs text-text-muted mb-6">{className} · {semester}</p>
          <label
            onDragOver={event => { event.preventDefault(); if (!busy) setIsDragOver(true) }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={event => { event.preventDefault(); setIsDragOver(false); if (!busy && event.dataTransfer.files[0]) setSelectedFile(event.dataTransfer.files[0]) }}
            className={`w-full max-w-xl p-8 border-2 border-dashed rounded-2xl cursor-pointer transition-all focus-within:ring-2 focus-within:ring-primary ${isDragOver ? 'border-primary bg-primary/5' : 'border-border bg-surface-alt hover:border-primary/50'}`}
          >
            <input ref={inputRef} type="file" name="file" aria-label="Pilih file Excel nilai" accept=".xlsx,.xls" disabled={busy} onChange={event => setSelectedFile(event.target.files?.[0] ?? null)} className="sr-only" />
            <span className="flex flex-col items-center justify-center gap-3">
              <span className={`flex h-12 w-12 items-center justify-center rounded-full ${selectedFile ? 'bg-emerald-500/10 text-emerald-600' : 'bg-primary/10 text-primary'}`}>
                {selectedFile ? <FileSpreadsheet size={24} /> : <UploadCloud size={24} />}
              </span>
              <span className="font-medium text-text-secondary">{selectedFile ? selectedFile.name : 'Drag & drop file Excel di sini, atau klik untuk memilih file'}</span>
              {selectedFile && <span className="text-xs text-text-muted">Klik untuk mengganti file</span>}
            </span>
          </label>
          <button disabled={busy || !selectedFile} className="mt-6 rounded-xl bg-primary px-8 py-3 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 disabled:opacity-50">{uploading ? 'Memproses...' : hasData ? 'Simpan Update Rekap' : 'Upload & Simpan'}</button>
          {showUploadError && uploadState.error && <p role="alert" className="mt-3 text-sm text-red-600">{uploadState.error}</p>}
        </ConfirmationForm>
  )

  return (
    <div className="space-y-6 animate-fade-in-up animate-delay-200">
      {subjects ? (hasData ? (
        <dialog
          ref={dialogRef}
          aria-labelledby={uploadTitleId}
          onCancel={event => { if (busy) event.preventDefault() }}
          onClose={() => {
            setSelectedFile(null)
            setIsDragOver(false)
            setShowUploadError(false)
            if (inputRef.current) inputRef.current.value = ''
          }}
          className="fixed inset-0 m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-2xl overflow-y-auto rounded-2xl border border-border bg-white p-0 text-text-primary shadow-2xl backdrop:bg-slate-950/45 backdrop:backdrop-blur-sm"
        >
          <div className="flex justify-end px-4 pt-4">
            <button type="button" aria-label="Tutup dialog update rekap" disabled={busy} onClick={() => dialogRef.current?.close()} className="rounded-lg p-2 text-text-secondary hover:bg-surface-alt focus-visible:outline-2 focus-visible:outline-primary disabled:opacity-50">
              <X size={20} />
            </button>
          </div>
          {uploadForm}
        </dialog>
      ) : uploadForm) : !hasData && (
        <div className="section-card space-y-3 p-6">
          <h3 className="text-lg font-bold text-primary">Upload melalui Nilai Mata Pelajaran</h3>
          <p className="text-sm text-text-secondary">Nilai ekstrakurikuler diisi bersama nilai mata pelajaran dari satu file leger Excel. Untuk menambah atau memperbarui data melalui Excel, gunakan menu Nilai Mata Pelajaran.</p>
          <p className="text-xs text-text-muted">{className} · {semester}</p>
          <Link href={uploadHref} className="inline-flex min-h-11 items-center rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white">Buka Nilai Mata Pelajaran</Link>
        </div>
      )}


      {hasData && (
      <section className="section-card overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border p-5">
          <div>
            <h2 className="text-lg font-bold text-primary">Rekap Nilai {className}</h2>
            <p className="text-sm text-text-secondary">{semester} · {count} siswa sudah memiliki nilai</p>
          </div>
            <div className="flex flex-wrap gap-2">
              {subjects && <button type="button" disabled={busy} onClick={() => { setShowUploadError(false); dialogRef.current?.showModal() }} className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">Update Rekap Nilai</button>}
              <ConfirmationForm action={deleteAction} confirmation={{ title: `Hapus rekap ${className}?`, description: `Seluruh nilai ${subjects ? 'mata pelajaran' : 'ekstrakurikuler'} untuk ${className}, ${semester}, akan dihapus. Kategori lain, ketidakhadiran, kelas dan semester lainnya tetap tersimpan.`, confirmLabel: 'Ya, hapus rekap', destructive: true }}>
                <input type="hidden" name="classId" value={classId} />
                <input type="hidden" name="semester" value={semester} />
                <input type="hidden" name="category" value={category} />
                <button disabled={busy} className="rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 disabled:opacity-50">{deleting ? 'Menghapus...' : 'Hapus Rekap Nilai'}</button>
              </ConfirmationForm>
            </div>
        </div>
        {!subjects && (
          <div className="flex items-start gap-2 border-b border-border bg-primary/5 px-5 py-3 text-sm text-text-secondary">
            <Info aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <p>Untuk memperbarui seluruh nilai melalui Excel, gunakan menu{' '}
              <Link href={uploadHref} className="font-semibold text-primary underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-primary">Nilai Mata Pelajaran</Link>.
            </p>
          </div>
        )}
        {deleteState.error && <p role="alert" className="p-4 text-sm text-red-600">{deleteState.error}</p>}
        <LedgerBusyContext.Provider value={busy}>{children}</LedgerBusyContext.Provider>
      </section>
      )}
    </div>
  )
}
