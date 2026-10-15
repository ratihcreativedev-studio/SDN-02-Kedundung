import 'dotenv/config'
import { readFile } from 'node:fs/promises'
import { Pool } from 'pg'

// Source: tentang-section.tsx, src/data/index.ts and footer.tsx, captured in
// src/data/school-profile.json. Fill missing values without replacing admin edits.
const defaults = JSON.parse(await readFile(new URL('../src/data/school-profile.json', import.meta.url), 'utf8'))
const fields = ['description', 'vision', 'mission', 'organization', 'contactEmail', 'contactPhone', 'address']
if (!fields.every(field => typeof defaults[field] === 'string' && defaults[field].trim())) {
  throw new Error('Data awal profil sekolah tidak lengkap')
}
const pool = new Pool({ connectionString: process.env.DATABASE_URL, connectionTimeoutMillis: 10000 })
const client = await pool.connect()
try {
  await client.query('BEGIN')
  await client.query('LOCK TABLE school_profiles IN SHARE ROW EXCLUSIVE MODE')
  const { rows } = await client.query('SELECT * FROM school_profiles ORDER BY "updatedAt", id LIMIT 1')
  const existing = rows[0]
  const missing = existing ? fields.filter(field => !existing[field]?.trim()) : fields
  if (!existing) {
    await client.query(`INSERT INTO school_profiles (id, ${fields.map(field => `"${field}"`).join(', ')}, "updatedAt") VALUES ($1, ${fields.map((_, index) => `$${index + 2}`).join(', ')}, NOW())`, ['school-profile-default', ...fields.map(field => defaults[field])])
  } else if (missing.length) {
    await client.query(`UPDATE school_profiles SET ${missing.map((field, index) => `"${field}" = $${index + 2}`).join(', ')}, "updatedAt" = NOW() WHERE id = $1`, [existing.id, ...missing.map(field => defaults[field])])
  }
  const { rows: verified } = await client.query('SELECT * FROM school_profiles WHERE id = $1', [existing?.id || 'school-profile-default'])
  if (!fields.every(field => verified[0]?.[field]?.trim())) throw new Error('Verifikasi profil sekolah gagal')
  await client.query('COMMIT')
  console.log(JSON.stringify({ status: 'ok', operation: existing ? 'fill-missing-fields' : 'create', fieldsFilled: missing, missionCount: verified[0].mission.split('\n').filter(Boolean).length }))
} catch (error) {
  await client.query('ROLLBACK')
  console.error('Pengisian profil sekolah gagal.', { code: error.code })
  process.exitCode = 1
} finally {
  client.release()
  await pool.end()
}
