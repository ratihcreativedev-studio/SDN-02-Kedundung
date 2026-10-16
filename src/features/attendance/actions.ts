'use server'

import { revalidatePath } from 'next/cache'
import { requireAdminEmail } from '@/lib/auth'
import { attendanceQueries } from './queries'
import { studentQueries } from '@/features/students/queries'
import { parseAttendanceWorkbook } from './excel'
import { attendanceScopeSchema, editAttendanceSchema } from './schemas'

function refreshAttendance() {
  revalidatePath('/admin/absensi')
  revalidatePath('/absensi')
  revalidatePath('/admin/data-siswa', 'layout')
  revalidatePath('/data-siswa', 'layout')
}

export async function uploadAttendanceAction(formData: FormData) {
  try {
    await requireAdminEmail()
    
    const file = formData.get('file') as File
    const scope = attendanceScopeSchema.safeParse({ classId: formData.get('classId'), semester: formData.get('semester') })
    if (!file || typeof file.arrayBuffer !== 'function' || !scope.success) {
      return { error: 'File, kelas, dan semester/tahun ajaran yang valid wajib diisi.' }
    }
    const { classId, semester } = scope.data

    const studentsInClass = await studentQueries.findAcademicRoster(classId)
    const studentMap = new Map(studentsInClass.map(s => [s.nisn, s.id]))

    const rows = parseAttendanceWorkbook(Buffer.from(await file.arrayBuffer()))
    const recordsToSave: Parameters<typeof attendanceQueries.upsertMany>[0] = []
    for (const row of rows) {
      const studentId = studentMap.get(row.nisn)
      if (!studentId) {
        return { error: 'Ada NISN pada Excel yang tidak terdaftar di kelas terpilih. Periksa NISN dan pilihan kelas; belum ada absensi yang disimpan.' }
      }
      recordsToSave.push({ classId, studentId, semester, hadir: row.hadir, sakit: row.sakit, izin: row.izin, alpha: row.alpha })
    }

    await attendanceQueries.upsertMany(recordsToSave)
    
    refreshAttendance()
    return { success: true }
  } catch (err) {
    console.error(err)
    return { error: err instanceof Error ? err.message : 'Terjadi kesalahan saat memproses file Excel.' }
  }
}

export async function editAttendanceAction(formData: FormData) {
  try {
    await requireAdminEmail()
    const parsed = editAttendanceSchema.safeParse(Object.fromEntries(formData))
    if (!parsed.success) return { error: 'Periksa kelas, semester/tahun ajaran, dan absensi. Jumlah hari wajib berupa bilangan bulat nonnegatif.' }
    const { classId, semester, studentId, ...values } = parsed.data
    const result = await attendanceQueries.updateOne(classId, semester, studentId, values)
    if (result.count !== 1) return { error: 'Absensi siswa tidak ditemukan pada kelas dan semester/tahun ajaran ini. Muat ulang halaman.' }
    refreshAttendance()
    return { success: true }
  } catch {
    return { error: 'Absensi gagal diperbarui. Silakan coba lagi.' }
  }
}

export async function deleteAttendanceRecapAction(formData: FormData) {
  try {
    await requireAdminEmail()
    const parsed = attendanceScopeSchema.safeParse(Object.fromEntries(formData))
    if (!parsed.success) return { error: 'Kelas dan semester/tahun ajaran wajib valid.' }
    await attendanceQueries.deleteByClassSemester(parsed.data.classId, parsed.data.semester)
    refreshAttendance()
    return { success: true }
  } catch {
    return { error: 'Rekap absensi gagal dihapus. Silakan coba lagi.' }
  }
}
