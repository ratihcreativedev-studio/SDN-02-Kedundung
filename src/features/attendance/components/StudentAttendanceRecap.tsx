import { CalendarDays } from 'lucide-react'
import type { StudentAttendanceHistory } from '../student-history'

function AttendancePeriods({ records, isSemester }: { records: StudentAttendanceHistory['recaps']; isSemester: boolean }) {
  return <div className="space-y-4">
    {records.map(record => {
      const total = record.hadir + record.sakit + record.izin + record.alpha
      const percentage = total > 0 ? Math.round(record.hadir / total * 100) : 0
      return <div key={record.id} className="rounded-xl border border-border bg-surface-alt/30 p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h4 className="text-sm font-bold text-primary">{isSemester ? 'Semester' : 'Bulan'} {record.period}</h4>
          <span className="text-xs font-semibold text-emerald-700">{percentage}% Kehadiran</span>
        </div>
        <dl className="grid grid-cols-2 gap-3 text-sm">
          {([
            ['Hadir', record.hadir, 'text-emerald-700 bg-emerald-50'],
            ['Sakit', record.sakit, 'text-amber-700 bg-amber-50'],
            ['Ijin', record.izin, 'text-blue-700 bg-blue-50'],
            ['Alpa', record.alpha, 'text-rose-700 bg-rose-50'],
          ] as const).map(([label, value, color]) => <div key={label} className={`flex items-center justify-between gap-2 rounded-lg px-3 py-2 ${color}`}>
            <dt>{label}</dt><dd className="font-bold">{value} <span className="text-xs font-normal">hari</span></dd>
          </div>)}
        </dl>
      </div>
    })}
  </div>
}

export function StudentAttendanceRecap({ history }: { history: StudentAttendanceHistory }) {
  return <section className="section-card h-fit p-6">
    <div className="mb-4 flex items-center gap-3 border-b border-border pb-3">
      <CalendarDays size={20} className="text-blue-600" />
      <h3 className="text-lg font-bold text-primary">Rekap Absensi</h3>
    </div>
    {history.recaps.length > 0 ? <AttendancePeriods records={history.recaps} isSemester /> : (
      <p className="rounded-xl border border-dashed border-border bg-surface-alt/30 p-6 text-center text-sm text-text-muted">Belum ada rekap absensi per semester.</p>
    )}
    {history.monthly.length > 0 && <div className="mt-6 space-y-3">
      <h4 className="text-sm font-bold text-primary">Riwayat Absensi Bulanan</h4>
      <AttendancePeriods records={history.monthly} isSemester={false} />
    </div>}
  </section>
}
