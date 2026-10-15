/* eslint-disable @typescript-eslint/no-require-imports -- Node regression tests use the existing TypeScript compiler. */
const assert = require('node:assert/strict')
const { test } = require('node:test')
const { readFileSync } = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')
const ts = require('typescript')

function load(file, db, mocks = {}) {
  const exports = {}
  const source = readFileSync(path.join(__dirname, '..', file), 'utf8')
  const output = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText
  vm.runInNewContext(output, { exports, require: name => {
    if (Object.hasOwn(mocks, name)) return mocks[name]
    assert.equal(name, '@/lib/db', 'Queries must use only the supplied mock database')
    return { db }
  } })
  return exports
}
const plain = value => JSON.parse(JSON.stringify(value))

test('dashboard counts only active students and requests only the five latest announcement fields', async () => {
  const counts = { students: 12001, classes: 7, subjects: 6, achievements: 20, announcements: 14 }
  const recent = [{ id: 'qa-announcement', title: 'QA', content: 'QA', createdAt: new Date() }]
  let calls = 0
  const db = {
    $queryRaw: async (sql, ...values) => {
      calls++
      assert.equal(values.length, 0, 'Totals query must not interpolate untrusted data')
      assert.match(sql.join(''), /FROM students WHERE status = 'active'\) AS students/)
      for (const table of Object.keys(counts)) assert.match(sql.join(''), new RegExp('COUNT\\(\\*\\)::int FROM ' + table))
      return [counts]
    },
    announcement: { findMany: async args => {
      calls++
      assert.deepEqual(plain(args), { orderBy: { createdAt: 'desc' }, take: 5, select: { id: true, title: true, content: true, createdAt: true } })
      return recent
    } },
  }
  const { getDashboardSummary } = load('src/features/dashboard/queries.ts', db)
  const result = await getDashboardSummary()
  assert.deepEqual(plain(result.counts), { students: 12001, classes: 7, subjects: 6, achievements: 20, announcements: 14 })
  assert.equal(result.announcements, recent)
  assert.equal(calls, 2)
})

test('explicit academic filters fetch records while option lists are still pending', async () => {
  for (const feature of ['grades', 'attendance']) {
    let releaseOptions
    const options = new Promise(resolve => { releaseOptions = resolve })
    const calls = []
    const mocks = {
      '@/features/classes/queries': { classQueries: { findOptions: () => options } },
      '@/features/subjects/queries': { subjectQueries: { findOptions: () => options } },
      '@/features/students/queries': { studentQueries: { findAcademicRoster: async id => {
        calls.push(['roster', id]); return [{ id: 'qa-student', name: 'QA', nisn: '0000000001' }]
      } } },
      './queries': feature === 'grades'
        ? { gradeQueries: { findByClassSubjectSemester: async (...args) => { calls.push(['records', ...args]); return [] } } }
        : { attendanceQueries: { findByClassAndMonth: async (...args) => { calls.push(['records', ...args]); return [] } } },
    }
    const api = load(`src/features/${feature}/page-data.ts`, null, mocks)
    const result = feature === 'grades'
      ? api.getGradePageData({ classId: 'qa-class', subjectId: 'qa-subject', semester: 'Genap 2026/2027' })
      : api.getAttendancePageData('qa-class', 'Oktober 2026')
    await new Promise(resolve => setImmediate(resolve))
    const earlyCalls = [...calls]
    releaseOptions([{ id: 'default', name: 'Default' }])
    const data = await result
    assert.deepEqual(earlyCalls, feature === 'grades'
      ? [['roster', 'qa-class'], ['records', 'qa-class', 'qa-subject', 'Genap 2026/2027']]
      : [['roster', 'qa-class'], ['records', 'qa-class', 'Oktober 2026']])
    assert.equal(data.classId, 'qa-class')
    assert.equal(data.students.length, 1)
  }
})

test('academic page defaults keep the first option and skip records when options are empty', async () => {
  for (const empty of [false, true]) {
    const calls = []
    const mocks = {
      '@/features/classes/queries': { classQueries: { findOptions: async () => empty ? [] : [{ id: 'first-class' }] } },
      '@/features/subjects/queries': { subjectQueries: { findOptions: async () => empty ? [] : [{ id: 'first-subject' }] } },
      '@/features/students/queries': { studentQueries: { findAcademicRoster: async id => { calls.push(id); return [] } } },
      './queries': { gradeQueries: { findByClassSubjectSemester: async (...args) => { calls.push(args); return [] } } },
    }
    const result = await load('src/features/grades/page-data.ts', null, mocks).getGradePageData({})
    assert.equal(result.classId, empty ? '' : 'first-class')
    assert.equal(result.subjectId, empty ? '' : 'first-subject')
    assert.equal(result.semester, 'Ganjil 2025/2026')
    assert.deepEqual(calls, empty ? [] : ['first-class', ['first-class', 'first-subject', 'Ganjil 2025/2026']])

    calls.length = 0
    mocks['./queries'] = { attendanceQueries: { findByClassAndMonth: async (...args) => { calls.push(args); return [] } } }
    const attendance = await load('src/features/attendance/page-data.ts', null, mocks).getAttendancePageData(undefined, 'Oktober 2026')
    assert.equal(attendance.classId, empty ? '' : 'first-class')
    assert.deepEqual(calls, empty ? [] : ['first-class', ['first-class', 'Oktober 2026']])
  }
})

test('class and subject options exclude relations and keep alphabetical ordering', async () => {
  for (const [feature, name, model] of [['classes', 'classQueries', 'class'], ['subjects', 'subjectQueries', 'subject']]) {
    const rows = [{ id: 'qa-1', name: 'QA' }]
    const db = { [model]: { findMany: async args => {
      assert.deepEqual(plain(args), { select: { id: true, name: true }, orderBy: { name: 'asc' } })
      return rows
    } } }
    assert.equal(await load(`src/features/${feature}/queries.ts`, db)[name].findOptions(), rows)
  }
})

test('academic roster is class-scoped and never loads private biodata', async () => {
  const rows = [{ id: 'qa-1', name: 'QA', nisn: '0000000001' }]
  const db = { student: { findMany: async args => {
    assert.deepEqual(plain(args), { where: { classId: 'qa-class' }, select: { id: true, name: true, nisn: true }, orderBy: { name: 'asc' } })
    return rows
  } } }
  const result = await load('src/features/students/queries.ts', db).studentQueries.findAcademicRoster('qa-class')
  assert.equal(result, rows)
})

test('grades and attendance retain their filters and displayed values without student joins', async () => {
  const db = { grade: { findMany: async args => {
    assert.deepEqual(plain(args.where), { subjectId: 'qa-subject', semester: 'Ganjil 2026/2027', student: { classId: 'qa-class' } })
    assert.deepEqual(plain(args.select), { studentId: true, score: true, uh1: true, uh2: true, uh3: true, uas: true })
    assert.equal(args.include, undefined)
    return [{ studentId: 'qa-1', score: 0, uh1: 0, uh2: null, uh3: 80, uas: 90 }]
  } }, attendance: { findMany: async args => {
    assert.deepEqual(plain(args.where), { monthYear: 'Oktober 2026', student: { classId: 'qa-class' } })
    assert.deepEqual(plain(args.select), { studentId: true, hadir: true, sakit: true, izin: true, alpha: true })
    assert.equal(args.include, undefined)
    return [{ studentId: 'qa-1', hadir: 20, sakit: 1, izin: 0, alpha: 0 }]
  } } }
  const grades = await load('src/features/grades/queries.ts', db).gradeQueries.findByClassSubjectSemester('qa-class', 'qa-subject', 'Ganjil 2026/2027')
  const attendance = await load('src/features/attendance/queries.ts', db).attendanceQueries.findByClassAndMonth('qa-class', 'Oktober 2026')
  assert.equal(grades[0].uh1, 0)
  assert.equal(grades[0].uh2, null)
  assert.equal(attendance[0].izin, 0)
})

test('production module reloads reuse one bounded database pool', () => {
  const source = readFileSync(path.join(__dirname, '../src/lib/db.ts'), 'utf8')
  const output = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText
  const pools = []
  const shared = {}
  const mocks = {
    pg: { Pool: class { constructor(options) { pools.push(options) } } },
    '@prisma/adapter-pg': { PrismaPg: class {} },
    '@prisma/client': { PrismaClient: class {} },
  }
  function evaluate() {
    const exports = {}
    vm.runInNewContext(output, { exports, globalThis: shared, process: { env: { NODE_ENV: 'production', DATABASE_URL: 'postgres://qa.invalid/fixture' } }, require: name => mocks[name] })
    return exports.db
  }
  assert.equal(evaluate(), evaluate())
  assert.equal(pools.length, 1)
  assert.equal(pools[0].max, 2)
  assert.ok(pools[0].connectionTimeoutMillis > 0)
})
