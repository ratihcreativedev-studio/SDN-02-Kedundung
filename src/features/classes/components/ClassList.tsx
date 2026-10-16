import { classQueries } from '../queries'
import Link from 'next/link'
import { Pencil } from 'lucide-react'
import { DeleteClassButton } from './DeleteClassButton'

export async function ClassList() {
  const classes = await classQueries.findAll()

  return (
    <div className="section-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-[600px] w-full text-left text-sm">
          <thead className="bg-surface-alt text-text-secondary border-b border-border">
            <tr>
              <th className="py-4 px-6 font-semibold">Nama Kelas</th>
              <th className="py-4 px-6 font-semibold">Jumlah Siswa</th>
              <th className="py-4 px-6 font-semibold">Wali Kelas</th>
              <th className="py-4 px-6 text-right font-semibold">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {classes.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-8 text-center text-text-muted">
                  Belum ada data kelas
                </td>
              </tr>
            ) : (
              classes.map((cls) => (
                <tr key={cls.id} className="hover:bg-surface-alt/50 transition-colors">
                  <td className="py-4 px-6 font-medium text-primary">{cls.name}</td>
                  <td className="py-4 px-6 text-text-secondary">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-surface-alt border border-border text-primary">
                      {cls._count.students} Siswa
                    </span>
                  </td>
                  <td className="py-4 px-6 text-text-secondary">
                    {cls.homeroom?.name || '-'}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex justify-end gap-1">
                      <Link href={`/admin/kelas/${cls.id}/edit`} className="inline-flex items-center justify-center rounded-md p-2 text-primary transition-colors hover:bg-primary/10">
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <DeleteClassButton id={cls.id} name={cls.name} />
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
