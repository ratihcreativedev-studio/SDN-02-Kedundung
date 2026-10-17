'use client'

import { AssessmentSearch } from '@/features/assessment/Search'
import { useRouter } from 'next/navigation'
import { useState, useTransition, type ReactNode } from 'react'

export function GradeFilter({
  basePath = '/admin/nilai',
  classes,
  classId,
  semester,
  children,
  search,
}: {
  basePath?: '/admin/nilai' | '/daftar-nilai' | '/admin/nilai/mata-pelajaran' | '/admin/nilai/ekstrakurikuler'
  classes: { id: string; name: string }[]
  classId: string
  semester: string
  search?: string
  children?: ReactNode
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [cls, setCls] = useState(classId)
  const [sem, setSem] = useState(semester)
  const selectedYear = Number(semester.match(/(20\d{2})\//)?.[1] ?? 2025)
  const lastYear = Math.min(2098, Math.max(new Date().getFullYear() + 3, selectedYear))
  const firstYear = Math.min(2025, selectedYear)
  const semesters = Array.from({ length: lastYear - firstYear + 1 }, (_, index) => firstYear + index)
    .flatMap(year => [`Ganjil ${year}/${year + 1}`, `Genap ${year}/${year + 1}`])

  const applyFilters = (nextClass: string, nextSemester: string, query = search ?? '') => {
    const params = new URLSearchParams({ classId: nextClass, semester: nextSemester })
    if (query) params.set('search', query)
    startTransition(() => router.push(`${basePath}?${params.toString()}`, { scroll: false }))
  }

  return (
    <>
    <div className="section-card flex flex-col gap-4 p-5 sm:flex-row sm:flex-wrap sm:items-end animate-fade-in-up animate-delay-100">
      <label className="space-y-2 sm:flex-1 sm:min-w-35">
        <span className="block text-sm font-semibold text-primary">Kelas</span>
        <select
          value={cls}
          onChange={(e) => { setCls(e.target.value); applyFilters(e.target.value, sem) }}
          disabled={isPending}
          className="w-full h-11 rounded-xl border border-border bg-white px-4 text-sm text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
        >
          {classes.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </label>

      <label className="space-y-2 sm:flex-1 sm:min-w-40">
        <span className="block text-sm font-semibold text-primary">Semester</span>
        <select
          value={sem}
          onChange={(e) => { setSem(e.target.value); applyFilters(cls, e.target.value) }}
          disabled={isPending}
          className="w-full h-11 rounded-xl border border-border bg-white px-4 text-sm text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
        >
          {semesters.map(value => <option key={value} value={value}>{value}</option>)}
        </select>
      </label>

      {search !== undefined && <AssessmentSearch key={search} search={search} pending={isPending} onSearch={value => applyFilters(cls, sem, value)} />}
    </div>
    {isPending ? (
      <div role="status" aria-live="polite" className="section-card p-8 text-center text-sm text-text-secondary">
        Memuat nilai {classes.find(item => item.id === cls)?.name ?? 'kelas'} · {sem}...
      </div>
    ) : children}
    </>
  )
}
