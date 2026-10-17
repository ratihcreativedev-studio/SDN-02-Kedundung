import { BookOpen } from 'lucide-react'
import { requireAdminEmail } from '@/lib/auth'
import { PageHeader } from '@/components/layout/page-header'
import { CatalogCreate } from '@/features/academic-catalog/Manager'
export const metadata = { title: 'Tambah Ekstrakurikuler | SIPANDA Admin' }
export default async function Page() {
  await requireAdminEmail()
  return <div className="space-y-6"><PageHeader title="Tambah Ekstrakurikuler" description="Daftarkan kode dan nama untuk penilaian siswa." icon={BookOpen} iconGradient="from-blue-500 to-blue-600" /><CatalogCreate category="ekstrakurikuler" /></div>
}
