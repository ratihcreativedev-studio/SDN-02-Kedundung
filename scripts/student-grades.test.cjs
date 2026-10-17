/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict')
const { test } = require('node:test')
const fs = require('node:fs')
const vm = require('node:vm')
const ts = require('typescript')
const { renderToStaticMarkup } = require('react-dom/server')
const { createElement } = require('react')
function load(file, mocks = {}) {
  const api = {}
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX } }).outputText, {
    exports: api, require: name => name in mocks ? mocks[name] : require(name),
  })
  return api
}
const { StudentAllGrades } = load('src/features/grades/components/StudentAllGrades.tsx', {
  './StudentGradeTable': load('src/features/grades/components/StudentGradeTable.tsx'),
  '../ledger/format': load('src/features/grades/ledger/format.ts'),
})
const ledger = {
  id: 'l1', semester: 'Genap 2025/2026', class: { name: 'Kelas 5' },
  subjects: [
    { code: 'BI_ID', name: 'Bahasa Indonesia', score: 0 },
    { code: 'BI_EN', name: 'Bahasa Inggris', score: 87 },
    { code: 'GKS', name: 'Guru Kelas SD/MI/SLB', score: null },
  ],
  extracurriculars: [
    { code: 'BTQ', name: 'BTQ', predicate: 'B' },
    { code: 'PRAMUKA', name: 'Pramuka', predicate: 'SB' },
    { code: 'TARI', name: 'Tari', predicate: 'B' },
    { code: 'FUTSAL', name: 'Futsal', predicate: null },
    { code: 'KARATE', name: 'Karate', predicate: '' },
  ],
}
const render = (grades, ledgers) => renderToStaticMarkup(createElement(StudentAllGrades, { grades, ledgers }))
test('student details display only filled grades and attended extracurriculars, including zero', () => {
  const html = render([], [ledger])
  for (const text of ['Kelas 5', 'Genap 2025/2026', 'Bahasa Indonesia', 'Bahasa Inggris', '>0<', '>87<', 'BTQ', 'Pramuka', 'Tari']) assert.ok(html.includes(text), text)
  for (const text of ['Guru Kelas', 'Futsal', 'Karate', 'Nilai UH, ASTS', 'Belum ada']) assert.ok(!html.includes(text), text)
})
test('empty categories and semesters are hidden; school years sort chronologically', () => {
  const old = { id: 'r', semester: 'Ganjil 2024/2025', uh: 70, asts: 71, asas: 72, score: 73 }
  const newest = { ...ledger, id: 'l2', semester: 'Ganjil 2026/2027' }
  const empty = { ...ledger, id: 'empty', semester: 'Genap 2023/2024', subjects: [{ code: 'GKS', name: 'Empty subject', score: null }], extracurriculars: [] }
  const html = render([old], [ledger, newest, empty])
  assert.ok(html.indexOf('Ganjil 2026/2027') < html.indexOf('Genap 2025/2026'))
  assert.ok(html.indexOf('Genap 2025/2026') < html.indexOf('Ganjil 2024/2025'))
  assert.ok(!html.includes('Genap 2023/2024'))
  assert.ok(html.includes('Nilai UH, ASTS, ASAS dan Rapor'))
  assert.match(render([], [empty]), /Belum ada data nilai/)
})
test('ledger query uses the resolved student ID and omits empty grade records', async () => {
  const { gradeQueries } = load('src/features/grades/queries.ts', { '@/lib/db': { db: { ledgerReport: { findMany: async args => {
    assert.equal(args.where.studentId, 'student-1')
    assert.equal(args.where.OR[0].subjects.some.score.not, null)
    assert.equal(args.where.OR[1].extracurriculars.some.predicate.not, null)
    assert.equal(args.select.subjects.where.score.not, null)
    assert.equal(args.select.extracurriculars.where.predicate.not, null)
    return [ledger]
  } } } } })
  assert.equal((await gradeQueries.findLedgerByStudent('student-1'))[0], ledger)
})
