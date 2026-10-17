import * as xlsx from 'xlsx'
import { z } from 'zod'

export const gradeExcelColumns = ['NISN', 'NAMA', 'UH', 'ASTS', 'ASAS', 'NILAI RAPOR'] as const
const requiredScore = z.union([z.number(), z.string().trim().min(1)])
  .transform(Number).pipe(z.number().min(0).max(100))
const rowSchema = z.object({
  NISN: z.union([z.string().trim().min(1), z.number().int().nonnegative().max(9999999999)]).transform(value => typeof value === 'number' ? String(value).padStart(10, '0') : value),
  NAMA: z.string().trim().min(1),
  UH: requiredScore,
  ASTS: requiredScore,
  ASAS: requiredScore,
  'NILAI RAPOR': requiredScore,
})

export function parseGradeWorkbook(buffer: Buffer) {
  const workbook = xlsx.read(buffer, { type: 'buffer' })
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  if (!sheet) throw new Error('File Excel tidak memiliki lembar data.')
  const rows = xlsx.utils.sheet_to_json<unknown[]>(sheet, { header: 1, defval: null, blankrows: true })
  const headers = (rows[0] ?? []).map(value => String(value ?? '').trim().replace(/\s+/g, ' ').toUpperCase())
  const missing = gradeExcelColumns.filter(column => !headers.includes(column))
  if (missing.length) throw new Error(`Kolom wajib tidak ditemukan: ${missing.join(', ')}. Format: ${gradeExcelColumns.join(', ')}.`)
  if (gradeExcelColumns.some(column => headers.filter(header => header === column).length > 1)) {
    throw new Error('Ada nama kolom wajib yang berulang pada Excel.')
  }
  const seen = new Set<string>()
  const result: { nisn: string; uh: number; asts: number; asas: number; score: number }[] = []
  for (let index = 1; index < rows.length; index++) {
    const cells = rows[index]
    if (cells.every(cell => cell === null || String(cell).trim() === '')) continue
    const parsed = rowSchema.safeParse(Object.fromEntries(headers.map((header, i) => [header, cells[i]])))
    if (!parsed.success) {
      const columns = [...new Set(parsed.error.issues.map(issue => issue.path[0]))].join(', ')
      throw new Error(`Baris ${index + 1}: periksa ${columns}. NISN dan NAMA wajib diisi; nilai wajib berupa angka 0–100.`)
    }
    const row = parsed.data
    if (seen.has(row.NISN)) throw new Error(`Baris ${index + 1}: NISN berulang dalam file.`)
    seen.add(row.NISN)
    result.push({ nisn: row.NISN, uh: row.UH, asts: row.ASTS, asas: row.ASAS, score: row['NILAI RAPOR'] })
  }
  if (!result.length) throw new Error('File Excel tidak memiliki data nilai.')
  return result
}
