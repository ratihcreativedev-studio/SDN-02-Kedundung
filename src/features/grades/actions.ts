'use server'

import { revalidatePath } from 'next/cache'
import { requireAdminEmail } from '@/lib/auth'
import { gradeQueries } from './queries'
import { catalogQueries } from '@/features/academic-catalog/queries'
import { studentQueries } from '@/features/students/queries'
import { parseGradeWorkbook } from './excel'
import { subjectGradeScopeSchema, editGradeSchema } from './schemas'

function refreshGrades() {
  revalidatePath('/admin/nilai')
  revalidatePath('/admin/nilai/mata-pelajaran')
  revalidatePath('/daftar-nilai')
  revalidatePath('/admin/data-siswa', 'layout')
  revalidatePath('/data-siswa', 'layout')
}

export async function uploadGradesAction(formData: FormData) {
  try {
    await requireAdminEmail()
    
    const file = formData.get('file') as File
    const scope = subjectGradeScopeSchema.safeParse({ classId: formData.get('classId'), semester: formData.get('semester'), subjectCode: formData.get('subjectCode') })
    if (!file || typeof file.arrayBuffer !== 'function' || !file.size || !scope.success) {
      return { error: 'File, kelas, dan semester/tahun ajaran yang valid wajib diisi.' }
    }
    if (file.size > 10 * 1024 * 1024) return { error: 'Ukuran file maksimal 10 MB.' }
    const { classId, semester, subjectCode } = scope.data
    const subject = (await catalogQueries.active()).find(item => item.category === 'mata-pelajaran' && item.code === subjectCode)
    if (!subject) return { error: 'Pilih mata pelajaran yang aktif.' }

    const studentsInClass = await studentQueries.findAcademicRoster(classId)
    const studentMap = new Map(studentsInClass.map(s => [s.nisn, s.id]))

    const rows = parseGradeWorkbook(Buffer.from(await file.arrayBuffer()))
    const recordsToSave: Parameters<typeof gradeQueries.upsertMany>[0] = []
    for (const row of rows) {
      const studentId = studentMap.get(row.nisn)
      if (!studentId) {
        return { error: 'Ada NISN pada Excel yang tidak terdaftar di kelas terpilih. Periksa NISN dan pilihan kelas; belum ada nilai yang disimpan.' }
      }
      recordsToSave.push({ subjectCode, subjectName: subject.name, classId, studentId, semester, uh: row.uh, asts: row.asts, asas: row.asas, score: row.score })
    }

    await gradeQueries.upsertMany(recordsToSave)
    
    refreshGrades()
    return { success: true }
  } catch (err) {
    console.error(err)
    return { error: err instanceof Error ? err.message : 'Terjadi kesalahan saat memproses file Excel.' }
  }
}

export async function editGradeAction(formData: FormData) {
  try {
    await requireAdminEmail()
    const parsed = editGradeSchema.safeParse(Object.fromEntries(formData))
    if (!parsed.success) return { error: 'Periksa kelas, semester, dan nilai. Nilai rapor wajib berupa angka 0–100. UH, ASTS, dan ASAS boleh kosong atau berupa angka 0–100.' }
    const { classId, semester, studentId, subjectCode, ...values } = parsed.data
    const result = await gradeQueries.updateOne(classId, semester, studentId, subjectCode, values)
    if (result.count !== 1) return { error: 'Nilai siswa tidak ditemukan pada kelas dan semester ini. Muat ulang halaman.' }
    refreshGrades()
    return { success: true }
  } catch {
    return { error: 'Nilai gagal diperbarui. Silakan coba lagi.' }
  }
}

export async function deleteGradeRecapAction(formData: FormData) {
  try {
    await requireAdminEmail()
    const parsed = subjectGradeScopeSchema.safeParse(Object.fromEntries(formData))
    if (!parsed.success) return { error: 'Kelas dan semester/tahun ajaran wajib valid.' }
    await gradeQueries.deleteByClassSemester(parsed.data.classId, parsed.data.semester, parsed.data.subjectCode)
    refreshGrades()
    return { success: true }
  } catch {
    return { error: 'Rekap nilai gagal dihapus. Silakan coba lagi.' }
  }
}
