'use client'

import { useNotifiedAction } from '@/components/ui/notification-provider'

import { ConfirmationForm } from '@/components/ui/confirmation-dialog'

import { useActionState, useRef, useState } from 'react'
import { uploadGradesAction } from '../actions'
import { UploadCloud, FileSpreadsheet, CheckCircle2 } from 'lucide-react'

const initialState = { error: '', success: false }

export function GradeUploadClient({
  subjectId,
  semester,
  students,
  gradeMap,
}: {
  subjectId: string
  semester: string
  students: { id: string; nisn: string; name: string }[]
  gradeMap: Record<string, any>
}) {
  const runAction = useNotifiedAction()
  const [state, formAction, isPending] = useActionState(async (_prev: typeof initialState, formData: FormData) => {
    const result = await runAction(() => uploadGradesAction(formData), 'Nilai siswa berhasil diimpor.')
    if (result?.error) return { error: result.error, success: false }
    return { error: '', success: true }
  }, initialState)

  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const hasData = Object.keys(gradeMap).length > 0

  if (students.length === 0) {
    return (
      <div className="section-card p-10 text-center text-text-muted animate-fade-in-up animate-delay-200">
        Pilih kelas yang memiliki siswa untuk mengisi nilai.
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
      <ConfirmationForm confirmation={{ title: 'Simpan data?', description: 'Anda akan menyimpan nilai siswa dari file ini. Pastikan data sudah benar sebelum melanjutkan.', confirmLabel: 'Ya, simpan' }} action={formAction} className="section-card p-6 flex flex-col items-center justify-center text-center">
        <input type="hidden" name="subjectId" value={subjectId} />
        <input type="hidden" name="semester" value={semester} />
        <input type="hidden" name="students" value={JSON.stringify(students)} />
        
        <h3 className="text-lg font-bold text-primary mb-2">
          {hasData ? 'Upload Ulang Data Nilai' : 'Upload Data Nilai'}
        </h3>
        <p className="text-sm text-text-secondary mb-6">
          Format Excel: <strong>NISN</strong> | <strong>Nama</strong> | <strong>UH 1</strong> | <strong>UH 2</strong> | <strong>UH 3</strong> | <strong>UAS</strong>
        </p>

        <div 
          onClick={() => fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`w-full max-w-xl p-8 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${
            isDragOver ? 'border-primary bg-primary/5' : 'border-border bg-surface-alt hover:border-primary/50'
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
          
          <div className="flex flex-col items-center justify-center gap-3">
            {selectedFile ? (
              <>
                <div className="h-12 w-12 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                  <FileSpreadsheet size={24} />
                </div>
                <p className="font-semibold text-primary">{selectedFile.name}</p>
                <p className="text-xs text-text-muted">Klik untuk mengganti file</p>
              </>
            ) : (
              <>
                <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                  <UploadCloud size={24} />
                </div>
                <p className="font-medium text-text-secondary">Drag & drop file Excel di sini, atau klik untuk memilih file</p>
              </>
            )}
          </div>
        </div>

        <div className="mt-6 flex flex-col items-center gap-3">
          <button 
            type="submit" 
            disabled={isPending || !selectedFile} 
            className="rounded-xl bg-primary px-8 py-3 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/30 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-lg"
          >
            {isPending ? 'Memproses File...' : 'Upload & Simpan'}
          </button>
          {state.success && <span className="flex items-center gap-2 text-sm font-medium text-emerald-600"><CheckCircle2 size={16}/> Data nilai berhasil diperbarui.</span>}
          {state.error && <span className="text-sm font-medium text-red-600">{state.error}</span>}
        </div>
      </ConfirmationForm>

      {/* Read-Only Data View */}
      {hasData && (
        <div className="section-card overflow-hidden">
          <div className="border-b border-border bg-surface-alt px-6 py-4">
            <h3 className="font-bold text-primary">Rekap Nilai Siswa</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-max w-full text-left text-sm">
              <thead className="bg-surface-alt/50 text-text-secondary border-b border-border">
                <tr>
                  <th className="px-6 py-4 font-semibold">NISN</th>
                  <th className="px-6 py-4 font-semibold">Nama Siswa</th>
                  <th className="px-4 py-4 font-semibold text-center">UH 1</th>
                  <th className="px-4 py-4 font-semibold text-center">UH 2</th>
                  <th className="px-4 py-4 font-semibold text-center">UH 3</th>
                  <th className="px-4 py-4 font-semibold text-center">UAS</th>
                  <th className="px-6 py-4 font-bold text-center text-primary">Rata-Rata</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {students.map((student) => {
                  const grade = gradeMap[student.id]
                  return (
                    <tr key={student.id} className="hover:bg-surface-alt/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-primary">{student.nisn}</td>
                      <td className="px-6 py-4 text-text-secondary">{student.name}</td>
                      <td className="px-4 py-4 text-center">{grade?.uh1 ?? '-'}</td>
                      <td className="px-4 py-4 text-center">{grade?.uh2 ?? '-'}</td>
                      <td className="px-4 py-4 text-center">{grade?.uh3 ?? '-'}</td>
                      <td className="px-4 py-4 text-center">{grade?.uas ?? '-'}</td>
                      <td className="px-6 py-4 text-center font-bold text-primary bg-primary/5">{grade?.score ?? '-'}</td>
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
