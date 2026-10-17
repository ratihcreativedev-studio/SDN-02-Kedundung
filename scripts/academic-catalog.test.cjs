/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict')
const { test } = require('node:test')
const { readFileSync } = require('node:fs')
const vm = require('node:vm')
const ts = require('typescript')
function load(name, mocks = {}) {
  const api = {}
  vm.runInNewContext(ts.transpileModule(readFileSync(`src/features/academic-catalog/${name}.ts`, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText, { exports: api, require: name => name in mocks ? mocks[name] : name === './schemas' ? load('schemas') : require(name) })
  return api
}
function form(category = 'mata-pelajaran') {
  const data = new FormData()
  data.set('category', category); data.set('code', ' tik '); data.set('name', ' Teknologi Informasi ')
  return data
}
test('catalog mutations require admin authorization and reject invalid input', async () => {
  let allowed = false, writes = 0
  const api = load('actions', {
    '@/lib/auth': { requireAdminEmail: async () => { if (!allowed) throw Error('Unauthorized') } },
    '@/lib/db': { db: { academicItem: { create: async () => { writes++ }, updateMany: async () => { writes++; return { count: 1 } } } } },
    'next/cache': { revalidatePath() {} },
  })
  assert.ok((await api.saveCatalogAction(form())).error)
  const deletion = form(); deletion.set('id', 'item')
  assert.ok((await api.deleteCatalogAction(deletion)).error)
  allowed = true
  for (const [field, value] of [['category', 'invalid'], ['code', 'a b'], ['code', '1TIK'], ['name', ' ']]) {
    const data = form(); data.set(field, value)
    assert.ok((await api.saveCatalogAction(data)).error)
  }
  assert.ok((await api.deleteCatalogAction(form())).error)
  assert.equal(writes, 0)
})
test('catalog create normalizes identity, rename preserves code, and delete preserves grade history', async () => {
  const creates = [], updates = [], paths = []
  let count = 1, duplicate = false
  const api = load('actions', {
    '@/lib/auth': { requireAdminEmail: async () => 'admin' },
    '@/lib/db': { db: { academicItem: {
      create: async args => { if (duplicate) throw { code: 'P2002' }; creates.push(args) },
      updateMany: async args => { updates.push(args); return { count } },
    } } },
    'next/cache': { revalidatePath: path => paths.push(path) },
  })
  for (const category of ['mata-pelajaran', 'ekstrakurikuler']) {
    const data = form(category)
    assert.equal((await api.saveCatalogAction(data)).success, true)
    assert.equal(creates.at(-1).data.code, 'TIK')
    assert.equal(creates.at(-1).data.name, 'Teknologi Informasi')
    data.set('id', 'item')
    assert.equal((await api.saveCatalogAction(data)).success, true)
    const update = updates.at(-1)
    assert.equal(update.where.category, category)
    assert.equal(update.where.id, 'item')
    assert.equal(update.where.code, 'TIK')
    assert.equal(update.where.deletedAt, null)
    assert.equal(update.data.code, undefined)
    assert.equal((await api.deleteCatalogAction(data)).success, true)
    assert.ok(updates.at(-1).data.deletedAt)
    assert.equal(updates.at(-1).where.category, category)
  }
  count = 0
  const missing = form(); missing.set('id', 'missing')
  assert.ok((await api.saveCatalogAction(missing)).error)
  assert.ok((await api.deleteCatalogAction(missing)).error)
  duplicate = true
  assert.match((await api.saveCatalogAction(form())).error, /sudah digunakan/)
  assert.ok(paths.includes('/admin/mata-pelajaran'))
  assert.ok(paths.includes('/admin/ekstrakurikuler'))
})
