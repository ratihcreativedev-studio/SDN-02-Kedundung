import Link from 'next/link'
import { GraduationCap } from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { Pagination } from '@/components/Pagination'
import { getAlumni } from '@/features/alumni/queries'

export const metadata = {
  title: 'Data Alumni | SIPANDA Admin',
  description: 'Data alumni SDN Kedundung 2',
}

export default async function AlumniPage({ searchParams }: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = await searchParams
  const scalar = (value: string | string[] | undefined) => typeof value === 'string' ? value : undefined
  const { students, total, totalPages, page, years, search, year } = await getAlumni({
    q: scalar(params.q), year: scalar(params.year), page: scalar(params.page),
  })
  const inputClass = 'min-h-11 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-primary focus:outline-2 focus:outline-primary'
  const formatDate = (date: Date | null) => date
    ? date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
    : 'Belum diisi'

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in-up">
      <PageHeader title="Data Alumni" description="Daftar alumni SDN Kedundung 2 dari siswa berstatus Lulus." icon={GraduationCap} iconGradient="from-primary-light to-primary" />

      <form action="/admin/alumni" className="section-card flex flex-col gap-3 p-4 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label htmlFor="alumni-search" className="mb-1.5 block text-sm font-medium text-primary">Cari alumni</label>
          <input key={search} id="alumni-search" name="q" defaultValue={search} placeholder="Nama atau NISN..." className={inputClass} />
        </div>
        <div>
          <label htmlFor="alumni-year" className="mb-1.5 block text-sm font-medium text-primary">Tahun kelulusan</label>
          <select key={year} id="alumni-year" name="year" defaultValue={year} className={inputClass}>
            <option value="">Semua tahun</option>
            {year && !years.includes(year) && <option value={year}>{year}</option>}
            {years.map(value => <option key={value} value={value}>{value}</option>)}
          </select>
        </div>
        <button type="submit" className="min-h-11 rounded-lg bg-primary px-5 text-sm font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">Tampilkan</button>
        {(search || year) && <Link href="/admin/alumni" className="inline-flex min-h-11 items-center justify-center rounded-lg border border-border px-4 text-sm font-medium text-primary">Reset</Link>}
      </form>

      <p className="text-sm text-text-secondary">{total} alumni{search || year ? ' sesuai filter' : ' terdaftar'}</p>
      {students.length === 0 ? (
        <div className="section-card empty-state text-center">
          <p className="font-semibold text-primary">{search || year ? 'Tidak ada alumni yang sesuai dengan filter.' : 'Belum ada data alumni.'}</p>
          <p className="mt-2 text-sm text-text-secondary">{search || year ? 'Coba kata kunci atau tahun kelulusan lain.' : 'Siswa dengan status Lulus akan tampil di halaman ini.'}</p>
        </div>
      ) : (
        <>
          <ul className="space-y-3 md:hidden" aria-label="Daftar alumni">
            {students.map(student => (
              <li key={student.id} className="section-card p-4">
                <h2 className="wrap-break-word font-semibold text-primary">{student.name}</h2>
                <dl className="mt-3 space-y-2 text-sm text-text-secondary">
                  <div><dt className="font-medium">NISN</dt><dd>{student.nisn}</dd></div>
                  <div><dt className="font-medium">Kelas terakhir</dt><dd>{student.class?.name || 'Belum diisi'}</dd></div>
                  <div><dt className="font-medium">Tanggal kelulusan</dt><dd>{formatDate(student.graduationDate)}</dd></div>
                </dl>
                <Link href={`/admin/data-siswa/${student.id}`} aria-label={`Detail alumni ${student.name}`} className="mt-3 inline-flex min-h-11 items-center rounded-lg bg-primary px-4 text-sm font-semibold text-white">Lihat detail</Link>
              </li>
            ))}
          </ul>
          <div className="section-card hidden overflow-x-auto md:block">
            <table className="w-full text-left text-sm">
              <caption className="sr-only">Daftar alumni SDN Kedundung 2</caption>
              <thead className="border-b border-border bg-surface-alt text-text-secondary">
                <tr>{['NISN', 'Nama Alumni', 'Kelas Terakhir', 'Tanggal Kelulusan', 'Aksi'].map(label => <th key={label} scope="col" className="px-6 py-4 font-semibold">{label}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-border">
                {students.map(student => (
                  <tr key={student.id} className="text-text-secondary hover:bg-surface-alt/50">
                    <td className="px-6 py-4 font-medium text-primary">{student.nisn}</td>
                    <td className="px-6 py-4">{student.name}</td>
                    <td className="px-6 py-4">{student.class?.name || 'Belum diisi'}</td>
                    <td className="px-6 py-4">{formatDate(student.graduationDate)}</td>
                    <td className="px-6 py-4"><Link href={`/admin/data-siswa/${student.id}`} aria-label={`Detail alumni ${student.name}`} className="inline-flex min-h-11 items-center font-semibold text-primary underline underline-offset-4">Detail</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
      <Pagination currentPage={page} totalPages={totalPages} />
    </div>
  )
}
