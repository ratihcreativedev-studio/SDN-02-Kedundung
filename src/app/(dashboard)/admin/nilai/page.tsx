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
  searchParams: Promise<{ classId?: string; semester?: string }>
}) {
  const params = await searchParams
  const { classes, classId, semester, students, gradeMap } = await getGradePageData(params)
  const className = classes.find(item => item.id === classId)?.name ?? 'Kelas'

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
        title="Daftar Nilai"
        description="Upload nilai siswa via file Excel per kelas dan semester sesuai format UH, ASTS, ASAS, dan Nilai Rapor."
        icon={ClipboardList}
        iconGradient="from-orange-500 to-orange-600"
      />

      <GradeFilter key={`${classId}-${semester}`} classes={classes} classId={classId} semester={semester}>

      {classId ? (
        <GradeUploadClient key={`${classId}-${semester}`} className={className} classId={classId} semester={semester} students={students} gradeMap={gradeMap} />
      ) : (
        <div className="section-card">
          <div className="empty-state">
            <p className="text-sm text-text-muted">Tambahkan kelas terlebih dahulu.</p>
          </div>
        </div>
      )}
      </GradeFilter>
    </div>
  )
}
