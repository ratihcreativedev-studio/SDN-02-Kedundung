import { ClipboardList } from 'lucide-react'
import { classQueries } from '@/features/classes/queries'
import { studentService } from '@/features/students/services'
import { subjectService } from '@/features/subjects/services'
import { gradeQueries } from '@/features/grades/queries'
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
  const [classes, subjects] = await Promise.all([classQueries.findAll(), subjectService.getAll()])
  const classId = params.classId ?? classes[0]?.id ?? ''
  const subjectId = params.subjectId ?? subjects[0]?.id ?? ''
  const semester = params.semester ?? 'Ganjil 2025/2026'
  const [students, grades] = classId && subjectId
    ? await Promise.all([
        studentService.getAll(classId),
        gradeQueries.findByClassSubjectSemester(classId, subjectId, semester),
      ])
    : [[], []]
  const gradeMap = Object.fromEntries(grades.map((item) => [item.studentId, item]))

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
