import { getGradePageData } from '@/features/grades/page-data'
import { GradeFilter } from '@/features/grades/components/GradeFilter'
import { DaftarNilaiTable } from './daftar-nilai-table'

export async function DaftarNilaiContent({ params }: { params: { classId?: string; semester?: string; subjectCode?: string } }) {
  const { subjects, subjectCode, classes, classId, semester, students, gradeMap } = await getGradePageData(params)
  return (
    <div className="page-shell">
      <div className="page-container space-y-6">
        <div className="page-hero">
          <h1 className="text-3xl font-bold text-primary">Daftar Nilai</h1>
          <p className="mt-2 text-text-secondary">Nilai siswa sesuai format Excel: UH, ASTS, ASAS, dan Nilai Rapor.</p>
        </div>
        <GradeFilter subjects={subjects} subjectCode={subjectCode} key={`${classId}-${semester}-${subjectCode}`} basePath="/daftar-nilai" classes={classes} classId={classId} semester={semester}>
        <DaftarNilaiTable rows={students.map(student => ({ ...student, ...gradeMap[student.id] }))} />
        </GradeFilter>
      </div>
    </div>
  )
}
