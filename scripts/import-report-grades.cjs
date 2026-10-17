/* eslint-disable @typescript-eslint/no-require-imports */
// Usage: node scripts/import-report-grades.cjs <class-name> <file.xlsx> [--apply]
// Preview by default. Imports only nonempty report scores; preserves existing components.
require('dotenv').config({ quiet: true })
const { readFileSync } = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')
const ts = require('typescript')
const { Client } = require('pg')
const { randomUUID } = require('node:crypto')
function load(name) {
  const api = {}
  vm.runInNewContext(ts.transpileModule(readFileSync(path.join(__dirname, '../src/features/grades/ledger', `${name}.ts`), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText, { exports: api, require: name => name === './format' ? load('format') : require(name) })
  return api
}
async function main() {
  const [className, file, flag] = process.argv.slice(2)
  if (!className || !file || (flag && flag !== '--apply')) throw Error('Usage: <class-name> <file.xlsx> [--apply]')
  const db = new Client({ connectionString: process.env.DATABASE_URL, connectionTimeoutMillis: 10000 })
  try {
    await db.connect()
    await db.query('BEGIN')
    const classes = await db.query('SELECT id, name FROM classes WHERE LOWER(name)=LOWER($1)', [className])
    if (classes.rowCount !== 1) throw Error('Expected exactly one matching class. No changes saved.')
    const cls = classes.rows[0]
    const catalog = await db.query('SELECT category, code, name FROM academic_items WHERE "deletedAt" IS NULL')
    const parsed = load('excel').parseLedgerWorkbook(readFileSync(file), catalog.rows)
    const roster = await db.query('SELECT id, nisn FROM students WHERE "classId"=$1 FOR SHARE', [cls.id])
    const ids = new Map(roster.rows.map(s => [s.nisn, s.id]))
    const unmatched = parsed.rows.filter(r => !ids.has(r.nisn)).length
    if (unmatched) throw Error(`${unmatched} workbook students do not match the selected class. No changes saved.`)
    const records = parsed.rows.flatMap(row => row.subjects.filter(s => s.score !== null).map(subject => ({
      id: randomUUID(), studentId: ids.get(row.nisn), subjectCode: subject.code, subjectName: subject.name, score: subject.score,
    })))
    if (!records.length) throw Error('No report scores to import.')
    const existing = await db.query('SELECT "studentId", "subjectCode", "classId", uh, asts, asas, score FROM student_reports WHERE "studentId"=ANY($1::text[]) AND semester=$2 FOR UPDATE', [records.map(r => r.studentId), parsed.semester])
    const previous = new Map(existing.rows.map(r => [`${r.studentId}:${r.subjectCode}`, r]))
    if (records.some(r => previous.has(`${r.studentId}:${r.subjectCode}`) && previous.get(`${r.studentId}:${r.subjectCode}`).classId !== cls.id)) throw Error('Existing report belongs to another class. No changes saved.')
    const updated = records.filter(r => previous.has(`${r.studentId}:${r.subjectCode}`)).length
    const componentsPreserved = records.filter(r => {
      const old = previous.get(`${r.studentId}:${r.subjectCode}`)
      return old && [old.uh, old.asts, old.asas].some(v => v !== null)
    }).length
    if (flag === '--apply') {
      await db.query(`INSERT INTO student_reports (id, "classId", "studentId", semester, "subjectCode", "subjectName", uh, asts, asas, score, "createdAt", "updatedAt")
        SELECT r.id, $2, r."studentId", $3, r."subjectCode", r."subjectName", NULL, NULL, NULL, r.score, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
        FROM jsonb_to_recordset($1::jsonb) AS r(id text, "studentId" text, "subjectCode" text, "subjectName" text, score double precision)
        ON CONFLICT ("studentId", "subjectCode", semester) DO UPDATE SET
          score=EXCLUDED.score, "subjectName"=EXCLUDED."subjectName", "updatedAt"=CURRENT_TIMESTAMP`, [JSON.stringify(records), cls.id, parsed.semester])
      const saved = await db.query('SELECT "studentId", "subjectCode", uh, asts, asas, score FROM student_reports WHERE "classId"=$1 AND semester=$2 AND "studentId"=ANY($3::text[])', [cls.id, parsed.semester, records.map(r => r.studentId)])
      const actual = new Map(saved.rows.map(r => [`${r.studentId}:${r.subjectCode}`, r]))
      for (const record of records) {
        const key = `${record.studentId}:${record.subjectCode}`, row = actual.get(key), old = previous.get(key)
        if (!row || row.score !== record.score || ['uh', 'asts', 'asas'].some(k => row[k] !== (old?.[k] ?? null))) throw Error('Import verification failed. No changes saved.')
      }
    }
    await db.query(flag === '--apply' ? 'COMMIT' : 'ROLLBACK')
    console.log(JSON.stringify({ mode: flag === '--apply' ? 'applied-and-verified' : 'preview', class: cls.name, semester: parsed.semester, students: parsed.rows.length, scores: records.length, inserted: records.length - updated, updated, componentsPreserved, blankScoresSkipped: parsed.rows.reduce((n, r) => n + r.subjects.filter(s => s.score === null).length, 0) }))
  } catch (error) {
    await db.query('ROLLBACK').catch(() => {})
    throw error
  } finally { await db.end() }
}
main().catch(error => { console.error(error.code || error.message); process.exitCode = 1 })
