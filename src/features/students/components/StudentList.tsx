import { studentService } from '../services'
import { StudentActions } from './StudentActions'
import { StudentFilters } from './StudentFilters'
import { Pagination } from '@/components/Pagination'
import type { StudentStatus } from '@prisma/client'

const statusLabels: Record<StudentStatus, string> = {
  active: 'Aktif',
  inactive: 'Tidak Aktif',
  graduate: 'Lulus',
}

const statusStyles: Record<StudentStatus, string> = {
  active: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  inactive: 'border-slate-200 bg-slate-100 text-slate-600',
  graduate: 'border-indigo-200 bg-indigo-50 text-indigo-700',
}

function StatusBadge({ status }: { status: StudentStatus }) {
  return <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-medium ${statusStyles[status]}`}>
    <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
    {statusLabels[status]}
  </span>
}

export async function StudentList({
  searchParams,
}: {
  searchParams?: { q?: string; sortBy?: string; sortOrder?: string; page?: string }
}) {
  const requestedPage = Number(searchParams?.page)
  const page = Number.isSafeInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1
  const limit = 10
  
  const { data: students, totalPages, total } = await studentService.getPaginated({
    search: searchParams?.q,
    sortBy: searchParams?.sortBy,
    sortOrder: searchParams?.sortOrder as 'asc' | 'desc',
    page,
    limit,
  })

  return (
    <div>
      <StudentFilters />
      <p className="mb-4 text-sm text-text-secondary"><span className="font-semibold text-primary">{total}</span> siswa{searchParams?.q ? ' sesuai pencarian' : ' terdaftar'}</p>
      
      <div className="md:hidden">
        {students.length === 0 ? (
          <div className="empty-state text-sm text-text-secondary">
            {searchParams?.q ? 'Tidak ada siswa yang sesuai dengan pencarian' : 'Belum ada data siswa'}
          </div>
        ) : (
          <ul className="space-y-3" aria-label="Daftar siswa">
            {students.map((student) => (
              <li key={student.id} className="section-card p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <h2 className="min-w-0 flex-1 wrap-break-word text-base font-semibold text-primary">{student.name}</h2>
                  <span className="max-w-full rounded-lg bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                    {student.class?.name || 'Belum ada kelas'}
                  </span>
                </div>
                <dl className="mt-3 space-y-1.5 text-sm">
                  <div className="flex flex-wrap justify-between gap-x-3 gap-y-1">
                    <dt className="text-text-secondary">NISN</dt>
                    <dd className="font-medium text-primary">{student.nisn}</dd>
                  </div>
                  <div className="flex flex-wrap justify-between gap-x-3 gap-y-1">
                    <dt className="text-text-secondary">Status Siswa</dt>
                    <dd className="text-text-secondary"><StatusBadge status={student.status} /></dd>
                  </div>
                </dl>
                <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                  <span className="text-xs text-text-muted">Kelola siswa</span>
                  <StudentActions id={student.id} name={student.name} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="section-card hidden overflow-hidden md:block">
        <div className="overflow-x-auto">
          <table className="min-w-[680px] w-full text-left text-sm">
            <caption className="sr-only">Data siswa SDN Kedundung 2</caption>
            <thead className="bg-surface-alt/80 text-text-muted text-xs uppercase tracking-wider border-b border-border">
              <tr>
                <th scope="col" className="py-4 px-6 font-semibold">NISN</th>
                <th scope="col" className="py-4 px-6 font-semibold">Nama Siswa</th>
                <th scope="col" className="py-4 px-6 font-semibold">Kelas</th>
                <th scope="col" className="py-4 px-6 font-semibold">Status Siswa</th>
                <th scope="col" className="py-4 px-6 text-right font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {students.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-text-muted">
                    {searchParams?.q ? 'Tidak ada siswa yang sesuai dengan pencarian' : 'Belum ada data siswa'}
                  </td>
                </tr>
              ) : (
                students.map((student) => (
                  <tr key={student.id} className="hover:bg-surface-alt/50 transition-colors">
                    <td className="py-4 px-6 font-mono text-xs tabular-nums text-text-secondary">{student.nisn}</td>
                    <td className="py-4 px-6 font-semibold text-primary">{student.name}</td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                        {student.class?.name || 'Belum ada kelas'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-text-secondary">
                      <StatusBadge status={student.status} />
                    </td>
                    <td className="py-4 px-6 text-right">
                      <StudentActions id={student.id} name={student.name} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination currentPage={page} totalPages={totalPages} />
    </div>
  )
}
