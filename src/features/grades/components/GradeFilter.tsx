'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function GradeFilter({
  classes,
  subjects,
  classId,
  subjectId,
  semester,
}: {
  classes: { id: string; name: string }[]
  subjects: { id: string; name: string }[]
  classId: string
  subjectId: string
  semester: string
}) {
  const router = useRouter()
  const [cls, setCls] = useState(classId)
  const [subj, setSubj] = useState(subjectId)
  const [sem, setSem] = useState(semester)

  const handleSubmit = () => {
    const params = new URLSearchParams({ classId: cls, subjectId: subj, semester: sem })
    router.push(`/admin/nilai?${params.toString()}`)
  }

  return (
    <div className="section-card flex flex-col gap-4 p-5 sm:flex-row sm:flex-wrap sm:items-end animate-fade-in-up animate-delay-100">
      <label className="space-y-2 sm:flex-1 sm:min-w-35">
        <span className="block text-sm font-semibold text-primary">Kelas</span>
        <select
          value={cls}
          onChange={(e) => setCls(e.target.value)}
          className="w-full h-11 rounded-xl border border-border bg-white px-4 text-sm text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
        >
          {classes.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </label>

      <label className="space-y-2 sm:flex-1 sm:min-w-40">
        <span className="block text-sm font-semibold text-primary">Mata Pelajaran</span>
        <select
          value={subj}
          onChange={(e) => setSubj(e.target.value)}
          className="w-full h-11 rounded-xl border border-border bg-white px-4 text-sm text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
        >
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </label>

      <label className="space-y-2 sm:flex-1 sm:min-w-40">
        <span className="block text-sm font-semibold text-primary">Semester</span>
        <select
          value={sem}
          onChange={(e) => setSem(e.target.value)}
          className="w-full h-11 rounded-xl border border-border bg-white px-4 text-sm text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
        >
          <option value="Ganjil 2025/2026">Ganjil 2025/2026</option>
          <option value="Genap 2025/2026">Genap 2025/2026</option>
          <option value="Ganjil 2026/2027">Ganjil 2026/2027</option>
          <option value="Genap 2026/2027">Genap 2026/2027</option>
        </select>
      </label>

      <div className="flex gap-3 sm:flex-none">
        <button
          type="button"
          onClick={handleSubmit}
          className="h-11 rounded-xl bg-primary px-6 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/30"
        >
          Tampilkan
        </button>
        <Link
          href="/admin/nilai"
          className="inline-flex h-11 items-center justify-center rounded-xl border border-border bg-white px-6 text-sm font-medium text-text-secondary transition-all hover:bg-surface-alt hover:text-primary shadow-sm"
        >
          Reset
        </Link>
      </div>
    </div>
  )
}
