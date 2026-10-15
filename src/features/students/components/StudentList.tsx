import { studentService } from '../services'
import Link from 'next/link'
import { Pencil, Eye } from 'lucide-react'
import { DeleteStudentButton } from './DeleteStudentButton'
import { StudentFilters } from './StudentFilters'
import { Pagination } from '@/components/Pagination'

export async function StudentList({
  searchParams,
}: {
  searchParams?: { q?: string; sortBy?: string; sortOrder?: string; page?: string }
}) {
  const page = Number(searchParams?.page) || 1
  const limit = 10
  
  const { data: students, totalPages } = await studentService.getPaginated({
    search: searchParams?.q,
    sortBy: searchParams?.sortBy,
    sortOrder: searchParams?.sortOrder as 'asc' | 'desc',
    page,
    limit,
  })

  return (
    <div>
      <StudentFilters />
      
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
                    <dt className="text-text-secondary">Ditambahkan</dt>
                    <dd className="text-text-secondary">{new Date(student.createdAt).toLocaleDateString('id-ID')}</dd>
                  </div>
                </dl>
                <div className="mt-3 grid grid-cols-3 gap-2 border-t border-border pt-3">
                  <Link href={`/admin/data-siswa/${student.id}`} aria-label={`Detail ${student.name}`} className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-lg bg-primary px-2 text-sm font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
                    <Eye className="h-4 w-4" aria-hidden="true" /> Detail
                  </Link>
                  <Link href={`/admin/data-siswa/${student.id}/edit`} aria-label={`Edit ${student.name}`} className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-lg border border-border px-2 text-sm font-semibold text-primary hover:bg-surface-alt focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
                    <Pencil className="h-4 w-4" aria-hidden="true" /> Edit
                  </Link>
                  <DeleteStudentButton id={student.id} name={student.name} showLabel />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="section-card hidden overflow-hidden md:block">
        <div className="overflow-x-auto">
          <table className="min-w-[720px] w-full text-left text-sm">
            <thead className="bg-surface-alt text-text-secondary border-b border-border">
              <tr>
                <th className="py-4 px-6 font-semibold">NISN</th>
                <th className="py-4 px-6 font-semibold">Nama Siswa</th>
                <th className="py-4 px-6 font-semibold">Kelas</th>
                <th className="py-4 px-6 font-semibold">Tgl Dibuat</th>
                <th className="py-4 px-6 text-right font-semibold">Aksi</th>
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
                    <td className="py-4 px-6 font-medium text-primary">{student.nisn}</td>
                    <td className="py-4 px-6 text-text-secondary">{student.name}</td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                        {student.class?.name || 'Belum ada kelas'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-text-secondary">
                      {new Date(student.createdAt).toLocaleDateString('id-ID')}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex justify-end gap-1">
                        <Link href={`/admin/data-siswa/${student.id}`} className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg p-2 text-primary transition-colors hover:bg-primary/10 focus-visible:outline-2 focus-visible:outline-primary" title="Detail Siswa" aria-label={`Detail ${student.name}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                        <Link href={`/admin/data-siswa/${student.id}/edit`} className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg p-2 text-primary transition-colors hover:bg-primary/10 focus-visible:outline-2 focus-visible:outline-primary" title="Edit Siswa" aria-label={`Edit ${student.name}`}>
                          <Pencil className="h-4 w-4" />
                        </Link>
                        <DeleteStudentButton id={student.id} name={student.name} />
                      </div>
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
