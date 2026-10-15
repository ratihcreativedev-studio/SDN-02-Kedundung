'use client'

import { useActionState } from 'react'
import { uploadAttendanceAction } from '../actions'

const statuses = [
  { value: 'HADIR', label: 'Hadir' },
  { value: 'SAKIT', label: 'Sakit' },
  { value: 'IZIN', label: 'Izin' },
  { value: 'ALPHA', label: 'Alpa' },
]

const initialState = { error: '', success: false }

export function AttendanceTable({
  date,
  students,
  attendanceMap,
}: {
  date: string
  students: { id: string; nisn: string; name: string }[]
  attendanceMap: Record<string, string>
}) {
  const [state, formAction, isPending] = useActionState(async (_prev: typeof initialState, formData: FormData) => {
    const result = await uploadAttendanceAction(formData)
    if (result?.error) return { error: result.error, success: false }
    return { error: '', success: true }
  }, initialState)

  if (students.length === 0) {
    return (
      <div className="section-card p-10 text-center text-text-muted animate-fade-in-up animate-delay-200">
        Pilih kelas yang memiliki siswa untuk mengisi absensi.
      </div>
    )
  }

  return (
    <form action={formAction} className="section-card overflow-hidden animate-fade-in-up animate-delay-200">
      <input type="hidden" name="date" value={date} />
      <div className="overflow-x-auto">
        <table className="min-w-180 w-full text-left text-sm">
          <thead className="bg-surface-alt text-text-secondary border-b border-border">
            <tr>
              <th className="px-6 py-4 font-semibold">NISN</th>
              <th className="px-6 py-4 font-semibold">Nama Siswa</th>
              {statuses.map((status) => (
                <th key={status.value} className="px-6 py-4 text-center font-semibold">{status.label}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {students.map((student) => (
              <tr key={student.id} className="hover:bg-surface-alt/50 transition-colors">
                <td className="px-6 py-4 font-medium text-primary">{student.nisn}</td>
                <td className="px-6 py-4 text-text-secondary">{student.name}</td>
                {statuses.map((status) => (
                  <td key={status.value} className="px-6 py-4 text-center">
                    <input
                      type="radio"
                      name={`status:${student.id}`}
                      value={status.value}
                      defaultChecked={(attendanceMap[student.id] ?? 'HADIR') === status.value}
                      className="h-4 w-4 border-border text-primary focus:ring-primary transition-all"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex flex-col gap-3 border-t border-border px-6 py-4 sm:flex-row sm:items-center bg-surface-alt/30">
        <button type="submit" disabled={isPending} className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/30 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-lg">
          {isPending ? 'Menyimpan...' : 'Simpan Absensi'}
        </button>
        {state.success && <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Absensi tersimpan.</span>}
        {state.error && <span className="text-sm font-medium text-red-600 dark:text-red-400">{state.error}</span>}
      </div>
    </form>
  )
}
