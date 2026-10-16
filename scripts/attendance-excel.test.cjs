/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict')
const { test } = require('node:test')
const { readFileSync } = require('node:fs')
const vm = require('node:vm')
const ts = require('typescript')
const xlsx = require('xlsx')
const output = ts.transpileModule(readFileSync('src/features/attendance/excel.ts', 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText
const api = {}
vm.runInNewContext(output, { exports: api, require })
const headers = ['NISN', 'NAMA ', 'HADIR', 'SAKIT', 'IJIN ', 'ALPA']
const student = ['0012345678', 'Siswa Uji', 180, 2, 1, 0]
function parse(rows) {
  const book = xlsx.utils.book_new()
  xlsx.utils.book_append_sheet(book, xlsx.utils.aoa_to_sheet(rows), 'Sheet1')
  return api.parseAttendanceWorkbook(xlsx.write(book, { type: 'buffer', bookType: 'xlsx' }))
}
test('imports school headers, preserves leading zeros and the supplied attendance counts', () => {
  const [row] = parse([headers, student])
  assert.deepEqual(JSON.parse(JSON.stringify(row)), { nisn: '0012345678', hadir: 180, sakit: 2, izin: 1, alpha: 0 })
})
test('accepts zero and normalized headers', () => {
  const [row] = parse([headers.map(h => h.toLowerCase()), [...student.slice(0, 2), 0, 0, 0, 0]])
  assert.equal(row.alpha, 0)
})
test('rejects missing columns and legacy format', () => {
  assert.throws(() => parse([['NISN', 'Nama', 'HADIR 1', 'HADIR 2', 'HADIR 3', 'UAS'], student]), /Kolom wajib/)
})
test('rejects blank, fractional and nonnumeric counts instead of saving zero', () => {
  for (const value of [null, '', ' ', -1, 1.5, 'tidak ada']) {
    assert.throws(() => parse([headers, [...student.slice(0, 5), value]]), /Baris 2/)
  }
})
test('rejects duplicates and empty sheets; ignores blank rows', () => {
  assert.throws(() => parse([headers, student, student]), /NISN berulang/)
  assert.throws(() => parse([headers]), /tidak memiliki data/)
  assert.throws(() => parse([[...headers, 'HADIR'], [...student, 20]]), /kolom wajib yang berulang/)
  assert.equal(parse([headers, [], student]).length, 1)
})
