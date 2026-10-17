/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict')
const { test } = require('node:test')
const { readFileSync } = require('node:fs')
const vm = require('node:vm')
const ts = require('typescript')
const xlsx = require('xlsx')
function load(name, mocks = {}) {
  const api = {}
  vm.runInNewContext(ts.transpileModule(readFileSync(`src/features/grades/ledger/${name}.ts`, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText, { exports: api, Buffer, File, console: { error() {} }, require: name => name in mocks ? mocks[name] : name === '@/features/academic-catalog/queries' ? { catalogQueries: { active: async () => catalog } } : name === './format' ? load('format') : name === './excel' ? load('excel') : name === './schemas' ? load('schemas', mocks) : name === '../schemas' ? load('../schemas', mocks) : require(name) })
  return api
}
const { parseLedgerWorkbook } = load('excel')
const format = load('format')
const catalog = [...format.ledgerSubjects.map(([code,name]) => ({code,name,category:'mata-pelajaran'})), ...format.ledgerActivities.map(name => ({code:name.toUpperCase().replaceAll(' ','_'),name,category:'ekstrakurikuler'}))]
function fixture() {
  return [
    ['LEGER NILAI RAPOR SISWA TAHUN PELAJARAN 2025/2026 GENAP'], [], [],
    ['NO', 'NAMA SISWA', 'NISN', 'NIS', 'MATA PELAJARAN', ...Array(10).fill(null), 'Ketidakhadiran', null, null, 'Ekstra Kurikuler'],
    [null, null, null, null, 'PAIDBP', 'PPDK', 'BI', 'MU', 'IPADSI', 'PJODK', 'MLBD', 'SB', 'BI', 'PBP', 'GKS', null, null, null, 'Melukis', 'Tari', 'Futsal', 'Karate', 'Pantomim', 'BTQ', 'Pramuka', 'Bola Voli'], [],
    [...Array(15).fill(null), 'Sakit', 'Izin', 'Alpa'],
    [1, 'Siswa Uji', '0012345678', '1001', 80, 81, 82, 83, 84, 85, 86, 87, 88, null, null, 0, 1, 2, null, 'B', null, null, null, 'SB', 'B', null],
    [], ['KETERANGAN MAPEL :'], ['BI : Bahasa Indonesia'],
  ]
}
function parse(rows) {
  const book = xlsx.utils.book_new()
  xlsx.utils.book_append_sheet(book, xlsx.utils.aoa_to_sheet(rows), 'Worksheet')
  return parseLedgerWorkbook(xlsx.write(book, { type: 'buffer', bookType: 'xlsx' }))
}
test('leger preserves semester, NISN, distinct BI scores, empty cells and predicates', () => {
  const result = parse(fixture())
  assert.equal(result.semester, 'Genap 2025/2026')
  assert.equal(result.rows.length, 1)
  const row = result.rows[0]
  assert.equal(row.nisn, '0012345678')
  assert.equal(row.subjects.find(s => s.code === 'BI_ID').score, 82)
  assert.equal(row.subjects.find(s => s.code === 'BI_EN').score, 88)
  assert.equal(row.subjects.find(s => s.code === 'PBP').score, null)
  assert.equal(row.sakit, 0)
  assert.equal(row.extracurriculars.find(s => s.code === 'BTQ').predicate, 'SB')
  assert.equal(row.extracurriculars[0].predicate, null)
})
test('leger rejects invalid scores, attendance, predicates and missing identity', () => {
  for (const [column, value] of [[4, 101], [4, -1], [4, true], [15, 1.5], [15, -1], [19, 'Z'], [2, ''], [1, '']]) {
    const rows = fixture(); rows[7][column] = value
    assert.throws(() => parse(rows), /Baris 8/)
  }
})
test('leger rejects duplicates, wrong headers and invalid school year', () => {
  let rows = fixture(); rows.splice(8, 0, rows[7]); assert.throws(() => parse(rows), /NISN berulang/)
  rows = fixture(); rows[4][12] = 'LAIN'; assert.throws(() => parse(rows), /format leger/)
  rows = fixture(); rows[0][0] = '2025/2027 GENAP'; assert.throws(() => parse(rows), /semester.*tidak valid/)
  rows = fixture(); rows.splice(7, 1); assert.throws(() => parse(rows), /tidak memiliki data/)
})

test('upload enforces authorization, semester and class before saving both categories from subject uploads', async () => {
  let authorized = true, roster = true, writes = []
  const action = load('actions', {
    '@/lib/auth': { requireAdminEmail: async () => { if (!authorized) throw Error('Unauthorized') } },
    '@/lib/db': { db: {
      student: { findMany: async () => roster ? [{ id: 'student', nisn: '0012345678' }] : [] },
      ledgerReport: { upsert: value => { writes.push(value); return Promise.resolve(value) } },
      $transaction: values => Promise.all(values),
    } },
    'next/cache': { revalidatePath() {} },
  }).uploadLedgerAction
  const book = xlsx.utils.book_new()
  xlsx.utils.book_append_sheet(book, xlsx.utils.aoa_to_sheet(fixture()), 'Worksheet')
  const form = new FormData()
  form.set('file', new File([xlsx.write(book, { type: 'buffer', bookType: 'xlsx' })], 'leger.xlsx'))
  form.set('classId', 'class'); form.set('semester', 'Genap 2025/2026'); form.set('category', 'mata-pelajaran')
  authorized = false
  assert.ok((await action(form)).error); assert.equal(writes.length, 0)
  authorized = true; roster = false
  assert.ok((await action(form)).error); assert.equal(writes.length, 0)
  roster = true; form.set('semester', 'Ganjil 2025/2026')
  assert.ok((await action(form)).error); assert.equal(writes.length, 0)
  form.set('semester', 'Genap 2025/2026')
  assert.equal((await action(form)).success, true)
  assert.equal(writes[0].update.subjects.create.length, 11)
  assert.equal(writes[0].update.extracurriculars.create.length, 8)
  assert.equal(writes[0].create.extracurriculars.create.length, 8)
  assert.equal(writes[0].create.subjects.create.length, 11)
  assert.equal(writes[0].update.extracurriculars.create.find(s => s.code === 'BTQ').predicate, 'SB')
  assert.equal(writes[0].update.extracurriculars.create[0].predicate, null)
  assert.equal(writes[0].where.studentId_semester.semester, 'Genap 2025/2026')
  writes = []; form.set('category', 'ekstrakurikuler')
  assert.match((await action(form)).error, /melalui menu Nilai Mata Pelajaran/)
  assert.equal(writes.length, 0)
})

test('edit and delete validate authorization, values and exact category scope', async () => {
  let authorized = true, missing = false
  const updates = [], deletions = [], refreshed = []
  const actions = load('actions', {
    '@/lib/auth': { requireAdminEmail: async () => { if (!authorized) throw Error('Unauthorized') } },
    '@/lib/db': { db: {
      ledgerReport: { findFirst: async () => missing ? null : { subjects: catalog.filter(i => i.category === 'mata-pelajaran'), extracurriculars: catalog.filter(i => i.category === 'ekstrakurikuler') }, update: async value => { if (missing) throw Error('Not found'); updates.push(value) } },
      ledgerSubjectGrade: { deleteMany: async value => deletions.push(['subjects', value]) },
      ledgerExtracurricularGrade: { deleteMany: async value => deletions.push(['activities', value]) },
    } },
    'next/cache': { revalidatePath: path => refreshed.push(path) },
  })
  const { ledgerSubjects, ledgerActivities } = load('format')
  const form = new FormData()
  form.set('classId', 'saved-class'); form.set('semester', 'Genap 2025/2026')
  form.set('studentId', 'student'); form.set('category', 'mata-pelajaran')
  for (const [code] of ledgerSubjects) form.set(code, '80')
  authorized = false
  assert.ok((await actions.editLedgerAction(form)).error)
  assert.ok((await actions.deleteLedgerRecapAction(form)).error)
  assert.equal(updates.length + deletions.length, 0)
  authorized = true
  for (const invalid of ['101', '-1', 'NaN', 'abc']) {
    form.set('PAIDBP', invalid)
    assert.ok((await actions.editLedgerAction(form)).error)
  }
  form.delete('PAIDBP'); assert.ok((await actions.editLedgerAction(form)).error)
  assert.equal(updates.length, 0)
  form.set('PAIDBP', '0'); form.set('PBP', '')
  missing = true; assert.ok((await actions.editLedgerAction(form)).error)
  missing = false
  assert.equal((await actions.editLedgerAction(form)).success, true)
  const update = updates[0]
  assert.equal(update.where.classId, 'saved-class')
  assert.equal(update.where.studentId_semester.studentId, 'student')
  assert.equal(update.where.studentId_semester.semester, 'Genap 2025/2026')
  assert.ok(update.where.subjects.some)
  assert.equal(update.data.subjects.create.find(s => s.code === 'PAIDBP').score, 0)
  assert.equal(update.data.subjects.create.find(s => s.code === 'PBP').score, null)
  assert.equal(update.data.extracurriculars, undefined)
  form.set('category', 'ekstrakurikuler')
  for (const name of ledgerActivities) form.set(name.toUpperCase().replaceAll(' ', '_'), 'B')
  form.set('BTQ', 'Z'); assert.ok((await actions.editLedgerAction(form)).error)
  form.set('BTQ', 'sb'); form.set('TARI', '')
  assert.equal((await actions.editLedgerAction(form)).success, true)
  assert.equal(updates[1].data.subjects, undefined)
  assert.equal(updates[1].data.extracurriculars.create.find(s => s.code === 'BTQ').predicate, 'SB')
  assert.equal(updates[1].data.extracurriculars.create.find(s => s.code === 'TARI').predicate, null)
  assert.equal((await actions.deleteLedgerRecapAction(form)).success, true)
  form.set('category', 'mata-pelajaran')
  assert.equal((await actions.deleteLedgerRecapAction(form)).success, true)
  assert.equal(deletions[0][0], 'activities'); assert.equal(deletions[1][0], 'subjects')
  for (const [, deletion] of deletions) {
    assert.equal(deletion.where.report.classId, 'saved-class')
    assert.equal(deletion.where.report.semester, 'Genap 2025/2026')
  }
  form.set('semester', 'Genap 2025/2027')
  assert.ok((await actions.deleteLedgerRecapAction(form)).error)
  form.set('semester', 'Genap 2025/2026'); form.set('classId', '')
  assert.ok((await actions.deleteLedgerRecapAction(form)).error)
  form.set('classId', 'saved-class'); form.set('category', 'all')
  assert.ok((await actions.deleteLedgerRecapAction(form)).error)
  assert.equal(deletions.length, 2)
  assert.ok(refreshed.includes('/admin/nilai/mata-pelajaran'))
  assert.ok(refreshed.includes('/admin/nilai/ekstrakurikuler'))
})

test('catalog-based imports accept new subjects and activities, preserve BI aliases and reject unknown columns', () => {
  const rows = fixture()
  // Add a subject before attendance and an activity after existing activities.
  for (const row of rows.slice(3, 8)) row.splice(15, 0, null)
  rows[4][15] = 'TIK'; rows[7][15] = 91
  rows[4][27] = 'ROBOTIK'; rows[7][27] = 'SB'
  const entries = [...catalog, { category: 'mata-pelajaran', code: 'TIK', name: 'Teknologi Informasi' }, { category: 'ekstrakurikuler', code: 'ROBOTIK', name: 'Robotik' }]
  const book = xlsx.utils.book_new()
  xlsx.utils.book_append_sheet(book, xlsx.utils.aoa_to_sheet(rows), 'Worksheet')
  const buffer = xlsx.write(book, { type: 'buffer', bookType: 'xlsx' })
  const result = parseLedgerWorkbook(buffer, entries)
  assert.equal(result.rows[0].subjects.find(i => i.code === 'TIK').score, 91)
  assert.equal(result.rows[0].subjects.find(i => i.code === 'BI_EN').score, 88)
  assert.equal(result.rows[0].extracurriculars.find(i => i.code === 'ROBOTIK').predicate, 'SB')
  assert.equal(result.rows[0].sakit, 0)
  assert.throws(() => parseLedgerWorkbook(buffer, catalog), /tidak dikenal/)
})
