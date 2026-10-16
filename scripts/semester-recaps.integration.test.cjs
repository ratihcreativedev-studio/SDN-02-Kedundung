/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict')
const { test } = require('node:test')
const { readFileSync, existsSync } = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')
const ts = require('typescript')
const xlsx = require('xlsx')
const React = require('react')
const { renderToStaticMarkup } = require('react-dom/server')
const { randomUUID } = require('node:crypto')

// Opt in explicitly: RUN_DATABASE_TESTS=1 node --test scripts/semester-recaps.integration.test.cjs
// All fixture writes, uploads, edits and deletions execute in one transaction that is ALWAYS rolled back.
test('semester recaps: real database, Excel actions, and admin/public student rendering', {
  skip: process.env.RUN_DATABASE_TESTS !== '1', timeout: 180000,
}, async t => {
  require('dotenv').config({ quiet: true })
  const { PrismaClient } = require('@prisma/client')
  const { PrismaPg } = require('@prisma/adapter-pg')
  const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL, max: 1, connectionTimeoutMillis: 10000 }) })
  const fixtureId = `semester-test-${randomUUID()}`
  const rollback = new Error('Intentional test rollback')
  try {
    await db.$transaction(async tx => {
      const cls = await tx.class.create({ data: { id: fixtureId, name: fixtureId } })
      const student = await tx.student.create({ data: { id: fixtureId, nisn: fixtureId, name: 'Siswa Pengujian Semester', classId: cls.id, nipd: `${fixtureId}-nim`, nik: '0000000000000000', religion: 'Agama Uji', address: 'Alamat sintetis untuk pengujian', village: 'Desa Uji', district: 'Kecamatan Uji', fatherName: 'Ayah Uji', fatherJob: 'Pekerjaan Uji', motherName: 'Ibu Uji', gender: 'L', birthPlace: 'Kota Uji', birthDate: new Date('2017-01-15T00:00:00Z'), status: 'graduate', graduationDate: new Date('2026-06-15T00:00:00Z') } })
      await tx.achievement.create({ data: { studentId: student.id, title: 'Prestasi Uji', eventName: 'Kegiatan Uji', level: 'Sekolah', rank: 'Juara 1' } })
      const cache = new Map()
      const mocks = {
        '@/lib/db': { db: tx },
        '@/lib/auth': { requireAdminEmail: async () => 'test@example.invalid' },
        'next/cache': { revalidatePath() {} },
        'next/navigation': { notFound() { throw Error('Unexpected student not found') } },
        'next/link': { default: ({ children, ...props }) => React.createElement('a', props, children) },
        '@/services/storage.service': {},
        '@/features/students/components/IjazahUploader': { IjazahUploader: () => null },
      }
      function load(file) {
        file = path.resolve(file)
        if (cache.has(file)) return cache.get(file)
        const api = {}; cache.set(file, api)
        const output = ts.transpileModule(readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX } }).outputText
        vm.runInNewContext(output, { exports: api, Buffer, console, require: name => {
          if (name in mocks) return mocks[name]
          if (name.startsWith('@/') || name.startsWith('.')) {
            const base = name.startsWith('@/') ? path.resolve('src', name.slice(2)) : path.resolve(path.dirname(file), name)
            for (const ext of ['.ts', '.tsx']) if (existsSync(base + ext)) return load(base + ext)
          }
          return require(name)
        } })
        return api
      }
      const gradeActions = load('src/features/grades/actions.ts')
      const attendanceActions = load('src/features/attendance/actions.ts')
      const adminPage = load('src/app/(dashboard)/admin/data-siswa/[id]/page.tsx').default
      const publicPage = load('src/app/(public)/data-siswa/[nisn]/page.tsx').default
      const publicLookup = load('src/features/students/actions.ts').getStudentByNISNAction
      const oldPeriod = 'Ganjil 2025/2026', newPeriod = 'Genap 2025/2026'
      const features = [
        { name: 'absensi', model: tx.attendanceRecap, headers: ['HADIR', 'SAKIT', 'IJIN', 'ALPA'], fields: ['hadir', 'sakit', 'izin', 'alpha'], old: [80, 2, 1, 0], fresh: [90, 3, 2, 1], updated: [95, 1, 0, 0], upload: attendanceActions.uploadAttendanceAction, edit: attendanceActions.editAttendanceAction, remove: attendanceActions.deleteAttendanceRecapAction },
        { name: 'nilai', model: tx.studentReport, headers: ['UH', 'ASTS', 'ASAS', 'NILAI RAPOR'], fields: ['uh', 'asts', 'asas', 'score'], old: [70, 71, 72, 73], fresh: [80, 81, 82, 83], updated: [90, 91, 92, 93], upload: gradeActions.uploadGradesAction, edit: gradeActions.editGradeAction, remove: gradeActions.deleteGradeRecapAction },
      ]
      function form(period) {
        const data = new FormData()
        data.set('classId', cls.id); data.set('studentId', student.id); data.set('semester', period)
        return data
      }
      function uploadForm(feature, period, values) {
        const book = xlsx.utils.book_new()
        xlsx.utils.book_append_sheet(book, xlsx.utils.aoa_to_sheet([['NISN', 'NAMA', ...feature.headers], [student.nisn, student.name, ...values]]), 'Sheet1')
        const data = form(period)
        data.set('file', new Blob([xlsx.write(book, { type: 'buffer', bookType: 'xlsx' })]), 'rekap.xlsx')
        return data
      }
      async function rows(feature) { return feature.model.findMany({ where: { studentId: student.id }, orderBy: { semester: 'asc' } }) }
      function values(feature, row) { return feature.fields.map(key => row[key]) }
      async function renderPages() {
        return [
          renderToStaticMarkup(await adminPage({ params: Promise.resolve({ id: student.id }) })),
          renderToStaticMarkup(await publicPage({ params: Promise.resolve({ nisn: student.nisn }) })),
        ]
      }
      await t.test('public search by NISN and NIM displays complete student details', async () => {
        for (const identifier of [student.nisn, student.nipd]) {
          const html = renderToStaticMarkup(await publicPage({ params: Promise.resolve({ nisn: identifier }) }))
          for (const value of [student.name, student.nisn, student.nipd, student.nik, student.religion, student.address, student.village, student.district, student.fatherName, student.fatherJob, student.motherName, student.birthPlace, 'Lulus', '15 Januari 2017', '15 Juni 2026', 'Prestasi Uji', 'Kegiatan Uji', 'Juara 1']) {
            assert.ok(html.includes(value), `Student search is missing field: ${value}`)
          }
        }
      })
      for (const feature of features) {
        await t.test(`${feature.name}: upload semester baru tanpa hapus semester lama`, async () => {
          assert.equal((await feature.upload(uploadForm(feature, oldPeriod, feature.old))).success, true)
          const before = (await rows(feature))[0]
          assert.equal((await feature.upload(uploadForm(feature, newPeriod, feature.fresh))).success, true)
          const saved = await rows(feature)
          assert.equal(saved.length, 2)
          assert.deepEqual(saved.find(row => row.semester === oldPeriod), before)
          assert.deepEqual(values(feature, saved.find(row => row.semester === newPeriod)), feature.fresh)
          const lookup = await publicLookup(student.nisn)
          assert.equal(lookup.success, true)
          const history = feature.name === 'absensi' ? lookup.data.attendanceHistory.recaps : lookup.data.gradeDetails
          assert.equal(history.length, 2)
          for (const html of await renderPages()) {
            assert.ok(html.includes(oldPeriod), 'Old semester missing from detail page')
            assert.ok(html.includes(newPeriod), 'New semester missing from detail page')
            for (const value of [...feature.old, ...feature.fresh]) assert.match(html, new RegExp(`>${value}(?:<| )`))
          }
        })
        await t.test(`${feature.name}: upload ulang hanya memperbarui semester terpilih`, async () => {
          const before = await rows(feature)
          assert.equal((await feature.upload(uploadForm(feature, newPeriod, feature.updated))).success, true)
          const saved = await rows(feature)
          assert.equal(saved.length, 2, 'Re-upload created duplicate records')
          assert.deepEqual(saved.find(row => row.semester === oldPeriod), before.find(row => row.semester === oldPeriod))
          assert.equal(saved.find(row => row.semester === newPeriod).id, before.find(row => row.semester === newPeriod).id)
          assert.deepEqual(values(feature, saved.find(row => row.semester === newPeriod)), feature.updated)
        })
        await t.test(`${feature.name}: edit hanya mengubah semester terpilih`, async () => {
          const before = (await rows(feature)).find(row => row.semester === oldPeriod)
          const data = form(newPeriod)
          feature.fields.forEach((key, index) => data.set(key, String(feature.fresh[index])))
          assert.equal((await feature.edit(data)).success, true)
          const saved = await rows(feature)
          assert.deepEqual(saved.find(row => row.semester === oldPeriod), before)
          assert.deepEqual(values(feature, saved.find(row => row.semester === newPeriod)), feature.fresh)
        })
        await t.test(`${feature.name}: hapus semester lama mempertahankan semester baru`, async () => {
          const newer = (await rows(feature)).find(row => row.semester === newPeriod)
          assert.equal((await feature.remove(form(oldPeriod))).success, true)
          assert.deepEqual(await rows(feature), [newer])
          for (const html of await renderPages()) {
            assert.ok(html.includes(newPeriod))
            assert.ok(!html.includes(oldPeriod))
          }
        })
      }
      throw rollback
    }, { timeout: 150000, maxWait: 15000 })
  } catch (error) {
    if (error !== rollback) throw error
  } finally {
    try {
      assert.equal(await db.student.count({ where: { id: fixtureId } }), 0, 'Test student was not rolled back')
      assert.equal(await db.class.count({ where: { id: fixtureId } }), 0, 'Test class was not rolled back')
      assert.equal(await db.attendanceRecap.count({ where: { studentId: fixtureId } }), 0)
      assert.equal(await db.studentReport.count({ where: { studentId: fixtureId } }), 0)
    } finally { await db.$disconnect() }
  }
})
