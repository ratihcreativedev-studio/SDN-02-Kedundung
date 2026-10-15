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
    revalidatePath('/data-siswa')
    revalidatePath(`/data-siswa/${parsed.data.nisn}`)
    revalidatePath('/admin/data-siswa')
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

    // Delete existing if any
    if (student.ijazahUrl) {
      await storageService.deleteDocument(student.ijazahUrl)
    }

    const url = await storageService.uploadDocument(file, 'ijazah')
    await studentService.updateIjazahUrl(studentId, url)

    revalidatePath(`/admin/data-siswa/${studentId}`)
    revalidatePath('/data-siswa')
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
      await storageService.deleteDocument(student.ijazahUrl)
      await studentService.updateIjazahUrl(studentId, null as any)
    }

    revalidatePath(`/admin/data-siswa/${studentId}`)
    revalidatePath('/data-siswa')
    return { success: true }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Terjadi kesalahan saat menghapus ijazah' }
  }
}

import { gradeQueries } from '@/features/grades/queries'
import { attendanceQueries } from '@/features/attendance/queries'

export async function getStudentByNISNAction(nisn: string) {
  try {
    const student = await studentService.getByNisn(nisn)
    const grades = await gradeQueries.findByStudent(student.id)
    const attendances = await attendanceQueries.findByStudent(student.id)

    const gradeDetails = (grades as any[]).map((g: any) => ({
      id: g.id,
      subjectName: g.subject?.name || 'Mata Pelajaran',
      semester: g.semester,
      score: g.score,
      uh1: g.uh1,
      uh2: g.uh2,
      uh3: g.uh3,
      uas: g.uas,
    }))

    const subjectMap = new Map<string, { total: number; count: number; name: string }>()
    for (const g of grades as any[]) {
      const existing = subjectMap.get(g.subjectId) || { total: 0, count: 0, name: g.subject.name }
      existing.total += g.score
      existing.count += 1
      subjectMap.set(g.subjectId, existing)
    }
    const averages = Array.from(subjectMap.values()).map(s => ({
      name: s.name,
      avg: (s.total / s.count).toFixed(2)
    }))

    const monthlyAttendances = (attendances as any[]).map((att: any) => {
      const hadir = att.hadir || 0
      const sakit = att.sakit || 0
      const izin = att.izin || 0
      const alpha = att.alpha || 0
      const totalHari = hadir + sakit + izin + alpha
      const persentase = totalHari > 0 ? Math.round((hadir / totalHari) * 100) : 0
      return {
        id: att.id,
        month: att.monthYear,
        hadir,
        sakit,
        izin,
        alpha,
        totalHari,
        persentase,
      }
    })

    return { 
      success: true, 
      data: {
        ...student,
        gradeDetails,
        averages,
        monthlyAttendances
      }
    }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Terjadi kesalahan' }
  }
}
