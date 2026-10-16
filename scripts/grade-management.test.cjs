/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict')
const { test } = require('node:test')
const fs = require('node:fs')
const vm = require('node:vm')
const ts = require('typescript')
const xlsx = require('xlsx')
function load(file, mocks = {}) {
  const api = {}
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText, {
    exports: api, Buffer, console: { error() {} }, require: name => {
      if (name in mocks) return mocks[name]
      if (name === './schemas') return load('src/features/grades/schemas.ts')
      if (name === './excel') return load('src/features/grades/excel.ts')
      return require(name)
    },
  })
  return api
}
function setup(auth = async () => 'admin@example.test') {
  const calls = [], refreshes = []
  const queries = {
    updateOne: async (...args) => { calls.push(['edit', ...args]); return { count: 1 } },
    deleteByClassSemester: async (...args) => { calls.push(['delete', ...args]); return { count: 1 } },
    upsertMany: async rows => { calls.push(['upload', rows]); return rows.length },
  }
  const actions = load('src/features/grades/actions.ts', {
    'next/cache': { revalidatePath: (...args) => refreshes.push(args) },
    '@/lib/auth': { requireAdminEmail: auth },
    './queries': { gradeQueries: queries },
    '@/features/students/queries': { studentQueries: { findAcademicRoster: async () => [{ id: 'student-1', nisn: '001', name: 'Siswa' }] } },
  })
  return { actions, calls, refreshes, queries }
}
function form(extra = {}) {
  const data = new FormData()
  for (const [key, value] of Object.entries({ classId: 'class-1', semester: 'Ganjil 2027/2028', studentId: 'student-1', uh: '0', asts: '90', asas: '90', score: '82', ...extra })) data.set(key, value)
  return data
}
function workbook(nisn = '001') {
  const book = xlsx.utils.book_new()
  xlsx.utils.book_append_sheet(book, xlsx.utils.aoa_to_sheet([['NISN', 'NAMA', 'UH', 'ASTS', 'ASAS', 'NILAI RAPOR'], [nisn, 'Siswa', 70, 90, 90, 82]]), 'Sheet1')
  return new Blob([xlsx.write(book, { type: 'buffer', bookType: 'xlsx' })])
}
test('edit updates only one student in the requested class and semester, preserving zero', async () => {
  const { actions, calls, refreshes } = setup()
  assert.equal((await actions.editGradeAction(form())).success, true)
  assert.deepEqual(JSON.parse(JSON.stringify(calls)), [['edit', 'class-1', 'Ganjil 2027/2028', 'student-1', { uh: 0, asts: 90, asas: 90, score: 82 }]])
  assert.equal(refreshes.length, 4)
})
test('invalid scores and periods never write data', async () => {
  for (const extra of [{ uh: '' }, { uh: '101' }, { asas: '-1' }, { score: 'NaN' }, { semester: '' }, { semester: 'Ganjil 2027/2029' }, { classId: '' }]) {
    const { actions, calls } = setup()
    assert.ok((await actions.editGradeAction(form(extra))).error)
    assert.equal(calls.length, 0)
  }
})
test('missing or wrong-class student report is not silently created', async () => {
  const { actions, queries, refreshes } = setup()
  queries.updateOne = async () => ({ count: 0 })
  assert.ok((await actions.editGradeAction(form())).error)
  assert.equal(refreshes.length, 0)
})
test('delete requires exact valid class and semester', async () => {
  const { actions, calls } = setup()
  assert.ok((await actions.deleteGradeRecapAction(form({ semester: '' }))).error)
  assert.equal(calls.length, 0)
  assert.equal((await actions.deleteGradeRecapAction(form())).success, true)
  assert.deepEqual(calls, [['delete', 'class-1', 'Ganjil 2027/2028']])
})
test('all mutation actions require admin authorization', async () => {
  const { actions, calls } = setup(async () => { throw Error('Unauthorized') })
  for (const action of [actions.editGradeAction, actions.deleteGradeRecapAction, actions.uploadGradesAction]) assert.ok((await action(form())).error)
  assert.equal(calls.length, 0)
})
test('Excel update targets the selected year and class; wrong-class NISN rejects the upload', async () => {
  for (const nisn of ['001', '002']) {
    const { actions, calls } = setup()
    const data = form(); data.set('file', workbook(nisn), 'nilai.xlsx')
    const result = await actions.uploadGradesAction(data)
    if (nisn === '002') { assert.ok(result.error); assert.equal(calls.length, 0); continue }
    assert.equal(result.success, true)
    assert.deepEqual(JSON.parse(JSON.stringify(calls)), [['upload', [{ classId: 'class-1', studentId: 'student-1', semester: 'Ganjil 2027/2028', uh: 70, asts: 90, asas: 90, score: 82 }]]])
  }
})
test('database edit and delete use the stored class rather than the current student class', async () => {
  const calls = []
  const db = { studentReport: {
    updateMany: async args => { calls.push(args); return { count: 1 } },
    deleteMany: async args => { calls.push(args); return { count: 1 } },
  } }
  const { gradeQueries } = load('src/features/grades/queries.ts', { '@/lib/db': { db } })
  await gradeQueries.updateOne('class-1', 'Ganjil 2027/2028', 'student-1', { uh: 70, asts: 80, asas: 90, score: 82 })
  await gradeQueries.deleteByClassSemester('class-1', 'Ganjil 2027/2028')
  assert.deepEqual(JSON.parse(JSON.stringify(calls)), [
    { where: { classId: 'class-1', semester: 'Ganjil 2027/2028', studentId: 'student-1' }, data: { uh: 70, asts: 80, asas: 90, score: 82 } },
    { where: { classId: 'class-1', semester: 'Ganjil 2027/2028' } },
  ])
})
