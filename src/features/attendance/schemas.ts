import { z } from 'zod'

export const semesterSchema = z.string().regex(/^(Ganjil|Genap) (20\d{2})\/(20\d{2})$/).refine(value => {
  const match = /^(Ganjil|Genap) (20\d{2})\/(20\d{2})$/.exec(value)
  return !!match && Number(match[3]) === Number(match[2]) + 1
}, 'Tahun ajaran harus berurutan.')
export const attendanceScopeSchema = z.object({ classId: z.string().trim().min(1), semester: semesterSchema })
const days = z.union([z.number(), z.string().trim().min(1)]).transform(Number).pipe(z.number().int().min(0).max(2147483647))
export const editAttendanceSchema = attendanceScopeSchema.extend({
  studentId: z.string().trim().min(1), hadir: days, sakit: days, izin: days, alpha: days,
})
