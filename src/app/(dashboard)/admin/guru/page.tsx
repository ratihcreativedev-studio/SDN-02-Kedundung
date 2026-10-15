import { Users } from 'lucide-react'
import { TeacherList } from '@/features/teachers/components/TeacherList'
import { PageHeader } from '@/components/layout/page-header'

export const metadata = {
  title: 'Data Guru & Staff | SIPANDA Admin',
}

export default function GuruPage() {
  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in-up">
      <PageHeader
        title="Data Guru & Staff"
        description="Kelola profil guru, staff, NIP, jabatan, dan wali kelas."
        icon={Users}
        iconGradient="from-indigo-500 to-indigo-600"
        actionLabel="Tambah Guru"
        actionHref="/admin/guru/tambah"
      />

      <div className="animate-fade-in-up animate-delay-100">
        <TeacherList />
      </div>
    </div>
  )
}
