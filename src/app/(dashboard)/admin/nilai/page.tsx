import { getSubjectOptions } from '@/features/grades/subjects'
import { ClipboardList } from 'lucide-react'
import { getAssessmentPageData } from '@/features/assessment/page-data'
import { Pagination } from '@/components/Pagination'
import { GradeUploadClient } from '@/features/grades/components/GradeUploadClient'
import { GradeFilter } from '@/features/grades/components/GradeFilter'
import { PageHeader } from '@/components/layout/page-header'

export const metadata = {
  title: 'Nilai Mata Pelajaran | SIPANDA Admin',
}

export default async function AdminNilaiPage({
  searchParams,
}: {
  searchParams: Promise<{ classId?: string; semester?: string; page?: string; search?: string; subjectCode?: string }>
}) {
  const params = await searchParams
  const subjects = await getSubjectOptions()
  const subjectCode = subjects.some(s => s.code === params.subjectCode) ? params.subjectCode! : subjects.find(s => s.code === 'BI_ID')?.code ?? subjects[0]?.code ?? ''
  const subjectName = subjects.find(s => s.code === subjectCode)?.name ?? ''
  const { classes, classId, semester, students, grades, recordCount, pagination, search } = await getAssessmentPageData({ ...params, subjectCode }, 'grades')
  const gradeMap = Object.fromEntries(grades.map(item => [item.studentId, item]))
  const className = classes.find(item => item.id === classId)?.name ?? 'Kelas'

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
        title="Nilai Mata Pelajaran"
        description="Upload nilai siswa via file Excel per mata pelajaran, kelas, dan semester sesuai format UH, ASTS, ASAS, dan Nilai Rapor."
        icon={ClipboardList}
        iconGradient="from-orange-500 to-orange-600"
      />

      <GradeFilter subjects={subjects} subjectCode={subjectCode} search={search} key={`${classId}-${semester}-${subjectCode}-${search}`} classes={classes} classId={classId} semester={semester}>
        {search && <p role="status" className="text-sm text-text-secondary">{pagination.total} siswa ditemukan untuk “{search}”.</p>}

      {classId && subjectCode ? (
        <GradeUploadClient subjectCode={subjectCode} subjectName={subjectName} key={`${classId}-${semester}-${subjectCode}`} className={className} classId={classId} semester={semester} students={students} gradeMap={gradeMap} totalCount={recordCount} />
      ) : (
        <div className="section-card">
          <div className="empty-state">
            <p className="text-sm text-text-muted">Tambahkan kelas dan mata pelajaran terlebih dahulu.</p>
          </div>
        </div>
      )}
      {recordCount > 0 && <Pagination currentPage={pagination.page} totalPages={pagination.totalPages} />}
      </GradeFilter>
    </div>
  )
}
