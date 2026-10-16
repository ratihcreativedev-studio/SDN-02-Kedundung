import * as xlsx from 'xlsx'
import { z } from 'zod'

export const attendanceExcelColumns = ['NISN', 'NAMA', 'HADIR', 'SAKIT', 'IJIN', 'ALPA'] as const
const requiredDays = z.union([z.number(), z.string().trim().min(1)])
  .transform(Number).pipe(z.number().int().min(0).max(2147483647))
const rowSchema = z.object({
  NISN: z.union([z.string(), z.number()]).transform(String).pipe(z.string().trim().min(1)),
  NAMA: z.string().trim().min(1),
  HADIR: requiredDays,
  SAKIT: requiredDays,
  IJIN: requiredDays,
  'ALPA': requiredDays,
})

export function parseAttendanceWorkbook(buffer: Buffer) {
  const workbook = xlsx.read(buffer, { type: 'buffer' })
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  if (!sheet) throw new Error('File Excel tidak memiliki lembar data.')
  const rows = xlsx.utils.sheet_to_json<unknown[]>(sheet, { header: 1, defval: null, blankrows: true })
  const headers = (rows[0] ?? []).map(value => String(value ?? '').trim().replace(/\s+/g, ' ').toUpperCase())
  const missing = attendanceExcelColumns.filter(column => !headers.includes(column))
  if (missing.length) throw new Error(`Kolom wajib tidak ditemukan: ${missing.join(', ')}. Format: ${attendanceExcelColumns.join(', ')}.`)
  if (attendanceExcelColumns.some(column => headers.filter(header => header === column).length > 1)) {
    throw new Error('Ada nama kolom wajib yang berulang pada Excel.')
  }
  const seen = new Set<string>()
  const result: { nisn: string; hadir: number; sakit: number; izin: number; alpha: number }[] = []
  for (let index = 1; index < rows.length; index++) {
    const cells = rows[index]
    if (cells.every(cell => cell === null || String(cell).trim() === '')) continue
    const parsed = rowSchema.safeParse(Object.fromEntries(headers.map((header, i) => [header, cells[i]])))
    if (!parsed.success) {
      const columns = [...new Set(parsed.error.issues.map(issue => issue.path[0]))].join(', ')
      throw new Error(`Baris ${index + 1}: periksa ${columns}. NISN dan NAMA wajib diisi; absensi wajib berupa bilangan bulat nonnegatif.`)
    }
    const row = parsed.data
    if (seen.has(row.NISN)) throw new Error(`Baris ${index + 1}: NISN berulang dalam file.`)
    seen.add(row.NISN)
    result.push({ nisn: row.NISN, hadir: row.HADIR, sakit: row.SAKIT, izin: row.IJIN, alpha: row['ALPA'] })
  }
  if (!result.length) throw new Error('File Excel tidak memiliki data absensi.')
  return result
}
