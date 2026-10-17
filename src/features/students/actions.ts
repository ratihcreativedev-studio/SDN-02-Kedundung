'use server'

import { revalidatePath } from 'next/cache'
import { studentSchema, studentNoteSchema } from './schemas'
import { studentQueries } from './queries'
import { studentService } from './services'
import { requireAdminEmail } from '@/lib/auth'

export async function updateStudentNoteAction(id: string, formData: FormData) {
  try {
    await requireAdminEmail()
  } catch {
    return { error: 'Unauthorized' }
  }
  const parsed = studentNoteSchema.safeParse({ note: formData.get('note') })
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  try {
    const student = await studentQueries.updateNote(id, parsed.data.note)
    revalidatePath('/admin/data-siswa')
    revalidatePath(`/admin/data-siswa/${id}`)
    revalidatePath(`/admin/data-siswa/${id}/catatan`)
    revalidatePath(`/data-siswa/${student.nisn}`)
    if (student.nipd) revalidatePath(`/data-siswa/${student.nipd}`)
    return { success: true }
  } catch (error) {
    // Log diagnostic metadata only; never include the student's note or query.
    const code = typeof error === 'object' && error !== null && 'code' in error ? String(error.code) : undefined
    const name = error instanceof Error ? error.name : 'UnknownError'
    console.error('Student note save failed', { name, code })
    if (code === 'P2025') return { error: 'Data siswa tidak ditemukan. Muat ulang daftar siswa dan coba lagi.' }
    return { error: 'Catatan gagal disimpan karena gangguan pada server. Silakan coba lagi.' }
  }
}

export async function createStudentAction(formData: FormData) {
  try {
    await requireAdminEmail()
  } catch {
    return { error: 'Unauthorized' }
  }

  const parsed = studentSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: 'Data tidak valid' }

  try {
    await studentService.create(parsed.data)
    revalidatePath('/admin/data-siswa')
    revalidatePath('/data-siswa', 'layout')
    revalidatePath('/admin/alumni')
    revalidatePath('/admin')
    return { success: true }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Terjadi kesalahan' }
  }
}

export async function updateStudentAction(id: string, formData: FormData) {
  try {
    await requireAdminEmail()
  } catch {
    return { error: 'Unauthorized' }
  }

  const parsed = studentSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: 'Data tidak valid' }

  try {
    await studentService.update(id, parsed.data)
    revalidatePath(`/admin/data-siswa/${id}`)
    revalidatePath('/data-siswa', 'layout')
    revalidatePath(`/data-siswa/${parsed.data.nisn}`)
    revalidatePath('/admin/data-siswa')
    revalidatePath('/data-siswa', 'layout')
    revalidatePath('/admin/alumni')
    revalidatePath('/admin')
    return { success: true }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Terjadi kesalahan' }
  }
}

export async function deleteStudentAction(id: string) {
  try {
    await requireAdminEmail()
  } catch {
    return { error: 'Unauthorized' }
  }

  try {
    await studentService.delete(id)
    revalidatePath('/admin/data-siswa')
    revalidatePath('/data-siswa', 'layout')
    revalidatePath('/admin/alumni')
    revalidatePath('/admin')
    return { success: true }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Terjadi kesalahan' }
  }
}

import { storageService } from '@/services/storage.service'
export async function uploadIjazahAction(studentId: string, formData: FormData) {
  try {
    await requireAdminEmail()
    const file = formData.get('file') as File | null

    if (!file || file.size === 0) {
      return { error: 'File Ijazah wajib diunggah' }
    }

    if (file.type !== 'application/pdf') {
      return { error: 'Hanya file PDF yang diperbolehkan' }
    }

    const student = await studentService.getById(studentId)

    const url = await storageService.uploadDocument(file, 'ijazah')
    try {
      await studentService.updateIjazahUrl(studentId, url)
    } catch (error) {
      await storageService.deleteDocument(url).catch(() => {})
      throw error
    }
    // Retire the old file only after the new URL is safely stored.
    if (student.ijazahUrl) await storageService.deleteDocument(student.ijazahUrl).catch(() => {})

    revalidatePath('/admin/data-siswa')
    revalidatePath(`/admin/data-siswa/${studentId}`)
    revalidatePath('/data-siswa', 'layout')
    return { success: true }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Terjadi kesalahan saat mengunggah' }
  }
}

export async function deleteIjazahAction(studentId: string) {
  try {
    await requireAdminEmail()
    const student = await studentService.getById(studentId)

    if (student.ijazahUrl) {
      await studentService.updateIjazahUrl(studentId, null)
      await storageService.deleteDocument(student.ijazahUrl).catch(() => {})
    }

    revalidatePath('/admin/data-siswa')
    revalidatePath(`/admin/data-siswa/${studentId}`)
    revalidatePath('/data-siswa', 'layout')
    return { success: true }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Terjadi kesalahan saat menghapus ijazah' }
  }
}

import { gradeQueries } from '@/features/grades/queries'
import { getStudentAttendanceHistory } from '@/features/attendance/student-history'

export async function getStudentByNISNAction(nisn: string) {
  try {
    const student = await studentService.getByNisn(nisn)
    const [grades, ledgerDetails, attendanceHistory] = await Promise.all([
      gradeQueries.findByStudent(student.id),
      gradeQueries.findLedgerByStudent(student.id),
      getStudentAttendanceHistory(student.id),
    ])

    const gradeDetails = grades.map(g => ({
      id: g.id,
      semester: g.semester,
      score: g.score,
      uh: g.uh,
      asts: g.asts,
      subjectName: g.subjectName,
      asas: g.asas,
    }))

    return { 
      success: true, 
      data: {
        ...student,
        gradeDetails,
        ledgerDetails,
        attendanceHistory
      }
    }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Terjadi kesalahan' }
  }
}
