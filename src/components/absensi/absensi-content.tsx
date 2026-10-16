import { getAttendancePageData } from '@/features/attendance/page-data'
import { semesterSchema } from '@/features/attendance/schemas'
import { AttendanceFilter } from '@/features/attendance/components/AttendanceFilter'
import { AbsensiHero } from './absensi-hero'
import { AbsensiStats } from './absensi-stats'
import { AbsensiTable } from './absensi-table'

export async function AbsensiContent({ params }: { params: { classId?: string; semester?: string } }) {
  const parsed = semesterSchema.safeParse(params.semester)
  const semester = parsed.success ? parsed.data : 'Ganjil 2025/2026'
  const { classes, classId, attendances } = await getAttendancePageData(params.classId, semester)
  const rows = attendances.map(item => ({
    siswaId: item.studentId, nama: item.student.name, hadir: item.hadir, sakit: item.sakit,
    izin: item.izin, alpa: item.alpha, totalHari: item.hadir + item.sakit + item.izin + item.alpha,
  })).sort((a, b) => a.nama.localeCompare(b.nama))
  const total = rows.reduce((acc, row) => ({ hadir: acc.hadir + row.hadir, sakit: acc.sakit + row.sakit,
    izin: acc.izin + row.izin, alpa: acc.alpa + row.alpa, totalHari: acc.totalHari + row.totalHari,
  }), { hadir: 0, sakit: 0, izin: 0, alpa: 0, totalHari: 0 })
  const stats = { ...total, pct: total.totalHari > 0 ? Math.round(total.hadir / total.totalHari * 100) : 0 }
  return <div className="page-shell"><div className="page-container space-y-6">
    <AbsensiHero semester={semester} kelas={classes.find(item => item.id === classId)?.name ?? '-'} />
    <AttendanceFilter key={`${classId}-${semester}`} basePath="/absensi" classes={classes} classId={classId} semester={semester}>
      <AbsensiStats stats={stats} />
      <AbsensiTable rows={rows} />
    </AttendanceFilter>
  </div></div>
}
