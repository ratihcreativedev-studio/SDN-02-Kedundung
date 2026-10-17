import { z } from 'zod'

export const gradeScopeSchema = z.object({
  classId: z.string().trim().min(1),
  semester: z.string().regex(/^(Ganjil|Genap) (20\d{2})\/(20\d{2})$/).refine(value => {
    const match = /^(Ganjil|Genap) (20\d{2})\/(20\d{2})$/.exec(value)
    return !!match && Number(match[3]) === Number(match[2]) + 1
  }, 'Tahun ajaran harus berurutan.'),
})
const score = z.union([z.number(), z.string().trim().min(1)]).transform(Number).pipe(z.number().min(0).max(100))
const optionalScore = z.preprocess(value => value === null || (typeof value === 'string' && value.trim() === '') ? null : value, score.nullable())
export const subjectGradeScopeSchema = gradeScopeSchema.extend({ subjectCode: z.string().trim().min(1) })
export const editGradeSchema = subjectGradeScopeSchema.extend({
  studentId: z.string().trim().min(1),
  uh: optionalScore,
  asts: optionalScore,
  asas: optionalScore,
  score,
})
