'use client'

import { useState } from 'react'
import { Search, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function StudentSearchByNisn() {
  const [nisn, setNisn] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!nisn.trim()) return

    setIsLoading(true)
    router.push(`/data-siswa/${nisn.trim()}`)
  }

  return (
    <div className="mb-12">
      <div className="section-card p-6 bg-white border border-border shadow-sm rounded-2xl">
        <h2 className="text-xl font-bold text-primary mb-2">Cari Data Siswa (NIM / NISN)</h2>
        <p className="text-sm text-text-secondary mb-6">Masukkan NIM atau NISN siswa untuk melihat data akademik, rekap absensi, daftar nilai, dan mengunduh ijazah.</p>
        
        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-text-muted" />
            </div>
            <input
              type="text"
              value={nisn}
              onChange={(e) => setNisn(e.target.value)}
              placeholder="Masukkan NIM atau NISN siswa..."
              className="block w-full pl-10 pr-3 py-3 border border-border rounded-xl bg-surface-alt/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              disabled={isLoading}
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !nisn.trim()}
            className="inline-flex items-center justify-center rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Cari'}
          </button>
        </form>
      </div>
    </div>
  )
}

