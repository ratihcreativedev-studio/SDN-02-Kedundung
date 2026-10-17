import { z } from 'zod'
import { gradeScopeSchema } from '../schemas'
import { ledgerSubjects, ledgerActivities } from './format'

export const ledgerScopeSchema = gradeScopeSchema.extend({
  category: z.enum(['mata-pelajaran', 'ekstrakurikuler']),
})
const score = z.string().trim().transform(value => value === '' ? null : Number(value)).pipe(z.number().min(0).max(100).nullable())
const predicate = z.string().trim().toUpperCase().pipe(z.enum(['', 'SB', 'B', 'C', 'K'])).transform(value => value || null)
export const ledgerScoreSchema = z.object(Object.fromEntries(ledgerSubjects.map(([code]) => [code, score])))
export const ledgerPredicateSchema = z.object(Object.fromEntries(ledgerActivities.map(name => [name.toUpperCase().replaceAll(' ', '_'), predicate])))
export const ledgerEditScopeSchema = ledgerScopeSchema.extend({ studentId: z.string().trim().min(1) })

export function ledgerValuesSchema(category: string, codes: string[]) {
  return z.object(Object.fromEntries(codes.map(code => [code, category === 'mata-pelajaran' ? score : predicate])))
}
