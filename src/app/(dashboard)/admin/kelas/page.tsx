import { ClassList } from '@/features/classes/components/ClassList'
import { GraduationCap } from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'

export const metadata = {
  title: 'Data Kelas | SIPANDA Admin',
  description: 'Kelola data kelas SDN Kedundung 2',
}

export default function KelasPage() {
  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in-up">
      <PageHeader
        title="Data Kelas"
        description="Kelola rombongan belajar SDN Kedundung 2"
        icon={GraduationCap}
        iconGradient="from-primary-light to-primary"
        actionLabel="Tambah Kelas"
        actionHref="/admin/kelas/tambah"
      />

      <div className="animate-fade-in-up animate-delay-100">
        <ClassList />
      </div>
    </div>
  )
}
