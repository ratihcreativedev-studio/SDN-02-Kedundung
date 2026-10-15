'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useState, useEffect } from 'react'
import { Search, SlidersHorizontal } from 'lucide-react'

export function StudentFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(name, value)
      } else {
        params.delete(name)
      }
      params.delete('page') // Reset page on filter change
      return params.toString()
    },
    [searchParams]
  )

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery !== (searchParams.get('q') || '')) {
        router.push(pathname + '?' + createQueryString('q', searchQuery))
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [searchQuery, pathname, router, createQueryString, searchParams])

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value
    let sortBy = ''
    let sortOrder = ''

    if (value === 'name-asc') { sortBy = 'name'; sortOrder = 'asc' }
    else if (value === 'name-desc') { sortBy = 'name'; sortOrder = 'desc' }
    else if (value === 'class-asc') { sortBy = 'class'; sortOrder = 'asc' }
    else if (value === 'class-desc') { sortBy = 'class'; sortOrder = 'desc' }
    else if (value === 'nisn-asc') { sortBy = 'nisn'; sortOrder = 'asc' }
    else if (value === 'nisn-desc') { sortBy = 'nisn'; sortOrder = 'desc' }
    else if (value === 'date-desc') { sortBy = 'createdAt'; sortOrder = 'desc' }
    else if (value === 'date-asc') { sortBy = 'createdAt'; sortOrder = 'asc' }

    const params = new URLSearchParams(searchParams.toString())
    if (sortBy) params.set('sortBy', sortBy)
    else params.delete('sortBy')

    if (sortOrder) params.set('sortOrder', sortOrder)
    else params.delete('sortOrder')

    params.delete('page')
    router.push(pathname + '?' + params.toString())
  }

  const currentSort = `${searchParams.get('sortBy') || 'name'}-${searchParams.get('sortOrder') || 'asc'}`

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-surface-alt/50 p-4 rounded-xl border border-border mb-6">
      <div className="relative w-full sm:max-w-xs">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <Search className="h-4 w-4 text-text-muted" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari nama atau NISN..."
          aria-label="Cari siswa berdasarkan nama atau NISN"
          className="block min-h-11 w-full rounded-lg border border-border bg-white py-2 pl-10 pr-3 text-sm text-primary placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
        />
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto">
        <SlidersHorizontal className="h-4 w-4 text-text-secondary hidden sm:block" />
        <select
          value={currentSort}
          onChange={handleSortChange}
          aria-label="Urutkan daftar siswa"
          className="block min-h-11 w-full rounded-lg border border-border bg-white py-2 pl-3 pr-8 text-sm text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors cursor-pointer"
        >
          <option value="name-asc">Nama (A-Z)</option>
          <option value="name-desc">Nama (Z-A)</option>
          <option value="class-asc">Kelas (1-6)</option>
          <option value="class-desc">Kelas (6-1)</option>
          <option value="nisn-asc">NISN (Kecil - Besar)</option>
          <option value="nisn-desc">NISN (Besar - Kecil)</option>
          <option value="date-desc">Terbaru Ditambahkan</option>
          <option value="date-asc">Terlama Ditambahkan</option>
        </select>
      </div>
    </div>
  )
}
