import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'
import pg from 'pg'
import { createHash } from 'node:crypto'
import { readdir, readFile, unlink } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

// Upload and verify every photo before updating references and deleting local files.
const directory = new URL('../public/images/', import.meta.url)
const files = (await readdir(directory)).filter(name => /^prestasi-.*\.jpeg$/.test(name))
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
})
const db = new pg.Client({ connectionString: process.env.DATABASE_URL, connectionTimeoutMillis: 10000, statement_timeout: 15000 })
const hash = bytes => createHash('sha256').update(bytes).digest('hex')
const migrated = []

try {
  await db.connect()
  for (const name of files) {
    const bytes = await readFile(new URL(name, directory))
    const digest = hash(bytes)
    const objectPath = `prestasi/${digest}-${name}`
    const { data } = supabase.storage.from('sipanda-images').getPublicUrl(objectPath)
    let response = await fetch(data.publicUrl, { cache: 'no-store' })
    if (!response.ok) {
      const { error } = await supabase.storage.from('sipanda-images').upload(objectPath, bytes, {
        contentType: 'image/jpeg', cacheControl: '3600', upsert: false,
      })
      if (error) throw new Error(`Upload failed for ${name}: ${error.message}`)
      response = await fetch(data.publicUrl, { cache: 'no-store' })
    }
    if (!response.ok || hash(Buffer.from(await response.arrayBuffer())) !== digest) {
      throw new Error(`Remote verification failed for ${name}`)
    }
    migrated.push({ name, oldUrl: `/images/${name}`, url: data.publicUrl })
    console.log(`Verified upload: ${name}`)
  }

  await db.query('BEGIN')
  for (const item of migrated) {
    const existing = await db.query('SELECT id FROM public.achievements WHERE "imageUrl" = $1 OR "imageUrl" = $2', [item.oldUrl, item.url])
    if (!existing.rowCount) throw new Error(`No achievement references ${item.name}`)
    await db.query('UPDATE public.achievements SET "imageUrl" = $1, "updatedAt" = NOW() WHERE "imageUrl" = $2', [item.url, item.oldUrl])
    // Preserve other existing uses of the same photos, if any.
    await db.query('UPDATE public.galleries SET "imageUrl" = $1 WHERE "imageUrl" = $2', [item.url, item.oldUrl])
    await db.query('UPDATE public.announcements SET thumbnail = $1, "updatedAt" = NOW() WHERE thumbnail = $2', [item.url, item.oldUrl])
  }
  await db.query('COMMIT')

  for (const item of migrated) {
    const check = await db.query('SELECT count(*)::int AS count FROM public.achievements WHERE "imageUrl" = $1', [item.url])
    if (!check.rows[0].count) throw new Error(`Missing committed reference: ${item.name}`)
    await unlink(fileURLToPath(new URL(item.name, directory)))
  }
  console.log(`Completed: ${migrated.length} photos verified, database references updated, local files removed.`)
} catch (error) {
  await db.query('ROLLBACK').catch(() => {})
  console.error(error.message)
  process.exitCode = 1
} finally {
  await db.end()
}
