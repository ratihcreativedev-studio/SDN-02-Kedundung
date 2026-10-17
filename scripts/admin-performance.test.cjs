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
    if (name === '@prisma/client' || name === 'node:crypto') return require(name)
    assert.equal(name, '@/lib/db', 'Queries must use only the supplied mock database')
    return { db }
  } })
  return exports
}
const plain = value => JSON.parse(JSON.stringify(value))

test('dashboard counts only active students and requests only the five latest announcement fields', async () => {
  const counts = { students: 12001, classes: 7, achievements: 20, announcements: 14 }
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
  assert.deepEqual(plain(result.counts), { students: 12001, classes: 7, achievements: 20, announcements: 14 })
  assert.equal(result.announcements, recent)
  assert.equal(calls, 2)
})

test('explicit academic filters fetch records while option lists are still pending', async () => {
  for (const feature of ['grades', 'attendance']) {
    let releaseOptions
    const options = new Promise(resolve => { releaseOptions = resolve })
    const calls = []
    const mocks = {
      './subjects': { getSubjectOptions: async () => [{ code: 'BI_ID', name: 'Bahasa Indonesia' }] },
      '@/features/classes/queries': { classQueries: { findOptions: () => options } },
      '@/features/students/queries': { studentQueries: { findAcademicRoster: async id => {
        calls.push(['roster', id]); return [{ id: 'qa-student', name: 'QA', nisn: '0000000001' }]
      } } },
      './queries': feature === 'grades'
        ? { gradeQueries: { findByClassSemester: async (...args) => { calls.push(['records', ...args]); return [] } } }
        : { attendanceQueries: { findByClassAndSemester: async (...args) => { calls.push(['records', ...args]); return [] } } },
    }
    const api = load(`src/features/${feature}/page-data.ts`, null, mocks)
    const result = feature === 'grades'
      ? api.getGradePageData({ classId: 'qa-class', semester: 'Genap 2026/2027' })
      : api.getAttendancePageData('qa-class', 'Ganjil 2026/2027')
    await new Promise(resolve => setImmediate(resolve))
    const earlyCalls = [...calls]
    releaseOptions([{ id: 'default', name: 'Default' }])
    const data = await result
    assert.deepEqual(earlyCalls, feature === 'grades'
      ? [['roster', 'qa-class'], ['records', 'qa-class', 'Genap 2026/2027', 'BI_ID']]
      : [['roster', 'qa-class'], ['records', 'qa-class', 'Ganjil 2026/2027']])
    assert.equal(data.classId, 'qa-class')
    assert.equal(data.students.length, 1)
  }
})

test('academic page defaults keep the first option and skip records when options are empty', async () => {
  for (const empty of [false, true]) {
    const calls = []
    const mocks = {
      './subjects': { getSubjectOptions: async () => [{ code: 'BI_ID', name: 'Bahasa Indonesia' }] },
      '@/features/classes/queries': { classQueries: { findOptions: async () => empty ? [] : [{ id: 'first-class' }] } },
      '@/features/students/queries': { studentQueries: { findAcademicRoster: async id => { calls.push(id); return [] } } },
      './queries': { gradeQueries: { findByClassSemester: async (...args) => { calls.push(args); return [] } } },
    }
    const result = await load('src/features/grades/page-data.ts', null, mocks).getGradePageData({})
    assert.equal(result.classId, empty ? '' : 'first-class')
    assert.equal(result.semester, 'Ganjil 2025/2026')
    assert.deepEqual(calls, empty ? [] : ['first-class', ['first-class', 'Ganjil 2025/2026', 'BI_ID']])

    calls.length = 0
    mocks['./queries'] = { attendanceQueries: { findByClassAndSemester: async (...args) => { calls.push(args); return [] } } }
    const attendance = await load('src/features/attendance/page-data.ts', null, mocks).getAttendancePageData(undefined, 'Ganjil 2026/2027')
    assert.equal(attendance.classId, empty ? '' : 'first-class')
    assert.deepEqual(calls, empty ? [] : ['first-class', ['first-class', 'Ganjil 2026/2027']])
  }
})

test('class options exclude relations and keep alphabetical ordering', async () => {
  for (const [feature, name, model] of [['classes', 'classQueries', 'class']]) {
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

test('grades and attendance retain their filters and displayed values with minimal student identity', async () => {
  const db = { studentReport: { findMany: async args => {
    assert.deepEqual(plain(args.where), { semester: 'Ganjil 2026/2027', classId: 'qa-class', subjectCode: 'BI_ID' })
    assert.deepEqual(plain(args.select), { studentId: true, score: true, uh: true, asts: true, asas: true, student: { select: { id: true, nisn: true, name: true } } })
    assert.equal(args.include, undefined)
    return [{ studentId: 'qa-1', score: 0, uh: 0, asts: null, asas: 90 }]
  } }, attendanceRecap: { findMany: async args => {
    assert.deepEqual(plain(args.where), { semester: 'Ganjil 2026/2027', classId: 'qa-class' })
    assert.deepEqual(plain(args.select), { studentId: true, hadir: true, sakit: true, izin: true, alpha: true, student: { select: { id: true, nisn: true, name: true } } })
    assert.equal(args.include, undefined)
    return [{ studentId: 'qa-1', hadir: 20, sakit: 1, izin: 0, alpha: 0 }]
  } } }
  const grades = await load('src/features/grades/queries.ts', db).gradeQueries.findByClassSemester('qa-class', 'Ganjil 2026/2027')
  const attendance = await load('src/features/attendance/queries.ts', db).attendanceQueries.findByClassAndSemester('qa-class', 'Ganjil 2026/2027')
  assert.equal(grades[0].uh, 0)
  assert.equal(grades[0].asts, null)
  assert.equal(attendance[0].izin, 0)
})

test('production module reloads reuse one bounded database pool', () => {
  const source = readFileSync(path.join(__dirname, '../src/lib/db.ts'), 'utf8')
  const output = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText
  const pools = []
  const shared = {}
  const mocks = {
      './subjects': { getSubjectOptions: async () => [{ code: 'BI_ID', name: 'Bahasa Indonesia' }] },
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

test('student reports are fetched per semester without any subject relation', async () => {
  const rows = [{ id: 'report-1', semester: 'Ganjil 2026/2027', uh: 70, asts: 90, asas: 90, score: 82 }]
  const db = { studentReport: { findMany: async args => {
    assert.deepEqual(plain(args), { where: { studentId: 'student-1' }, orderBy: { semester: 'desc' } })
    return rows
  } } }
  assert.equal(await load('src/features/grades/queries.ts', db).gradeQueries.findByStudent('student-1'), rows)
})

test('report uploads use one parameterized statement keyed by student and semester', async () => {
  let calls = 0
  const semester = "Ganjil 'test'"
  const db = { $executeRaw: async sql => {
    calls++
    assert.match(sql.sql, /ON CONFLICT \("studentId", "subjectCode", "semester"\) DO UPDATE/)
    assert.ok(!sql.sql.includes(semester))
    assert.ok(!sql.sql.includes('subjectId'))
    assert.ok(sql.values.includes(semester))
    assert.ok(sql.values.includes(0))
    return 2
  } }
  const q = load('src/features/grades/queries.ts', db).gradeQueries
  assert.equal(await q.upsertMany([]), 0)
  assert.equal(calls, 0)
  assert.equal(await q.upsertMany([
    { subjectCode: 'BI_ID', subjectName: 'Bahasa Indonesia', classId: 'class-1', studentId: 'student-1', semester, uh: 0, asts: 90, asas: 90, score: 82 },
    { subjectCode: 'BI_ID', subjectName: 'Bahasa Indonesia', classId: 'class-1', studentId: 'student-2', semester, uh: 70, asts: 80, asas: 90, score: 81 },
  ]), 2)
  assert.equal(calls, 1)
})
