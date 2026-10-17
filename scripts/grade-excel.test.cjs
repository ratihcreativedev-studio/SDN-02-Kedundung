/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict')
const { test } = require('node:test')
const { readFileSync } = require('node:fs')
const vm = require('node:vm')
const ts = require('typescript')
const xlsx = require('xlsx')
const output = ts.transpileModule(readFileSync('src/features/grades/excel.ts', 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText
const api = {}
vm.runInNewContext(output, { exports: api, require })
const headers = ['NISN', 'NAMA ', 'UH', 'ASTS', 'ASAS', 'NILAI RAPOR']
const student = ['0012345678', 'Siswa Uji', 70, 90, 90, 82]
function parse(rows) {
  const book = xlsx.utils.book_new()
  xlsx.utils.book_append_sheet(book, xlsx.utils.aoa_to_sheet(rows), 'Sheet1')
  return api.parseGradeWorkbook(xlsx.write(book, { type: 'buffer', bookType: 'xlsx' }))
}
test('imports school headers, preserves leading zeros and the supplied report score', () => {
  const [row] = parse([headers, student])
  assert.deepEqual(JSON.parse(JSON.stringify(row)), { nisn: '0012345678', uh: 70, asts: 90, asas: 90, score: 82 })
})
test('accepts zero and normalized headers', () => {
  const [row] = parse([headers.map(h => h.toLowerCase()), [...student.slice(0, 2), 0, 0, 0, 0]])
  assert.equal(row.score, 0)
})
test('rejects missing columns and legacy format', () => {
  assert.throws(() => parse([['NISN', 'Nama', 'UH 1', 'UH 2', 'UH 3', 'UAS'], student]), /Kolom wajib/)
})
test('rejects blank, out-of-range and nonnumeric scores instead of saving zero', () => {
  for (const value of [null, '', ' ', -1, 101, 'tidak ada']) {
    assert.throws(() => parse([headers, [...student.slice(0, 5), value]]), /Baris 2/)
  }
})
test('rejects duplicates and empty sheets; ignores blank rows', () => {
  assert.throws(() => parse([headers, student, student]), /NISN berulang/)
  assert.throws(() => parse([headers]), /tidak memiliki data/)
  assert.throws(() => parse([[...headers, 'UH'], [...student, 20]]), /kolom wajib yang berulang/)
  assert.equal(parse([headers, [], student]).length, 1)
})


test('numeric NISN restores leading zeros and detects duplicates against text NISN', () => {
  const numeric = [12345678, ...student.slice(1)]
  assert.equal(parse([headers, numeric])[0].nisn, '0012345678')
  assert.throws(() => parse([headers, numeric, student]), /NISN berulang/)
  for (const nisn of [-1, 1.5, 12345678901]) assert.throws(() => parse([headers, [nisn, ...student.slice(1)]]), /Baris 2/)
})
