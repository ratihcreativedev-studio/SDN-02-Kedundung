import { Trophy } from 'lucide-react'
import { AchievementList } from '@/features/achievements/components/AchievementList'
import { PageHeader } from '@/components/layout/page-header'

export const metadata = {
  title: 'Prestasi Siswa | SIPANDA Admin',
}

export default async function AdminPrestasiPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>
}) {
  const params = await searchParams

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in-up">
      <PageHeader
        title="Prestasi Siswa"
        description="Catat prestasi siswa berdasarkan tingkat, peringkat, dan lomba."
        icon={Trophy}
        iconGradient="from-rose-500 to-rose-600"
        actionLabel="Tambah Prestasi"
        actionHref="/admin/prestasi/tambah"
      />

      <div className="animate-fade-in-up animate-delay-100">
        <AchievementList searchParams={params} />
      </div>
    </div>
  )
}
