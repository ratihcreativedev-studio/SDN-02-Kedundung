/* eslint-disable @typescript-eslint/no-require-imports -- Node's test runner loads TypeScript through the existing compiler. */
const assert = require('node:assert/strict')
const { readFileSync } = require('node:fs')
const path = require('node:path')
const { test } = require('node:test')
const vm = require('node:vm')
const ts = require('typescript')
const React = require('react')
const { renderToStaticMarkup } = require('react-dom/server')

function load(file, mocks = {}, globals = {}) {
  const source = readFileSync(path.join(__dirname, '..', file), 'utf8')
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022 },
    fileName: file,
  })
  const exports = {}
  vm.runInNewContext(outputText, {
    exports, process, console, AbortSignal,
    require: (name) => Object.hasOwn(mocks, name) ? mocks[name] : require(name),
    ...globals,
  }, { filename: file })
  return exports
}

function verifier(fetch) {
  return load('src/lib/firebase/verify.ts', {}, {
    fetch,
    process: { env: { NEXT_PUBLIC_FIREBASE_API_KEY: 'test-key' } },
  })
}

test('Firebase distinguishes an expired token from service failures and rejects unverified email', async () => {
  for (const [response, message] of [
    [{ ok: false, json: async () => ({ error: { message: 'TOKEN_EXPIRED' } }) }, /Silakan masuk kembali/],
    [{ ok: false, json: async () => ({ error: { message: 'API_KEY_INVALID' } }) }, /Layanan verifikasi/],
    [{ ok: true, json: async () => ({ users: [{ email: 'admin@example.com', emailVerified: false }] }) }, /belum terverifikasi/],
  ]) {
    const api = verifier(async () => response)
    await assert.rejects(api.getVerifiedFirebaseEmail('token'), message)
  }
  const api = verifier(async () => { throw new Error('network unavailable') })
  await assert.rejects(api.getVerifiedFirebaseEmail('token'), /belum dapat dihubungi/)
})

test('verified Firebase identity, not a client-supplied email, is returned', async () => {
  const api = verifier(async (_url, options) => {
    assert.equal(JSON.parse(options.body).idToken, 'test-token')
    return { ok: true, json: async () => ({ users: [{ email: 'admin@example.com', emailVerified: true }] }) }
  })
  assert.equal(await api.getVerifiedFirebaseEmail('test-token'), 'admin@example.com')
})

function authSession({ token, admin = true, expired = false }) {
  return load('src/lib/auth.ts', {
    'next/headers': { cookies: async () => ({ get: (name) => name === 'sipanda-token' && token ? { value: token } : undefined }) },
    '@/lib/db': { db: { adminWhitelist: { findUnique: async () => admin ? { email: 'admin@example.com' } : null } } },
    '@/lib/firebase/verify': { getVerifiedFirebaseEmail: async () => {
      if (expired) throw new Error('expired')
      return 'admin@example.com'
    } },
  })
}

test('login renders for missing, expired, or removed-admin sessions; only an authorized session redirects', async () => {
  for (const session of [{}, { token: 'expired', expired: true }, { token: 'valid', admin: false }, { token: 'valid' }]) {
    const auth = authSession(session)
    const { default: LoginPage } = load('src/app/(auth)/login/page.tsx', {
      '@/lib/auth': auth,
      '@/features/auth/components/LoginForm': { LoginForm: () => null },
      'next/navigation': { redirect: (url) => { throw new Error(`redirect:${url}`) } },
    })
    const result = LoginPage({ searchParams: Promise.resolve({ error: 'auth-failed' }) })
    if (session.token === 'valid' && session.admin !== false) {
      await assert.rejects(result, /redirect:\/admin/)
      assert.equal(await auth.requireAdminEmail(), 'admin@example.com')
    } else {
      const page = await result
      assert.match(page.props.children.props.initialError, /Autentikasi gagal/)
      await assert.rejects(auth.requireAdminEmail(), /Unauthorized/)
    }
  }
})

test('login action returns expected verification errors without issuing cookies or accessing the database', async () => {
  const api = verifier(async () => ({ ok: false, json: async () => ({ error: { message: 'INVALID_ID_TOKEN' } }) }))
  const actions = load('src/features/auth/actions.ts', {
    '@/lib/firebase/verify': api,
    '@/lib/db': { db: {} },
    'next/headers': { cookies: async () => { assert.fail('No cookies may be issued') } },
  })
  assert.match((await actions.setSessionAction('invalid')).error, /Silakan masuk kembali/)
})

test('profile failure does not create a partial session', async () => {
  const actions = load('src/features/auth/actions.ts', {
    '@/lib/firebase/verify': { FirebaseVerificationError: class extends Error {}, getVerifiedFirebaseEmail: async () => 'admin@example.com' },
    '@/lib/db': { db: {
      adminWhitelist: { findUnique: async () => ({ role: 'ADMIN' }) },
      profile: { upsert: async () => { throw new Error('database unavailable') } },
    } },
    'next/headers': { cookies: async () => { assert.fail('No cookies may be issued') } },
  }, { console: { error: () => {} } })
  assert.match((await actions.setSessionAction('valid')).error, /Gagal menyiapkan sesi/)
})

test('successful login persists the profile first and replaces legacy cookies', async () => {
  const events = []
  const actions = load('src/features/auth/actions.ts', {
    '@/lib/firebase/verify': { FirebaseVerificationError: class extends Error {}, getVerifiedFirebaseEmail: async () => 'admin@example.com' },
    '@/lib/db': { db: {
      adminWhitelist: { findUnique: async () => ({ role: 'ADMIN' }) },
      profile: { upsert: async () => { events.push('profile') } },
    } },
    'next/headers': { cookies: async () => ({
      delete: (name) => events.push(`delete:${name}`),
      set: (name, value, options) => {
        events.push(`set:${name}`)
        assert.equal(value, 'valid')
        assert.equal(options.httpOnly, true)
        assert.equal(options.maxAge, 3600)
      },
    }) },
  })
  assert.equal((await actions.setSessionAction('valid')).success, true)
  assert.deepEqual(events, ['profile', 'delete:sipanda-auth', 'set:sipanda-token', 'delete:sipanda-photo'])
})

test('announcement cards render separate valid anchors and a Jakarta calendar date', () => {
  const { AnnouncementList } = load('src/components/home/announcement-list.tsx')
  const html = renderToStaticMarkup(React.createElement(AnnouncementList, { announcements: [{
    id: 'test', title: 'Pengumuman', status: 'PUBLISHED',
    createdAt: '2026-10-14T18:00:00Z', content: 'Lihat https://example.com/form dan ftp://example.com/file',
  }] }))
  let depth = 0
  for (const tag of html.match(/<\/?a\b[^>]*>/g) || []) {
    depth += tag.startsWith('</') ? -1 : 1
    assert.ok(depth === 0 || depth === 1, 'Anchors must not be nested')
  }
  assert.equal(depth, 0)
  assert.match(html, /href="\/informasi\/test"/)
  assert.match(html, /href="https:\/\/example.com\/form"/)
  assert.match(html, /href="ftp:\/\/example.com\/file"/)
  assert.match(html, /15 Oktober 2026/)
})
