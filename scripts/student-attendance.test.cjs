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
const counts = { hadir: 16, sakit: 2, izin: 0, alpha: 0 }
function historyApi(recaps, monthly, calls = []) {
  return load('src/features/attendance/student-history.ts', { './queries': { attendanceQueries: {
    findRecapsByStudent: async id => { calls.push(['recaps', id]); return recaps },
    findByStudent: async id => { calls.push(['monthly', id]); return monthly },
  } } })
}
const { StudentAttendanceRecap } = load('src/features/attendance/components/StudentAttendanceRecap.tsx')
test('semester recap data renders its semester and counts on the student recap', async () => {
  const calls = []
  const history = await historyApi([{ id: 'recaps-1', semester: 'Ganjil 2025/2026', ...counts }], [], calls).getStudentAttendanceHistory('student-2')
  assert.deepEqual(calls, [['recaps', 'student-2'], ['monthly', 'student-2']])
  const html = renderToStaticMarkup(createElement(StudentAttendanceRecap, { history }))
  assert.match(html, /Semester Ganjil 2025\/2026/)
  assert.match(html, /89% Kehadiran/)
  assert.match(html, />16 /)
  assert.doesNotMatch(html, /Belum ada|Riwayat Absensi Bulanan/)
})
test('recaps and legacy monthly records remain separate, with zero-safe percentages', async () => {
  const history = await historyApi([{ id: 'a', semester: 'Ganjil 2025/2026', ...counts }], [{ id: 'm', monthYear: 'Juli 2025', hadir: 0, sakit: 0, izin: 0, alpha: 0 }]).getStudentAttendanceHistory('student-2')
  const html = renderToStaticMarkup(createElement(StudentAttendanceRecap, { history }))
  assert.match(html, /Riwayat Absensi Bulanan/)
  assert.match(html, /Bulan Juli 2025/)
  assert.match(html, /89% Kehadiran/)
  assert.match(html, /0% Kehadiran/)
  assert.doesNotMatch(html, /NaN|Infinity/)
})
test('empty history displays an empty state', () => {
  assert.match(renderToStaticMarkup(createElement(StudentAttendanceRecap, { history: { recaps: [], monthly: [] } })), /Belum ada rekap absensi per semester/)
})
test('public student lookup returns semester attendance for the resolved student ID', async () => {
  const calls = []
  const history = historyApi([{ id: 'a', semester: 'Ganjil 2025/2026', ...counts }], [], calls)
  const api = load('src/features/students/actions.ts', {
    'next/cache': {}, './schemas': {}, './queries': {}, '@/lib/auth': {}, '@/services/storage.service': {},
    './services': { studentService: { getByNisn: async () => ({ id: 'student-2', nisn: '001', name: 'Siswa' }) } },
    '@/features/grades/queries': { gradeQueries: { findByStudent: async () => [] } },
    '@/features/attendance/student-history': history,
  })
  const result = await api.getStudentByNISNAction('001')
  assert.equal(result.success, true)
  assert.equal(result.data.attendanceHistory.recaps[0].period, 'Ganjil 2025/2026')
  assert.equal(result.data.attendanceHistory.recaps[0].hadir, 16)
  assert.deepEqual(calls, [['recaps', 'student-2'], ['monthly', 'student-2']])
})

test('both semesters of one year display independently', async () => {
  const history = await historyApi([
    { id: 'ganjil', semester: 'Ganjil 2025/2026', ...counts },
    { id: 'genap', semester: 'Genap 2025/2026', hadir: 20, sakit: 0, izin: 0, alpha: 0 },
  ], []).getStudentAttendanceHistory('student-2')
  const html = renderToStaticMarkup(createElement(StudentAttendanceRecap, { history }))
  assert.match(html, /Semester Ganjil 2025\/2026/)
  assert.match(html, /Semester Genap 2025\/2026/)
  assert.match(html, /89% Kehadiran/)
  assert.match(html, /100% Kehadiran/)
})
