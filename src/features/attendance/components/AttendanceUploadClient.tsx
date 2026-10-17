'use client'

import { useActionState, useId, useRef, useState } from 'react'
import { UploadCloud, FileSpreadsheet, X } from 'lucide-react'
import { useNotifiedAction } from '@/components/ui/notification-provider'
import { ConfirmationForm } from '@/components/ui/confirmation-dialog'
import { uploadAttendanceAction, deleteAttendanceRecapAction } from '../actions'
import { AttendanceRow, type AttendanceValues } from './AttendanceRow'

const initialState = { error: '', success: false }

export function AttendanceUploadClient({ classId, className, semester, students, attendanceMap, totalCount }: {
  totalCount?: number
  classId: string
  className: string
  semester: string
  students: { id: string; nisn: string; name: string }[]
  attendanceMap: Record<string, AttendanceValues>
}) {
  const runAction = useNotifiedAction()
  const dialogRef = useRef<HTMLDialogElement>(null)
  const uploadTitleId = useId()
  const [showUploadError, setShowUploadError] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploadState, uploadAction, uploading] = useActionState(async (_previous: typeof initialState, data: FormData) => {
    if (selectedFile) data.set('file', selectedFile)
    const result = await runAction(() => uploadAttendanceAction(data), 'Rekap absensi berhasil diperbarui.')
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
    const result = await runAction(() => deleteAttendanceRecapAction(data), 'Rekap absensi berhasil dihapus.')
    if (result?.error) return { error: result.error, success: false }
    setSelectedFile(null)
    if (inputRef.current) inputRef.current.value = ''
    return { error: '', success: true }
  }, initialState)
  const count = totalCount ?? Object.keys(attendanceMap).length
  const hasData = count > 0
  const busy = uploading || deleting

  const uploadForm = (
        <ConfirmationForm action={uploadAction} confirmation={{ title: hasData ? 'Update rekap absensi?' : 'Simpan rekap absensi?', description: `Absensi dari Excel akan disimpan untuk ${className}, ${semester}. Absensi siswa yang tercantum pada file akan diperbarui; siswa yang tidak tercantum tetap tersimpan.`, confirmLabel: 'Ya, simpan rekap' }} className={`${hasData ? '' : 'section-card'} p-6 flex flex-col items-center justify-center text-center`}>
          <input type="hidden" name="classId" value={classId} />
          <input type="hidden" name="semester" value={semester} />
          <h3 id={uploadTitleId} className="text-lg font-bold text-primary mb-2">{hasData ? 'Update Rekap Absensi' : 'Upload Data Absensi'}</h3>
          <p className="text-sm text-text-secondary mb-2">Format Excel: <strong>NISN | NAMA | HADIR | SAKIT | IJIN | ALPA</strong></p>
          <p className="text-xs text-text-muted mb-6">{className} · {semester}</p>
          <label
            onDragOver={event => { event.preventDefault(); if (!busy) setIsDragOver(true) }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={event => { event.preventDefault(); setIsDragOver(false); if (!busy && event.dataTransfer.files[0]) setSelectedFile(event.dataTransfer.files[0]) }}
            className={`w-full max-w-xl p-8 border-2 border-dashed rounded-2xl cursor-pointer transition-all focus-within:ring-2 focus-within:ring-primary ${isDragOver ? 'border-primary bg-primary/5' : 'border-border bg-surface-alt hover:border-primary/50'}`}
          >
            <input ref={inputRef} type="file" name="file" aria-label="Pilih file Excel absensi" accept=".xlsx,.xls" disabled={busy} onChange={event => setSelectedFile(event.target.files?.[0] ?? null)} className="sr-only" />
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
      {hasData ? (
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
      ) : uploadForm}


      {hasData && (
      <section className="section-card overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border p-5">
          <div>
            <h2 className="text-lg font-bold text-primary">Rekap Absensi {className}</h2>
            <p className="text-sm text-text-secondary">{semester} · {count} siswa sudah memiliki absensi</p>
          </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" disabled={busy} onClick={() => { setShowUploadError(false); dialogRef.current?.showModal() }} className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">Update Rekap Absensi</button>
              <ConfirmationForm action={deleteAction} confirmation={{ title: `Hapus rekap ${className}?`, description: `Seluruh ${count} absensi siswa untuk ${className}, ${semester}, akan dihapus. Rekap kelas dan semester/tahun ajaran lainnya tetap tersimpan.`, confirmLabel: 'Ya, hapus rekap', destructive: true }}>
                <input type="hidden" name="classId" value={classId} />
                <input type="hidden" name="semester" value={semester} />
                <button disabled={busy} className="rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 disabled:opacity-50">{deleting ? 'Menghapus...' : 'Hapus Rekap Absensi'}</button>
              </ConfirmationForm>
            </div>
        </div>
        {deleteState.error && <p role="alert" className="p-4 text-sm text-red-600">{deleteState.error}</p>}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left text-sm">
              <thead className="bg-surface-alt text-text-secondary">
                <tr>{['NISN', 'Nama Siswa', 'HADIR', 'SAKIT', 'IJIN', 'ALPA', 'Aksi'].map(label => <th scope="col" key={label} className="px-4 py-3 font-semibold">{label}</th>)}</tr>
              </thead>
              <tbody>{students.length === 0 && <tr><td colSpan={7} className="px-4 py-8 text-center text-text-muted">Tidak ada siswa yang cocok dengan pencarian.</td></tr>}{students.map(student => <AttendanceRow key={`${student.id}-${JSON.stringify(attendanceMap[student.id])}`} student={student} attendance={attendanceMap[student.id]} classId={classId} semester={semester} disabled={busy} />)}</tbody>
            </table>
          </div>
      </section>
      )}
    </div>
  )
}
