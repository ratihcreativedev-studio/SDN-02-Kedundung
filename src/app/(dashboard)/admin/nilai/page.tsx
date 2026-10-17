import { ClipboardList } from 'lucide-react'
import { getAssessmentPageData } from '@/features/assessment/page-data'
import { Pagination } from '@/components/Pagination'
import { GradeUploadClient } from '@/features/grades/components/GradeUploadClient'
import { GradeFilter } from '@/features/grades/components/GradeFilter'
import { PageHeader } from '@/components/layout/page-header'

export const metadata = {
  title: 'Daftar Nilai | SIPANDA Admin',
}

export default async function AdminNilaiPage({
  searchParams,
}: {
  searchParams: Promise<{ classId?: string; semester?: string; page?: string; search?: string }>
}) {
  const params = await searchParams
  const { classes, classId, semester, students, grades, recordCount, pagination, search } = await getAssessmentPageData(params, 'grades')
  const gradeMap = Object.fromEntries(grades.map(item => [item.studentId, item]))
  const className = classes.find(item => item.id === classId)?.name ?? 'Kelas'

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
        title="Nilai UH, ASTS, ASAS dan Rapor"
        description="Upload nilai siswa via file Excel per kelas dan semester sesuai format UH, ASTS, ASAS, dan Nilai Rapor."
        icon={ClipboardList}
        iconGradient="from-orange-500 to-orange-600"
      />

      <GradeFilter search={search} key={`${classId}-${semester}-${search}`} classes={classes} classId={classId} semester={semester}>
        {search && <p role="status" className="text-sm text-text-secondary">{pagination.total} siswa ditemukan untuk “{search}”.</p>}

      {classId ? (
        <GradeUploadClient key={`${classId}-${semester}`} className={className} classId={classId} semester={semester} students={students} gradeMap={gradeMap} totalCount={recordCount} />
      ) : (
        <div className="section-card">
          <div className="empty-state">
            <p className="text-sm text-text-muted">Tambahkan kelas terlebih dahulu.</p>
          </div>
        </div>
      )}
      {recordCount > 0 && <Pagination currentPage={pagination.page} totalPages={pagination.totalPages} />}
      </GradeFilter>
    </div>
  )
}
