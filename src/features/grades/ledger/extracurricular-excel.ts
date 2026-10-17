import * as xlsx from 'xlsx'

const text = (value: unknown) => String(value ?? '').trim()
const normalize = (value: unknown) => text(value).toUpperCase().replace(/\s+/g, ' ')
type CatalogItem = { category: string; code: string; name: string }

export function parseExtracurricularWorkbook(buffer: Buffer, catalog: CatalogItem[]) {
  const book = xlsx.read(buffer, { type: 'buffer' })
  const sheet = book.Sheets[book.SheetNames[0]]
  if (!sheet) throw new Error('Excel tidak memiliki lembar data.')
  const rows = xlsx.utils.sheet_to_json<unknown[]>(sheet, { header: 1, defval: null, blankrows: true })
  const header = rows.findIndex(row => normalize(row[0]) === 'NO' && normalize(row[1]) === 'NAMA SISWA' && normalize(row[2]) === 'NISN' && normalize(row[3]) === 'NIS')
  if (header < 0 || normalize(rows[header][4]).replaceAll(' ', '') !== 'EKSTRAKURIKULER') {
    throw new Error('Gunakan format nilai ekstrakurikuler: NO, NAMA SISWA, NISN, NIS, dan kelompok Ekstra Kurikuler.')
  }
  const headers = rows[header + 1] ?? []
  let end = headers.length
  while (end > 4 && !text(headers[end - 1])) end--
  const codes = new Set<string>()
  const columns = Array.from({ length: Math.max(0, end - 4) }, (_, offset) => {
    const column = offset + 4
    const label = normalize(headers[column])
    const item = catalog.find(item => item.category === 'ekstrakurikuler' && (normalize(item.code) === label || normalize(item.name) === label))
    if (!item || codes.has(item.code)) throw new Error(`Kolom ${xlsx.utils.encode_col(column)}: nama/kode ekstrakurikuler tidak dikenal atau berulang. Periksa daftar Ekstrakurikuler.`)
    codes.add(item.code)
    return { code: item.code, name: item.name, column }
  })
  if (!columns.length) throw new Error('Kolom nama ekstrakurikuler wajib tersedia.')
  const seen = new Set<string>()
  const result: { nisn: string; extracurriculars: { code: string; name: string; predicate: string | null }[] }[] = []
  for (let index = header + 4; index < rows.length; index++) {
    const row = rows[index]
    if (normalize(row[0]).startsWith('KETERANGAN')) break
    if (row.every(value => !text(value))) continue
    if (!/^\d+$/.test(text(row[0]))) throw new Error(`Baris ${index + 1}: nomor siswa tidak valid.`)
    const rawNisn = text(row[2])
    if (!/^\d{1,10}$/.test(rawNisn) || !text(row[1])) throw new Error(`Baris ${index + 1}: nama dan NISN maksimal 10 digit wajib diisi.`)
    const nisn = rawNisn.padStart(10, '0')
    if (seen.has(nisn)) throw new Error(`Baris ${index + 1}: NISN berulang.`)
    seen.add(nisn)
    if (row.slice(end).some(value => text(value))) throw new Error(`Baris ${index + 1}: ada nilai di kolom tanpa nama ekstrakurikuler.`)
    result.push({ nisn, extracurriculars: columns.map(({ code, name, column }) => {
      const predicate = normalize(row[column]) || null
      if (predicate !== null && !['SB', 'B', 'C', 'K'].includes(predicate)) throw new Error(`Baris ${index + 1}: predikat ${name} harus SB, B, C, K, atau kosong.`)
      return { code, name, predicate }
    }) })
  }
  if (!result.length) throw new Error('Excel tidak memiliki data siswa.')
  return { rows: result }
}
