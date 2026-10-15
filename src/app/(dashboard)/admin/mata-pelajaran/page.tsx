import { BookOpen } from 'lucide-react'
import { SubjectList } from '@/features/subjects/components/SubjectList'
import { PageHeader } from '@/components/layout/page-header'

export const metadata = {
  title: 'Mata Pelajaran | SIPANDA Admin',
}

export default function MataPelajaranPage() {
  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in-up">
      <PageHeader
        title="Mata Pelajaran"
        description="Kelola mapel dan alokasinya ke kelas."
        icon={BookOpen}
        iconGradient="from-amber-500 to-amber-600"
        actionLabel="Tambah Mapel"
        actionHref="/admin/mata-pelajaran/tambah"
      />

      <div className="animate-fade-in-up animate-delay-100">
        <SubjectList />
      </div>
    </div>
  )
}
