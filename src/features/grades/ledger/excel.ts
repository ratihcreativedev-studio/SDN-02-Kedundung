import * as xlsx from 'xlsx'
import { ledgerSubjects, ledgerActivities } from './format'

const text = (value: unknown) => String(value ?? '').trim()
type LedgerRow = {
  nisn: string
  sakit: number | null
  izin: number | null
  alpha: number | null
  subjects: { code: string; name: string; score: number | null }[]
  extracurriculars: { code: string; name: string; predicate: string | null }[]
}
export function parseLedgerWorkbook(buffer: Buffer, catalog?: { category: string; code: string; name: string }[]) {
  const book = xlsx.read(buffer, { type: 'buffer' })
  const sheet = book.Sheets[book.SheetNames[0]]
  if (!sheet) throw new Error('Excel tidak memiliki lembar data.')
  const rows = xlsx.utils.sheet_to_json<unknown[]>(sheet, { header: 1, defval: null, blankrows: true })
  const header = rows.findIndex(row => text(row[0]) === 'NO' && text(row[2]) === 'NISN')
  const columns = rows[header + 1] ?? []
  if (header < 0) throw new Error('Gunakan format leger dengan kolom NO dan NISN.')
  const normalize = (value: unknown) => text(value).toUpperCase()
  const attendanceColumn = catalog ? rows[header].findIndex(value => normalize(value) === 'KETIDAKHADIRAN') : 15
  const activityColumn = catalog ? rows[header].findIndex(value => normalize(value).replaceAll(' ', '') === 'EKSTRAKURIKULER') : 18
  if (attendanceColumn < 5 || activityColumn !== attendanceColumn + 3) throw new Error('Kelompok mata pelajaran, ketidakhadiran, dan ekstrakurikuler tidak sesuai format leger.')
  const resolveColumns = (start: number, end: number, category: string) => {
    const seenCodes = new Set<string>()
    let bi = 0
    return Array.from({ length: end - start }, (_, offset) => {
      const column = start + offset
      const label = normalize(columns[column])
      let code = label
      if (category === 'mata-pelajaran' && label === 'BI') code = bi++ === 0 ? 'BI_ID' : 'BI_EN'
      const item = catalog?.find(item => item.category === category && (item.code === code || normalize(item.name) === label))
      if (!item || seenCodes.has(item.code)) throw new Error(`Kolom ${xlsx.utils.encode_col(column)}: kode/nama tidak dikenal atau berulang. Periksa daftar ${category === 'mata-pelajaran' ? 'Mata Pelajaran' : 'Ekstrakurikuler'}.`)
      seenCodes.add(item.code)
      return { code: item.code, name: item.name, column }
    })
  }
  let lastActivityColumn = columns.length
  while (lastActivityColumn > activityColumn && !text(columns[lastActivityColumn - 1])) lastActivityColumn--
  const subjectColumns = catalog ? resolveColumns(4, attendanceColumn, 'mata-pelajaran') : ledgerSubjects.map(([code, name], index) => ({ code, name, column: index + 4 }))
  const activityColumns = catalog ? resolveColumns(activityColumn, lastActivityColumn, 'ekstrakurikuler') : ledgerActivities.map((name, index) => ({ code: name.toUpperCase().replaceAll(' ', '_'), name, column: index + 18 }))
  if (!catalog && (ledgerSubjects.some((s, i) => text(columns[i + 4]) !== s[2]) || ledgerActivities.some((s, i) => text(columns[i + 18]) !== s))) throw new Error('Gunakan format leger sesuai template.')
  if (!subjectColumns.length || !activityColumns.length) throw new Error('Kolom mata pelajaran dan ekstrakurikuler wajib tersedia.')
  if (['Sakit', 'Izin', 'Alpa'].some((s, i) => text(rows[header + 3]?.[i + attendanceColumn]) !== s)) throw new Error('Kolom ketidakhadiran tidak sesuai format leger.')
  const title = text(rows[0]?.[0])
  const period = /(20\d{2})\/(20\d{2})\s+(GANJIL|GENAP)/i.exec(title)
  if (!period || Number(period[2]) !== Number(period[1]) + 1) throw new Error('Tahun pelajaran dan semester pada judul leger tidak valid.')
  const semester = `${period[3].toUpperCase() === 'GENAP' ? 'Genap' : 'Ganjil'} ${period[1]}/${period[2]}`
  const seen = new Set<string>()
  const result: LedgerRow[] = []
  for (let i = header + 4; i < rows.length; i++) {
    const row = rows[i]
    if (text(row[0]).startsWith('KETERANGAN')) break
    if (row.every(v => !text(v))) continue
    if (!/^\d+$/.test(text(row[0]))) throw new Error(`Baris ${i + 1}: nomor siswa tidak valid.`)
    const nisn = text(row[2]).padStart(10, '0')
    if (!/^\d{10}$/.test(nisn) || !text(row[2]) || !text(row[1])) throw new Error(`Baris ${i + 1}: nama dan NISN 10 digit wajib diisi.`)
    if (seen.has(nisn)) throw new Error(`Baris ${i + 1}: NISN berulang.`)
    seen.add(nisn)
    const number = (column: number, attendance = false) => {
      const value = row[column]
      if (!text(value)) return null
      const score = typeof value === 'number' || typeof value === 'string' ? Number(value) : NaN
      if (!Number.isFinite(score) || score < 0 || (attendance ? !Number.isInteger(score) || score > 366 : score > 100)) throw new Error(`Baris ${i + 1}, kolom ${xlsx.utils.encode_col(column)}: nilai tidak valid.`)
      return score
    }
    result.push({ nisn, sakit: number(attendanceColumn, true), izin: number(attendanceColumn + 1, true), alpha: number(attendanceColumn + 2, true),
      subjects: subjectColumns.map(({ code, name, column }) => ({ code, name, score: number(column) })),
      extracurriculars: activityColumns.map(({ code, name, column }) => {
        const predicate = text(row[column]).toUpperCase() || null
        if (predicate !== null && !['SB', 'B', 'C', 'K'].includes(predicate)) throw new Error(`Baris ${i + 1}: predikat ${name} harus SB, B, C, K, atau kosong.`)
        return { code, name, predicate }
      }),
    })
  }
  if (!result.length) throw new Error('Excel tidak memiliki data siswa.')
  return { semester, rows: result }
}
