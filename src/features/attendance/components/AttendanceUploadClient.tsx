'use client'

import { useNotifiedAction } from '@/components/ui/notification-provider'

import { ConfirmationForm } from '@/components/ui/confirmation-dialog'

import { useActionState, useRef, useState } from 'react'
import { uploadAttendanceAction } from '../actions'
import { UploadCloud, FileSpreadsheet, CheckCircle2 } from 'lucide-react'

const initialState = { error: '', success: false }

export function AttendanceUploadClient({
  monthYear,
  students,
  attendances,
}: {
  monthYear: string
  students: { id: string; nisn: string; name: string }[]
  attendances: any[]
}) {
  const runAction = useNotifiedAction()
  const [state, formAction, isPending] = useActionState(async (_prev: typeof initialState, formData: FormData) => {
    const result = await runAction(() => uploadAttendanceAction(formData), 'Absensi siswa berhasil diimpor.')
    if (result?.error) return { error: result.error, success: false }
    return { error: '', success: true }
  }, initialState)

  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const hasData = attendances.length > 0

  if (students.length === 0) {
    return (
      <div className="section-card p-10 text-center text-text-muted animate-fade-in-up animate-delay-200">
        Pilih kelas yang memiliki siswa untuk mengelola absensi.
      </div>
    )
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setSelectedFile(e.dataTransfer.files[0])
    }
  }

  return (
    <div className="space-y-6 animate-fade-in-up animate-delay-200">
      {/* Upload Zone */}
      <ConfirmationForm confirmation={{ title: 'Simpan data?', description: 'Anda akan menyimpan absensi siswa dari file ini. Pastikan data sudah benar sebelum melanjutkan.', confirmLabel: 'Ya, simpan' }} action={formAction} className="relative overflow-hidden section-card p-8 flex flex-col items-center justify-center text-center group">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 opacity-50"></div>
        <input type="hidden" name="monthYear" value={monthYear} />
        <input type="hidden" name="students" value={JSON.stringify(students)} />
        
        <div className="relative z-10 w-full max-w-2xl flex flex-col items-center">
          <h3 className="text-xl font-bold text-primary mb-2">
            {hasData ? 'Upload Ulang Rekap Absensi' : 'Upload Rekap Absensi'}
          </h3>
          <p className="text-sm text-text-secondary mb-8">
            Format Excel: <strong>NISN</strong> | <strong>Nama</strong> | <strong>Hadir</strong> | <strong>Sakit</strong> | <strong>Izin</strong> | <strong>Alpha</strong>
          </p>

          <div 
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`w-full p-10 border-2 border-dashed rounded-3xl cursor-pointer transition-all duration-300 ${
              isDragOver 
                ? 'border-primary bg-primary/10 scale-[1.02] shadow-xl shadow-primary/10' 
                : 'border-border bg-white hover:border-primary/50 hover:bg-surface-alt hover:shadow-lg'
            }`}
          >
            <input 
              type="file" 
              name="file" 
              accept=".xlsx, .xls" 
              ref={fileInputRef} 
              className="hidden" 
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  setSelectedFile(e.target.files[0])
                }
              }}
            />
            
            <div className="flex flex-col items-center justify-center gap-4">
              {selectedFile ? (
                <>
                  <div className="h-16 w-16 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center shadow-inner">
                    <FileSpreadsheet size={32} />
                  </div>
                  <div>
                    <p className="font-semibold text-primary text-lg">{selectedFile.name}</p>
                    <p className="text-sm text-text-muted mt-1">Klik atau drag untuk mengganti file</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="h-16 w-16 rounded-full bg-primary/10 text-primary flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-300">
                    <UploadCloud size={32} />
                  </div>
                  <div>
                    <p className="font-medium text-text-secondary text-base">Drag & drop file Excel di sini</p>
                    <p className="text-sm text-text-muted mt-1">atau klik untuk menelusuri file</p>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="mt-8 flex flex-col items-center gap-3 w-full">
            <button 
              type="submit" 
              disabled={isPending || !selectedFile} 
              className="w-full sm:w-auto min-w-[200px] h-12 rounded-xl bg-primary px-8 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/30 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none"
            >
              {isPending ? 'Memproses File...' : 'Upload & Simpan'}
            </button>
            {state.success && <span className="flex items-center justify-center gap-2 text-sm font-medium text-emerald-600 bg-emerald-50 px-4 py-2 rounded-full animate-fade-in"><CheckCircle2 size={16}/> Data berhasil diperbarui.</span>}
            {state.error && <span className="text-sm font-medium text-red-600 bg-red-50 px-4 py-2 rounded-full animate-fade-in">{state.error}</span>}
          </div>
        </div>
      </ConfirmationForm>

      {/* Read-Only Data View */}
      {hasData && (
        <div className="section-card overflow-hidden">
          <div className="border-b border-border bg-surface-alt px-6 py-4">
            <h3 className="font-bold text-primary">Data Absensi: {monthYear}</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-max w-full text-left text-sm">
              <thead className="bg-surface-alt/50 text-text-secondary border-b border-border">
                <tr>
                  <th className="px-6 py-4 font-semibold">NISN</th>
                  <th className="px-6 py-4 font-semibold">Nama Siswa</th>
                  <th className="px-4 py-4 font-semibold text-center text-emerald-600">Hadir</th>
                  <th className="px-4 py-4 font-semibold text-center text-amber-600">Sakit</th>
                  <th className="px-4 py-4 font-semibold text-center text-blue-600">Izin</th>
                  <th className="px-4 py-4 font-semibold text-center text-red-600">Alpha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {students.map((student) => {
                  const att = attendances.find(a => a.studentId === student.id)
                  return (
                    <tr key={student.id} className="hover:bg-surface-alt/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-primary">{student.nisn}</td>
                      <td className="px-6 py-4 text-text-secondary">{student.name}</td>
                      <td className="px-4 py-4 text-center font-bold text-emerald-700">{att?.hadir ?? '-'}</td>
                      <td className="px-4 py-4 text-center font-bold text-amber-700">{att?.sakit ?? '-'}</td>
                      <td className="px-4 py-4 text-center font-bold text-blue-700">{att?.izin ?? '-'}</td>
                      <td className="px-4 py-4 text-center font-bold text-red-700">{att?.alpha ?? '-'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
