'use server'

import { revalidatePath } from 'next/cache'
import { requireAdminEmail } from '@/lib/auth'
import { gradeQueries } from './queries'
import * as xlsx from 'xlsx'
import { z } from 'zod'

const excelGradeRowSchema = z.object({
  NISN: z.coerce.string(),
  Nama: z.string().optional(),
  'UH 1': z.coerce.number().min(0).max(100).optional(),
  'UH 2': z.coerce.number().min(0).max(100).optional(),
  'UH 3': z.coerce.number().min(0).max(100).optional(),
  UAS: z.coerce.number().min(0).max(100).optional(),
})

export async function uploadGradesAction(formData: FormData) {
  try {
    await requireAdminEmail()
    
    const file = formData.get('file') as File
    const subjectId = String(formData.get('subjectId') ?? '')
    const semester = String(formData.get('semester') ?? '')
    const studentsDataStr = String(formData.get('students') ?? '[]')

    if (!file || !subjectId || !semester) {
      return { error: 'File, Mata Pelajaran, dan Semester wajib diisi' }
    }

    const studentsInClass = JSON.parse(studentsDataStr) as { id: string; nisn: string }[]
    const studentMap = new Map(studentsInClass.map(s => [s.nisn, s.id]))

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const workbook = xlsx.read(buffer, { type: 'buffer' })
    
    const firstSheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[firstSheetName]
    const data = xlsx.utils.sheet_to_json(worksheet)

    const recordsToSave: { studentId: string; subjectId: string; semester: string; uh1?: number; uh2?: number; uh3?: number; uas?: number; score: number }[] = []

    for (const row of data as any[]) {
      const parsed = excelGradeRowSchema.safeParse(row)
      if (parsed.success) {
        const studentId = studentMap.get(parsed.data.NISN)
        if (studentId) {
          const uh1 = parsed.data['UH 1']
          const uh2 = parsed.data['UH 2']
          const uh3 = parsed.data['UH 3']
          const uas = parsed.data.UAS

          let total = 0
          let count = 0
          if (uh1 !== undefined) { total += uh1; count++ }
          if (uh2 !== undefined) { total += uh2; count++ }
          if (uh3 !== undefined) { total += uh3; count++ }
          if (uas !== undefined) { total += uas; count++ }

          const score = count > 0 ? Number((total / count).toFixed(2)) : 0

          recordsToSave.push({
            studentId,
            subjectId,
            semester,
            uh1,
            uh2,
            uh3,
            uas,
            score
          })
        }
      }
    }

    if (recordsToSave.length === 0) {
      return { error: 'Tidak ada data valid. Pastikan format kolom sesuai: NISN, Nama, UH 1, UH 2, UH 3, UAS.' }
    }

    await gradeQueries.upsertMany(recordsToSave)
    
    revalidatePath('/admin/nilai')
    revalidatePath('/admin/data-siswa')
    return { success: true }
  } catch (err) {
    console.error(err)
    return { error: err instanceof Error ? err.message : 'Terjadi kesalahan saat memproses file Excel.' }
  }
}
