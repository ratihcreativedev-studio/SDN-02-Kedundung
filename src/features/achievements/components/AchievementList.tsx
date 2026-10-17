import Link from 'next/link'
import Image from 'next/image'
import { Pencil } from 'lucide-react'
import { achievementService } from '../services'
import { DeleteAchievementButton } from './DeleteAchievementButton'
import { Pagination } from '@/components/Pagination'

export async function AchievementList({
  searchParams,
}: {
  searchParams?: { page?: string }
}) {
  const page = Number(searchParams?.page) || 1
  const limit = 10

  const { data: achievements, totalPages, page: currentPage } = await achievementService.getPaginated({
    page,
    limit,
  })

  return (
    <div>
      <div className="section-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-[760px] w-full text-left text-sm">
            <thead className="bg-surface-alt text-text-secondary border-b border-border">
              <tr>
                <th className="px-6 py-4 font-semibold">Siswa</th>
                <th className="px-6 py-4 font-semibold">Prestasi</th>
                <th className="px-6 py-4 font-semibold">Tingkat</th>
                <th className="px-6 py-4 font-semibold">Tanggal</th>
                <th className="px-6 py-4 text-right font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {achievements.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-text-muted">Belum ada data prestasi.</td>
                </tr>
              ) : (
                achievements.map((item) => (
                  <tr key={item.id} className="hover:bg-surface-alt/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-primary">{item.student.name}</p>
                      <p className="text-xs text-text-secondary mt-1">{item.student.class?.name ?? 'Tanpa kelas'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        {item.imageUrl && (
                          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-border">
                            <Image src={item.imageUrl} alt={item.title} fill sizes="56px" className="object-cover" />
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-primary">{item.title}</p>
                          <p className="text-xs text-text-secondary mt-1">{item.rank || '-'} - {item.eventName}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-text-secondary">{item.level}</td>
                    <td className="px-6 py-4 text-text-secondary">{item.date ? item.date.toLocaleDateString('id-ID') : '-'}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1">
                        <Link href={`/admin/prestasi/${item.id}/edit`} className="inline-flex items-center justify-center rounded-md p-2 text-primary transition-colors hover:bg-primary/10">
                          <Pencil className="h-4 w-4" />
                        </Link>
                        <DeleteAchievementButton id={item.id} title={item.title} />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination currentPage={currentPage} totalPages={totalPages} />
    </div>
  )
}
