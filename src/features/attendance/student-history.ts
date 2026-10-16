import { attendanceQueries } from './queries'

export async function getStudentAttendanceHistory(studentId: string) {
  const [recaps, monthly] = await Promise.all([
    attendanceQueries.findRecapsByStudent(studentId),
    attendanceQueries.findByStudent(studentId),
  ])
  return {
    recaps: recaps.map(item => ({ id: item.id, period: item.semester, hadir: item.hadir, sakit: item.sakit, izin: item.izin, alpha: item.alpha })),
    monthly: monthly.map(item => ({ id: item.id, period: item.monthYear, hadir: item.hadir, sakit: item.sakit, izin: item.izin, alpha: item.alpha })),
  }
}

export type StudentAttendanceHistory = Awaited<ReturnType<typeof getStudentAttendanceHistory>>
