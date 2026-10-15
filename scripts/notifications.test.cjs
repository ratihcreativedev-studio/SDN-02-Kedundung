/* eslint-disable @typescript-eslint/no-require-imports -- Isolated notification tests use Node. */
const assert = require('node:assert/strict')
const { test } = require('node:test')
const { readFileSync } = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')
const ts = require('typescript')
const api = {}
vm.runInNewContext(ts.transpileModule(readFileSync(path.join(__dirname, '../src/components/ui/notification-action.ts'), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText, { exports: api })

test('success notification waits for the action to finish and fires once', async () => {
  const notices = []
  let finish
  const pending = api.executeNotifiedAction(() => new Promise(resolve => { finish = resolve }), 'Tersimpan', (...args) => notices.push(args))
  assert.equal(notices.length, 0)
  finish({ success: true })
  assert.equal((await pending).success, true)
  assert.deepEqual(notices, [['Tersimpan', 'success']])
})

test('validation and failed action results never emit success', async () => {
  for (const result of [{ error: 'Data tidak valid' }, { success: false }, {}]) {
    const notices = []
    const outcome = await api.executeNotifiedAction(async () => result, 'Tersimpan', (...args) => notices.push(args))
    assert.equal(outcome.success, false)
    assert.equal(notices.length, 1)
    assert.equal(notices[0][1], 'error')
    assert.equal(notices[0][0], outcome.error)
  }
})

test('network exceptions return an error and do not expose internal details', async () => {
  const notices = []
  const result = await api.executeNotifiedAction(async () => { throw new Error('private connection detail') }, 'Tersimpan', (...args) => notices.push(args))
  assert.equal(result.success, false)
  assert.equal(notices[0][1], 'error')
  assert(!result.error.includes('private'))
})

test('logout actions without a return value still emit success', async () => {
  const notices = []
  const result = await api.executeNotifiedAction(async () => {}, 'Berhasil keluar', (...args) => notices.push(args))
  assert.equal(result.success, true)
  assert.deepEqual(notices, [['Berhasil keluar', 'success']])
})
