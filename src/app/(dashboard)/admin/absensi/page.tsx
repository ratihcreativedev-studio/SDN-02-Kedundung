import { CalendarCheck } from 'lucide-react'
import { getAssessmentPageData } from '@/features/assessment/page-data'
import { Pagination } from '@/components/Pagination'
import { AttendanceUploadClient } from '@/features/attendance/components/AttendanceUploadClient'
import { AttendanceFilter } from '@/features/attendance/components/AttendanceFilter'
import { semesterSchema } from '@/features/attendance/schemas'
import { PageHeader } from '@/components/layout/page-header'

export const metadata = {
  title: 'Rekap Absensi | SIPANDA Admin',
}

export default async function AdminAbsensiPage({
  searchParams,
}: {
  searchParams: Promise<{ classId?: string; semester?: string; page?: string; search?: string }>
}) {
  const params = await searchParams
  const parsedYear = semesterSchema.safeParse(params.semester)
  const semester = parsedYear.success ? parsedYear.data : 'Ganjil 2025/2026'
  const { classes, classId, students, attendances, recordCount, pagination, search } = await getAssessmentPageData({ ...params, semester }, 'attendance')

  const className = classes.find(item => item.id === classId)?.name ?? 'Kelas'
  const attendanceMap = Object.fromEntries(attendances.map(item => [item.studentId, item]))

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
        title="Rekap Absensi"
        description="Upload absensi siswa per kelas dan semester/tahun ajaran sesuai format HADIR, SAKIT, IJIN, dan ALPA."
        icon={CalendarCheck}
        iconGradient="from-teal-500 to-teal-600"
      />

      <AttendanceFilter search={search} key={`${classId}-${semester}-${search}`} classes={classes} classId={classId} semester={semester} basePath="/admin/absensi">
        {search && <p role="status" className="text-sm text-text-secondary">{pagination.total} siswa ditemukan untuk “{search}”.</p>}
        {classId ? <AttendanceUploadClient key={`${classId}-${semester}`} classId={classId} className={className} semester={semester} students={students} attendanceMap={attendanceMap} totalCount={recordCount} /> : (
          <div className="section-card"><div className="empty-state"><p className="text-sm text-text-muted">Tambahkan kelas terlebih dahulu.</p></div></div>
        )}
        {recordCount > 0 && <Pagination currentPage={pagination.page} totalPages={pagination.totalPages} />}
      </AttendanceFilter>
    </div>
  )
}
