'use client'

import { useNotifiedAction } from '@/components/ui/notification-provider'

import { useConfirmation } from '@/components/ui/confirmation-dialog'

import { useState } from 'react'
import { FileText, Upload, Trash2, Loader2, CheckCircle2 } from 'lucide-react'
import { uploadIjazahAction, deleteIjazahAction } from '../actions'

interface IjazahUploaderProps {
  studentId: string
  existingUrl?: string | null
}

export function IjazahUploader({ studentId, existingUrl }: IjazahUploaderProps) {
  const runAction = useNotifiedAction()
  const confirmAction = useConfirmation()
  const [file, setFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [deleteSuccess, setDeleteSuccess] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null)
    setSuccess(false)
    setDeleteSuccess(false)
    const selected = e.target.files?.[0]
    
    if (selected) {
      if (selected.type !== 'application/pdf') {
        setError('Hanya file PDF yang diperbolehkan')
        setFile(null)
        return
      }
      setFile(selected)
    }
  }

  const handleUpload = async () => {
    if (!file) return
    if (!await confirmAction({ title: existingUrl ? 'Ganti ijazah?' : 'Upload ijazah?', description: `Unggah ${file.name} sebagai ijazah siswa?${existingUrl ? ' File ini akan menggantikan ijazah sebelumnya.' : ''}`, confirmLabel: 'Ya, unggah' })) return

    setIsLoading(true)
    setError(null)
    setSuccess(false)
    setDeleteSuccess(false)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const result = await runAction(() => uploadIjazahAction(studentId, formData), 'Ijazah berhasil diunggah.')

      if (result.error) {
        setError(result.error)
      } else {
        setSuccess(true)
        setFile(null)
        // Reset file input
        const fileInput = document.getElementById('ijazah-upload') as HTMLInputElement
        if (fileInput) fileInput.value = ''
      }
    } catch {
      setError('Terjadi kesalahan saat mengunggah')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!await confirmAction({ title: 'Hapus data?', description: 'Apakah Anda yakin ingin menghapus ijazah ini?', confirmLabel: 'Ya, hapus', destructive: true })) return

    setIsDeleting(true)
    setError(null)
    setSuccess(false)
    setDeleteSuccess(false)

    try {
      const result = await runAction(() => deleteIjazahAction(studentId), 'Ijazah berhasil dihapus.')

      if (result.error) {
        setError(result.error)
      } else {
        setDeleteSuccess(true)
      }
    } catch {
      setError('Terjadi kesalahan saat menghapus')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div id="ijazah" className="section-card p-6 h-fit mt-6 scroll-mt-24">
      <div className="flex items-center gap-3 mb-4 pb-3 border-b border-border">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600">
          <FileText size={16} />
        </div>
        <h3 className="text-lg font-bold text-primary">Softfile Ijazah</h3>
      </div>

      <div className="space-y-4">
        {existingUrl && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="text-emerald-600 w-5 h-5" />
              <span className="text-sm font-medium text-emerald-800 dark:text-emerald-300">Ijazah sudah diunggah</span>
            </div>
            <div className="flex items-center gap-4">
              <a 
                href={existingUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm font-bold text-primary hover:underline"
              >
                Lihat Ijazah
              </a>
              <button
                onClick={handleDelete}
                disabled={isDeleting || isLoading}
                className="flex items-center justify-center rounded-lg p-2 text-red-500 transition-colors hover:bg-red-500/10 disabled:opacity-50"
                title="Hapus Ijazah"
              >
                {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              </button>
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">
            {existingUrl ? 'Perbarui Ijazah (PDF)' : 'Unggah Ijazah (PDF)'}
          </label>
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <input
                type="file"
                id="ijazah-upload"
                accept="application/pdf"
                onChange={handleFileChange}
                disabled={isLoading || isDeleting}
                className="block w-full text-sm text-text-secondary
                  file:mr-4 file:py-2.5 file:px-4
                  file:rounded-xl file:border-0
                  file:text-sm file:font-semibold
                  file:bg-indigo-500/10 file:text-indigo-700
                  hover:file:bg-indigo-500/20
                  disabled:opacity-50 disabled:cursor-not-allowed
                  border border-border rounded-xl cursor-pointer bg-surface-alt/50"
              />
            </div>
            {file && (
              <button
                onClick={handleUpload}
                disabled={isLoading || isDeleting}
                className="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed min-w-[120px]"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Unggah
                  </>
                )}
              </button>
            )}
          </div>
          {error && <p className="mt-2 text-sm text-red-500 font-medium">{error}</p>}
          {success && <p className="mt-2 text-sm text-emerald-500 font-medium">Ijazah berhasil diunggah!</p>}
          {deleteSuccess && <p className="mt-2 text-sm text-emerald-500 font-medium">Ijazah berhasil dihapus!</p>}
          <p className="mt-2 text-xs text-text-muted">Hanya menerima file dengan format PDF.</p>
        </div>
      </div>
    </div>
  )
}
