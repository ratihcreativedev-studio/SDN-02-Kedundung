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
      if (name === './schemas') return load('src/features/attendance/schemas.ts')
      if (name === './excel') return load('src/features/attendance/excel.ts')
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
  const actions = load('src/features/attendance/actions.ts', {
    'next/cache': { revalidatePath: (...args) => refreshes.push(args) },
    '@/lib/auth': { requireAdminEmail: auth },
    './queries': { attendanceQueries: queries },
    '@/features/students/queries': { studentQueries: { findAcademicRoster: async () => [{ id: 'student-1', nisn: '001', name: 'Siswa' }] } },
  })
  return { actions, calls, refreshes, queries }
}
function form(extra = {}) {
  const data = new FormData()
  for (const [key, value] of Object.entries({ classId: 'class-1', semester: 'Ganjil 2027/2028', studentId: 'student-1', hadir: '0', sakit: '90', izin: '90', alpha: '82', ...extra })) data.set(key, value)
  return data
}
function workbook(nisn = '001') {
  const book = xlsx.utils.book_new()
  xlsx.utils.book_append_sheet(book, xlsx.utils.aoa_to_sheet([['NISN', 'NAMA', 'HADIR', 'SAKIT', 'IJIN', 'ALPA'], [nisn, 'Siswa', 70, 90, 90, 82]]), 'Sheet1')
  return new Blob([xlsx.write(book, { type: 'buffer', bookType: 'xlsx' })])
}
test('edit updates only one student in the requested class and semester, preserving zero', async () => {
  const { actions, calls, refreshes } = setup()
  assert.equal((await actions.editAttendanceAction(form())).success, true)
  assert.deepEqual(JSON.parse(JSON.stringify(calls)), [['edit', 'class-1', 'Ganjil 2027/2028', 'student-1', { hadir: 0, sakit: 90, izin: 90, alpha: 82 }]])
  assert.equal(refreshes.length, 4)
})
test('invalid counts and periods never write data', async () => {
  for (const extra of [{ hadir: '' }, { hadir: '1.5' }, { izin: '-1' }, { alpha: 'NaN' }, { semester: '' }, { semester: '2025/2026' }, { semester: 'Ganjil 2025/2025' }, { semester: 'Ganjil 2027/2029' }, { classId: '' }]) {
    const { actions, calls } = setup()
    assert.ok((await actions.editAttendanceAction(form(extra))).error)
    assert.equal(calls.length, 0)
  }
})
test('missing or wrong-class student recap is not silently created', async () => {
  const { actions, queries, refreshes } = setup()
  queries.updateOne = async () => ({ count: 0 })
  assert.ok((await actions.editAttendanceAction(form())).error)
  assert.equal(refreshes.length, 0)
})
test('delete requires exact valid class and semester', async () => {
  const { actions, calls } = setup()
  assert.ok((await actions.deleteAttendanceRecapAction(form({ semester: '' }))).error)
  assert.equal(calls.length, 0)
  assert.equal((await actions.deleteAttendanceRecapAction(form())).success, true)
  assert.deepEqual(calls, [['delete', 'class-1', 'Ganjil 2027/2028']])
})
test('all mutation actions require admin authorization', async () => {
  const { actions, calls } = setup(async () => { throw Error('Unauthorized') })
  for (const action of [actions.editAttendanceAction, actions.deleteAttendanceRecapAction, actions.uploadAttendanceAction]) assert.ok((await action(form())).error)
  assert.equal(calls.length, 0)
})
test('Excel update targets the selected year and class; wrong-class NISN rejects the upload', async () => {
  for (const nisn of ['001', '002']) {
    const { actions, calls } = setup()
    const data = form(); data.set('file', workbook(nisn), 'nilai.xlsx')
    const result = await actions.uploadAttendanceAction(data)
    if (nisn === '002') { assert.ok(result.error); assert.equal(calls.length, 0); continue }
    assert.equal(result.success, true)
    assert.deepEqual(JSON.parse(JSON.stringify(calls)), [['upload', [{ classId: 'class-1', studentId: 'student-1', semester: 'Ganjil 2027/2028', hadir: 70, sakit: 90, izin: 90, alpha: 82 }]]])
  }
})
test('database edit and delete use the stored class rather than the current student class', async () => {
  const calls = []
  const db = { attendanceRecap: {
    updateMany: async args => { calls.push(args); return { count: 1 } },
    deleteMany: async args => { calls.push(args); return { count: 1 } },
  } }
  const { attendanceQueries } = load('src/features/attendance/queries.ts', { '@/lib/db': { db } })
  await attendanceQueries.updateOne('class-1', 'Ganjil 2027/2028', 'student-1', { hadir: 70, sakit: 80, izin: 90, alpha: 82 })
  await attendanceQueries.deleteByClassSemester('class-1', 'Ganjil 2027/2028')
  assert.deepEqual(JSON.parse(JSON.stringify(calls)), [
    { where: { classId: 'class-1', semester: 'Ganjil 2027/2028', studentId: 'student-1' }, data: { hadir: 70, sakit: 80, izin: 90, alpha: 82 } },
    { where: { classId: 'class-1', semester: 'Ganjil 2027/2028' } },
  ])
})

test('Genap upload, edit, and delete keep their explicit semester scope', async () => {
  const { actions, calls } = setup()
  const data = form({ semester: 'Genap 2025/2026' })
  data.set('file', workbook(), 'absensi.xlsx')
  assert.equal((await actions.uploadAttendanceAction(data)).success, true)
  assert.equal((await actions.editAttendanceAction(data)).success, true)
  assert.equal((await actions.deleteAttendanceRecapAction(data)).success, true)
  assert.equal(calls[0][1][0].semester, 'Genap 2025/2026')
  assert.equal(calls[1][2], 'Genap 2025/2026')
  assert.equal(calls[2][2], 'Genap 2025/2026')
})
