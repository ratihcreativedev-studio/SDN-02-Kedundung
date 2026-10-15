import Link from 'next/link'
import { Pencil } from 'lucide-react'
import { teacherService } from '../services'
import { DeleteTeacherButton } from './DeleteTeacherButton'

export async function TeacherList() {
  const teachers = await teacherService.getAll()

  return (
    <div className="section-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-190 w-full text-left text-sm">
          <thead className="bg-surface-alt text-text-secondary border-b border-border">
            <tr>
              <th className="px-6 py-4 font-semibold">Nama</th>
              <th className="px-6 py-4 font-semibold">NIP</th>
              <th className="px-6 py-4 font-semibold">Jabatan</th>
              <th className="px-6 py-4 font-semibold">Wali Kelas</th>
              <th className="px-6 py-4 text-right font-semibold">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {teachers.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-text-muted">
                  Belum ada data guru atau staff.
                </td>
              </tr>
            ) : (
              teachers.map((teacher) => (
                <tr key={teacher.id} className="hover:bg-surface-alt/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-primary">{teacher.name}</td>
                  <td className="px-6 py-4 text-text-secondary">{teacher.nip || '-'}</td>
                  <td className="px-6 py-4 text-text-secondary">{teacher.position || teacher.role}</td>
                  <td className="px-6 py-4 text-text-secondary">
                    {teacher.homeroomClasses.map((cls) => cls.name).join(', ') || '-'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-1">
                      <Link href={`/admin/guru/${teacher.id}/edit`} className="inline-flex items-center justify-center rounded-md p-2 text-primary transition-colors hover:bg-primary/10" aria-label={`Edit ${teacher.name}`}>
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <DeleteTeacherButton id={teacher.id} name={teacher.name} />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
