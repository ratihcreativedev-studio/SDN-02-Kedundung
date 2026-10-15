import { ClipboardList } from 'lucide-react'
import { getGradePageData } from '@/features/grades/page-data'
import { GradeUploadClient } from '@/features/grades/components/GradeUploadClient'
import { GradeFilter } from '@/features/grades/components/GradeFilter'
import { PageHeader } from '@/components/layout/page-header'

export const metadata = {
  title: 'Daftar Nilai | SIPANDA Admin',
}

export default async function AdminNilaiPage({
  searchParams,
}: {
  searchParams: Promise<{ classId?: string; subjectId?: string; semester?: string }>
}) {
  const params = await searchParams
  const { classes, subjects, classId, subjectId, semester, students, gradeMap } = await getGradePageData(params)

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
        title="Daftar Nilai"
        description="Upload nilai siswa via file Excel per kelas, mapel, dan semester."
        icon={ClipboardList}
        iconGradient="from-orange-500 to-orange-600"
      />

      <GradeFilter classes={classes} subjects={subjects} classId={classId} subjectId={subjectId} semester={semester} />

      {subjectId ? (
        <GradeUploadClient subjectId={subjectId} semester={semester} students={students} gradeMap={gradeMap} />
      ) : (
        <div className="section-card">
          <div className="empty-state">
            <p className="text-sm text-text-muted">Tambahkan mata pelajaran terlebih dahulu.</p>
          </div>
        </div>
      )}
    </div>
  )
}
