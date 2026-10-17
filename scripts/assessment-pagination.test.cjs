/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict')
const { test } = require('node:test')
const { readFileSync } = require('node:fs')
const vm = require('node:vm')
const ts = require('typescript')
function load(file, mocks = {}) {
  const api = {}
  vm.runInNewContext(ts.transpileModule(readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText, {
    exports: api, require: name => {
      if (name in mocks) return mocks[name]
      if (name === '@/lib/pagination') return load('src/lib/pagination.ts')
      throw Error(`Unexpected import ${name}`)
    },
  })
  return api
}
const { paginationWindow } = load('src/lib/pagination.ts')
test('pagination clamps invalid, empty and out-of-range pages', () => {
  for (const value of [undefined, 'abc', '-1', '0', '1.5', 'Infinity', '9007199254740992']) assert.equal(paginationWindow(value, 29).page, 1)
  assert.equal(paginationWindow('999', 29).page, 3)
  assert.equal(paginationWindow('3', 29).skip, 20)
  assert.equal(paginationWindow('3', 0).page, 1)
})
test('all academic categories fetch only the page roster and its values while retaining full recap counts', async () => {
  for (const category of ['grades', 'attendance', 'mata-pelajaran', 'ekstrakurikuler']) {
    const recordCalls = []
    const relation = (category === 'grades' || category === 'mata-pelajaran') ? 'reports' : category === 'attendance' ? 'attendanceRecaps' : 'ledgerReports'
    let studentQueries = 0
    const model = {
      count: async ({ where }) => {
        assert.equal(where.classId, 'class-5'); assert.equal(where.semester, 'Genap 2025/2026')
        return 29
      },
      findMany: async args => { recordCalls.push(args); return [] },
    }
    const db = {
      student: {
        count: async ({ where }) => {
          if (where.reports) return 29
          assert.equal(where.OR[0].classId, 'class-5')
          assert.equal(where.OR[1][relation].some.classId, 'class-5')
          assert.equal(where.OR[1][relation].some.semester, 'Genap 2025/2026')
          return 29
        },
        findMany: async args => {
          studentQueries++
          assert.equal(args.skip, 20); assert.equal(args.take, 10)
          assert.equal(args.orderBy[1].id, 'asc')
          assert.equal(Object.keys(args.select).sort().join(','), 'id,name,nisn')
          return [{ id: 'last-page-student', nisn: '0000000001', name: 'Siswa' }]
        },
      }, studentReport: model, attendanceRecap: model, ledgerReport: model,
    }
    const api = load('src/features/assessment/page-data.ts', {
      '@/lib/db': { db }, '@/features/classes/queries': { classQueries: { findOptions: async () => [{ id: 'class-5', name: 'Kelas 5' }] } },
    })
    const data = await api.getAssessmentPageData({ classId: 'class-5', semester: 'Genap 2025/2026', page: '999' }, category)
    assert.equal(data.recordCount, 29)
    assert.equal(data.pagination.page, 3)
    assert.equal(studentQueries, 1)
    assert.equal(recordCalls.length, 1)
    assert.equal(recordCalls[0].where.studentId.in.join(','), 'last-page-student')
    assert.equal(recordCalls[0].where.classId, 'class-5')
    assert.equal(recordCalls[0].where.semester, 'Genap 2025/2026')
    if (category === 'mata-pelajaran') assert.equal(recordCalls[0].select, undefined)
    if (category === 'ekstrakurikuler') assert.ok(recordCalls[0].select.subjects)
  }
})
test('no classes produces an empty first page without querying student records', async () => {
  const api = load('src/features/assessment/page-data.ts', {
    '@/lib/db': { db: {} }, '@/features/classes/queries': { classQueries: { findOptions: async () => [] } },
  })
  const data = await api.getAssessmentPageData({ page: '500' }, 'grades')
  assert.equal(data.students.length, 0)
  assert.equal(data.recordCount, 0)
  assert.equal(data.pagination.page, 1)
})

test('search scopes names and NISN within the class history and keeps deletion totals unfiltered', async () => {
  for (const category of ['grades', 'attendance', 'mata-pelajaran', 'ekstrakurikuler']) {
    const seen = []
    const model = {
      count: async ({ where }) => {
        assert.equal(where.student, undefined)
        assert.equal(where.classId, 'class-5')
        assert.equal(where.semester, 'Genap 2025/2026')
        return 29
      },
      findMany: async () => [],
    }
    const api = load('src/features/assessment/page-data.ts', {
      '@/features/classes/queries': { classQueries: { findOptions: async () => [{ id: 'class-5' }] } },
      '@/lib/db': { db: {
        student: {
          count: async ({ where }) => { if (where.reports) return 29; seen.push(where); return 0 },
          findMany: async ({ where, skip, take }) => {
            seen.push(where); assert.equal(skip, 0); assert.equal(take, 10); return []
          },
        }, studentReport: model, attendanceRecap: model, ledgerReport: model,
      } },
    })
    const data = await api.getAssessmentPageData({ classId: 'class-5', semester: 'Genap 2025/2026', page: '9', search: '  0012  ' }, category)
    assert.equal(data.search, '0012')
    assert.equal(data.pagination.total, 0)
    assert.equal(data.pagination.page, 1)
    assert.equal(data.recordCount, 29)
    for (const where of seen) {
      assert.equal(where.OR[0].classId, 'class-5')
      assert.equal(where.AND[0].OR[0].name.contains, '0012')
      assert.equal(where.AND[0].OR[0].name.mode, 'insensitive')
      assert.equal(where.AND[0].OR[1].nisn.contains, '0012')
    }
  }
})
