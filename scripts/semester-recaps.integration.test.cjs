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
const { randomUUID, randomInt } = require('node:crypto')

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
      const student = await tx.student.create({ data: { id: fixtureId, nisn: String(randomInt(1000000000, 10000000000)), name: 'Siswa Pengujian Semester', classId: cls.id, nipd: `${fixtureId}-nim`, nik: '0000000000000000', religion: 'Agama Uji', address: 'Alamat sintetis untuk pengujian', village: 'Desa Uji', district: 'Kecamatan Uji', fatherName: 'Ayah Uji', fatherJob: 'Pekerjaan Uji', motherName: 'Ibu Uji', motherJob: 'Pekerjaan Ibu Uji', gender: 'L', birthPlace: 'Kota Uji', birthDate: new Date('2017-01-15T00:00:00Z'), status: 'graduate', graduationDate: new Date('2026-06-15T00:00:00Z') } })
      await tx.achievement.create({ data: { studentId: student.id, title: 'Prestasi Uji', eventName: 'Kegiatan Uji', level: 'Sekolah', rank: 'Juara 1' } })
      const cache = new Map()
      const mocks = {
        '@/lib/db': { db: new Proxy(tx, { get(target, property) { return property === '$transaction' ? operations => Promise.all(operations) : Reflect.get(target, property) } }) },
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
        vm.runInNewContext(output, { exports: api, Buffer, File, console, require: name => {
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
        data.set('subjectCode', 'BI_ID'); data.set('classId', cls.id); data.set('studentId', student.id); data.set('semester', period)
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
      await t.test('admin detail displays mother occupation', async () => {
        const html = renderToStaticMarkup(await adminPage({ params: Promise.resolve({ id: student.id }) }))
        assert.ok(html.includes(student.motherJob))
      })
      await t.test('public search by NISN and NIM displays complete student details', async () => {
        for (const identifier of [student.nisn, student.nipd]) {
          const html = renderToStaticMarkup(await publicPage({ params: Promise.resolve({ nisn: identifier }) }))
          for (const value of [student.name, student.nisn, student.nipd, student.nik, student.religion, student.address, student.village, student.district, student.fatherName, student.fatherJob, student.motherName, student.motherJob, student.birthPlace, 'Lulus', '15 Januari 2017', '15 Juni 2026', 'Prestasi Uji', 'Kegiatan Uji', 'Juara 1']) {
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
      await t.test('subject uploads, edits and deletions stay isolated and recap contains report scores only', async () => {
        const feature = features.find(f => f.name === 'nilai')
        const before = await tx.studentReport.findFirst({ where: { studentId: student.id, subjectCode: 'BI_ID', semester: newPeriod } })
        const math = uploadForm(feature, newPeriod, [10, 20, 30, 0])
        math.set('subjectCode', 'MU')
        assert.equal((await gradeActions.uploadGradesAction(math)).success, true)
        const query = load('src/features/grades/queries.ts').gradeQueries
        const recap = (await query.findLedgerByStudent(student.id)).find(r => r.semester === newPeriod)
        assert.equal(recap.subjects.length, 2)
        assert.equal(recap.subjects.find(s => s.code === 'MU').score, 0)
        assert.equal(recap.subjects.find(s => s.code === 'BI_ID').score, before.score)
        assert.equal(recap.subjects[0].uh, undefined)
        const edit = form(newPeriod)
        edit.set('subjectCode', 'MU')
        for (const key of feature.fields) edit.set(key, '55')
        assert.equal((await gradeActions.editGradeAction(edit)).success, true)
        assert.equal((await query.findLedgerByStudent(student.id)).find(r => r.semester === newPeriod).subjects.find(s => s.code === 'MU').score, 55)
        assert.equal((await gradeActions.deleteGradeRecapAction(edit)).success, true)
        assert.equal(await tx.studentReport.count({ where: { studentId: student.id, subjectCode: 'MU' } }), 0)
        assert.deepEqual(await tx.studentReport.findUnique({ where: { id: before.id } }), before)
      })
      await t.test('rapor-only records show dashes and allow partial component editing', async () => {
        await tx.studentReport.create({ data: { classId: cls.id, studentId: student.id, semester: newPeriod, subjectCode: 'MU', subjectName: 'Matematika', score: 87 } })
        for (const html of await renderPages()) assert.match(html, />-</)
        const edit = form(newPeriod)
        edit.set('subjectCode', 'MU'); edit.set('uh', '0'); edit.set('asts', ''); edit.set('asas', ''); edit.set('score', '87')
        assert.equal((await gradeActions.editGradeAction(edit)).success, true)
        const report = await tx.studentReport.findFirst({ where: { studentId: student.id, subjectCode: 'MU', semester: newPeriod } })
        assert.equal(report.uh, 0); assert.equal(report.asts, null); assert.equal(report.asas, null)
        const recap = await load('src/features/assessment/page-data.ts').getAssessmentPageData({ classId: cls.id, semester: newPeriod }, 'mata-pelajaran')
        assert.equal(recap.ledgers.find(r => r.studentId === student.id).subjects.find(s => s.code === 'MU').score, 87)
      })
      await t.test('extracurricular upload uses selected semester, replaces predicates and preserves report scores', async () => {
        const actions = load('src/features/grades/ledger/actions.ts')
        const gradesBefore = await tx.studentReport.findMany({ where: { studentId: student.id }, orderBy: { id: 'asc' } })
        function extraForm(predicate, invalidNisn) {
          const data = form(newPeriod)
          data.set('category', 'ekstrakurikuler')
          const book = xlsx.utils.book_new()
          const rows = [['TAHUN BEBAS'], [], [], ['NO', 'NAMA SISWA', 'NISN', 'NIS', 'ekstra kulikuler'], [null, null, null, null, 'BTQ', 'Pramuka'], [], [], [1, student.name, Number(student.nisn), 1, predicate, 'B']]
          if (invalidNisn) rows.push([2, 'Tidak terdaftar', '0000000000', 2, 'B', 'B'])
          xlsx.utils.book_append_sheet(book, xlsx.utils.aoa_to_sheet(rows), 'Nilai Ekstra')
          data.set('file', new File([xlsx.write(book, { type: 'buffer', bookType: 'xlsx' })], 'ekstra.xlsx'))
          return data
        }
        assert.ok((await actions.uploadLedgerAction(extraForm('B', true))).error)
        assert.equal(await tx.ledgerReport.count({ where: { studentId: student.id } }), 0)
        assert.equal((await actions.uploadLedgerAction(extraForm('SB'))).success, true)
        assert.equal((await actions.uploadLedgerAction(extraForm(''))).success, true)
        const stored = await tx.ledgerReport.findMany({ where: { studentId: student.id }, include: { extracurriculars: true } })
        assert.equal(stored.length, 1); assert.equal(stored[0].semester, newPeriod)
        assert.equal(stored[0].extracurriculars.find(e => e.code === 'BTQ').predicate, null)
        assert.equal(stored[0].extracurriculars.find(e => e.code === 'PRAMUKA').predicate, 'B')
        assert.deepEqual(await tx.studentReport.findMany({ where: { studentId: student.id }, orderBy: { id: 'asc' } }), gradesBefore)
        const recap = await load('src/features/assessment/page-data.ts').getAssessmentPageData({ classId: cls.id, semester: newPeriod }, 'ekstrakurikuler')
        assert.equal(recap.ledgers[0].extracurriculars.find(e => e.code === 'PRAMUKA').predicate, 'B')
        for (const html of await renderPages()) assert.ok(html.includes('Pramuka'))
        const deletion = form(newPeriod); deletion.set('category', 'ekstrakurikuler')
        assert.equal((await actions.deleteLedgerRecapAction(deletion)).success, true)
        assert.equal(await tx.ledgerExtracurricularGrade.count({ where: { report: { studentId: student.id } } }), 0)
        assert.deepEqual(await tx.studentReport.findMany({ where: { studentId: student.id }, orderBy: { id: 'asc' } }), gradesBefore)
      })
      await t.test('bulk extracurricular upload preserves omitted activities, students and semesters', async () => {
        const actions = load('src/features/grades/ledger/actions.ts')
        const roster = Array.from({ length: 40 }, (_, index) => ({
          id: `${fixtureId}-${index}`, nisn: String(9000000000 + randomInt(10000000) * 40 + index),
          name: `Siswa Uji ${index}`, classId: cls.id,
        }))
        await tx.student.createMany({ data: roster })
        const original = await tx.ledgerReport.create({ data: {
          studentId: roster[0].id, classId: cls.id, semester: newPeriod, sakit: 2,
          subjects: { create: { code: 'MU', name: 'Matematika', score: 85 } },
          extracurriculars: { create: { code: 'TARI', name: 'Tari', predicate: 'SB' } },
        }, include: { subjects: true, extracurriculars: true } })
        const historical = await tx.ledgerReport.create({ data: {
          studentId: roster[0].id, classId: cls.id, semester: oldPeriod,
          extracurriculars: { create: { code: 'BTQ', name: 'BTQ', predicate: 'K' } },
        }, include: { extracurriculars: true } })
        async function upload(students, predicate) {
          const book = xlsx.utils.book_new()
          xlsx.utils.book_append_sheet(book, xlsx.utils.aoa_to_sheet([
            ['NO', 'NAMA SISWA', 'NISN', 'NIS', 'ekstra kulikuler'],
            [null, null, null, null, 'BTQ', 'Pramuka'], [], [],
            ...students.map((row, index) => [index + 1, row.name, row.nisn, index + 1, predicate, 'B']),
          ]), 'Ekstra')
          const data = form(newPeriod)
          data.set('category', 'ekstrakurikuler')
          data.set('file', new File([xlsx.write(book, { type: 'buffer', bookType: 'xlsx' })], 'ekstra.xlsx'))
          const result = await actions.uploadLedgerAction(data)
          assert.equal(result.success, true, result.error)
          assert.equal(result.count, students.length)
        }
        await upload(roster, 'SB')
        await upload(roster.slice(0, 39), '')
        const saved = await tx.ledgerReport.findMany({ where: { studentId: { in: roster.map(row => row.id) }, semester: newPeriod }, include: { subjects: true, extracurriculars: true } })
        assert.equal(saved.length, 40)
        for (const report of saved) {
          assert.equal(report.extracurriculars.find(item => item.code === 'BTQ').predicate, report.studentId === roster[39].id ? 'SB' : null)
          assert.equal(report.extracurriculars.find(item => item.code === 'PRAMUKA').predicate, 'B')
        }
        const first = saved.find(row => row.studentId === roster[0].id)
        assert.equal(first.id, original.id)
        assert.equal(first.sakit, 2)
        assert.deepEqual(first.subjects, original.subjects)
        assert.deepEqual(first.extracurriculars.find(item => item.code === 'TARI'), original.extracurriculars[0])
        assert.deepEqual(await tx.ledgerReport.findUnique({ where: { id: historical.id }, include: { extracurriculars: true } }), historical)
      })
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
      assert.equal(await db.ledgerReport.count({ where: { studentId: fixtureId } }), 0)
    } finally { await db.$disconnect() }
  }
})
