'use client'

import { useId, useState } from 'react'
import { Search } from 'lucide-react'

export function AssessmentSearch({ search, pending, onSearch }: { search: string; pending: boolean; onSearch: (value: string) => void }) {
  const [value, setValue] = useState(search)
  const id = useId()
  return (
    <form role="search" onSubmit={event => { event.preventDefault(); onSearch(value.trim()) }} className="space-y-2 sm:flex-1 sm:min-w-72">
      <label htmlFor={id} className="block text-sm font-semibold text-primary">Cari Siswa</label>
      <div className="flex gap-2">
        <div className="relative min-w-0 flex-1">
          <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-text-muted" />
          <input id={id} type="search" value={value} onChange={event => setValue(event.target.value)} disabled={pending} placeholder="Nama siswa atau NISN" className="h-11 w-full rounded-xl border border-border bg-white pl-9 pr-3 text-sm text-primary shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
        </div>
        <button disabled={pending} className="h-11 rounded-xl bg-primary px-4 text-sm font-semibold text-white disabled:opacity-50">Cari</button>
        {search && <button type="button" disabled={pending} onClick={() => { setValue(''); onSearch('') }} className="h-11 rounded-xl border border-border px-3 text-sm text-primary disabled:opacity-50">Reset</button>}
      </div>
    </form>
  )
}
