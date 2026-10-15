'use server'

import { revalidatePath } from 'next/cache'
import { studentSchema } from './schemas'
import { studentService } from './services'
import { requireAdminEmail } from '@/lib/auth'

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
    revalidatePath('/admin/data-siswa')
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

    const monthlyAttendances = (attendances as any[]).map((att: any) => ({
      month: att.monthYear,
      hadir: att.hadir,
      sakit: att.sakit,
      izin: att.izin,
      alpha: att.alpha,
    }))

    return { 
      success: true, 
      data: {
        ...student,
        averages,
        monthlyAttendances
      }
    }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Terjadi kesalahan' }
  }
}
