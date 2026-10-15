import { StudentList } from '@/features/students/components/StudentList'
import { Users } from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'

export const metadata = {
  title: 'Data Siswa | SIPANDA Admin',
  description: 'Kelola data siswa SDN Kedundung 2',
}

export default async function DataSiswaPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>
}) {
  const params = await searchParams

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in-up">
      <PageHeader
        title="Data Siswa"
        description="Kelola data induk siswa SDN Kedundung 2"
        icon={Users}
        iconGradient="from-primary-light to-primary"
        actionLabel="Tambah Siswa"
        actionHref="/admin/data-siswa/tambah"
      />

      <div className="animate-fade-in-up animate-delay-100">
        <StudentList searchParams={params as any} />
      </div>
    </div>
  )
}
