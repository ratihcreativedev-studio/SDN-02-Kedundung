import { BookOpen } from 'lucide-react'
import { db } from '@/lib/db'
import { requireAdminEmail } from '@/lib/auth'
import { PageHeader } from '@/components/layout/page-header'
import { Pagination } from '@/components/Pagination'
import { paginationWindow } from '@/lib/pagination'
import { CatalogManager } from './Manager'
import type { LedgerCategory } from '@/features/grades/ledger/format'
export async function CatalogPage({ category, params }: { category: LedgerCategory; params: { search?: string; page?: string } }) {
  await requireAdminEmail()
  const search = params.search?.trim() ?? ''
  const where = { category, deletedAt: null, ...(search ? { OR: [{ name: { contains: search, mode: 'insensitive' as const } }, { code: { contains: search, mode: 'insensitive' as const } }] } : {}) }
  const total = await db.academicItem.count({ where })
  const pagination = paginationWindow(params.page, total)
  const items = await db.academicItem.findMany({ where, select: { id: true, code: true, name: true }, orderBy: [{ name: 'asc' }, { id: 'asc' }], skip: pagination.skip, take: pagination.take })
  const label = category === 'mata-pelajaran' ? 'Mata Pelajaran' : 'Ekstrakurikuler'
  return <div className="space-y-4 sm:space-y-6">
    <PageHeader title={`Data ${label}`} description={`Kelola daftar ${label.toLowerCase()} untuk penilaian siswa.`} icon={BookOpen} iconGradient="from-blue-500 to-blue-600" />
    <form action={`/admin/${category}`} className="section-card flex flex-wrap items-end gap-3 p-5"><label className="flex-1 space-y-2"><span className="block text-sm font-semibold text-primary">Cari {label}</span><input name="search" type="search" defaultValue={search} placeholder="Kode atau nama" className="h-11 w-full rounded-xl border border-border px-3 text-sm" /></label><button className="h-11 rounded-xl bg-primary px-5 text-sm font-semibold text-white">Cari</button></form>
    <CatalogManager items={items} category={category} />
    <Pagination currentPage={pagination.page} totalPages={pagination.totalPages} />
  </div>
}
