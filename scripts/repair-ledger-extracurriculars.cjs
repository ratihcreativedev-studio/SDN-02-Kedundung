/* eslint-disable @typescript-eslint/no-require-imports */
// Usage: node scripts/repair-ledger-extracurriculars.cjs <classId> <file.xlsx> [--apply]
// Defaults to a rollback-only preview. Never replaces existing extracurricular grades.
require('dotenv').config({ quiet: true })
const { readFileSync } = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')
const ts = require('typescript')
const { Client } = require('pg')
const { randomUUID } = require('node:crypto')
function load(name) {
  const api = {}
  const source = readFileSync(path.join(__dirname, '../src/features/grades/ledger', `${name}.ts`), 'utf8')
  vm.runInNewContext(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText, {
    exports: api, require: name => name === './format' ? load('format') : require(name),
  })
  return api
}
async function main() {
  const [classId, file, flag] = process.argv.slice(2)
  if (!classId || !file || (flag && flag !== '--apply')) throw Error('Usage: <classId> <file.xlsx> [--apply]')
  const parsed = load('excel').parseLedgerWorkbook(readFileSync(file))
  const db = new Client({ connectionString: process.env.DATABASE_URL, connectionTimeoutMillis: 10000 })
  try {
    await db.connect()
    await db.query('BEGIN')
    const reports = await db.query(`SELECT r.id, s.nisn FROM ledger_reports r JOIN students s ON s.id=r."studentId"
      WHERE r."classId"=$1 AND r.semester=$2 FOR UPDATE OF r`, [classId, parsed.semester])
    const reportIds = new Map(reports.rows.map(row => [row.nisn, row.id]))
    if (parsed.rows.some(row => !reportIds.has(row.nisn))) throw Error('Some workbook students have no report in the selected class and semester. No changes saved.')
    let inserted = 0, preserved = 0, subjectDifferences = 0
    for (const row of parsed.rows) {
      const reportId = reportIds.get(row.nisn)
      const subjects = await db.query('SELECT code, score FROM ledger_subject_grades WHERE "reportId"=$1', [reportId])
      const scores = new Map(subjects.rows.map(item => [item.code, item.score]))
      if (row.subjects.some(item => !scores.has(item.code))) throw Error('Expected subject grades are missing. No changes saved.')
      subjectDifferences += row.subjects.filter(item => scores.get(item.code) !== item.score).length
      for (const item of row.extracurriculars) {
        const result = await db.query(`INSERT INTO ledger_extracurricular_grades (id,"reportId",code,name,predicate)
          VALUES ($1,$2,$3,$4,$5) ON CONFLICT ("reportId",code) DO NOTHING`, [randomUUID(), reportId, item.code, item.name, item.predicate])
        inserted += result.rowCount
        preserved += 1 - result.rowCount
      }
    }
    await db.query(flag === '--apply' ? 'COMMIT' : 'ROLLBACK')
    console.log(JSON.stringify({ mode: flag === '--apply' ? 'applied' : 'preview-rolled-back', semester: parsed.semester, students: parsed.rows.length, inserted, preserved, subjectDifferences, subjectsModified: 0 }))
  } catch (error) {
    await db.query('ROLLBACK').catch(() => {})
    throw error
  } finally { await db.end() }
}
main().catch(error => { console.error(error.code || error.message); process.exitCode = 1 })
