import { CalendarCheck } from 'lucide-react'
import { classQueries } from '@/features/classes/queries'
import { studentService } from '@/features/students/services'
import { attendanceQueries } from '@/features/attendance/queries'
import { AttendanceUploadClient } from '@/features/attendance/components/AttendanceUploadClient'
import { MonthFilter } from '@/features/attendance/components/MonthFilter'
import { PageHeader } from '@/components/layout/page-header'

export const metadata = {
  title: 'Absensi Bulanan | SIPANDA Admin',
}

function currentMonthValue() {
  const d = new Date()
  const month = (d.getMonth() + 1).toString().padStart(2, '0')
  return `${d.getFullYear()}-${month}`
}

function formatMonth(monthYear: string) {
  if (!monthYear) return ''
  const [year, month] = monthYear.split('-')
  const date = new Date(Number(year), Number(month) - 1, 1)
  return date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
}

export default async function AdminAbsensiPage({
  searchParams,
}: {
  searchParams: Promise<{ classId?: string; monthYear?: string }>
}) {
  const params = await searchParams
  const classes = await classQueries.findAll()
  const classId = params.classId ?? classes[0]?.id ?? ''
  const monthYearVal = params.monthYear ?? currentMonthValue()
  const formattedMonth = formatMonth(monthYearVal)

  const [students, attendances] = classId
    ? await Promise.all([
        studentService.getAll(classId),
        attendanceQueries.findByClassAndMonth(classId, formattedMonth),
      ])
    : [[], []]

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
        title="Absensi Bulanan"
        description="Upload rekap kehadiran siswa per kelas via file Excel."
        icon={CalendarCheck}
        iconGradient="from-teal-500 to-teal-600"
      />

      <MonthFilter classes={classes} classId={classId} monthYearVal={monthYearVal} basePath="/admin/absensi" />

      <AttendanceUploadClient monthYear={formattedMonth} students={students} attendances={attendances} />
    </div>
  )
}
