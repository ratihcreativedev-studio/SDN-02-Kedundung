/* eslint-disable @typescript-eslint/no-require-imports -- Isolated QA harness uses the Node test runner. */
const assert = require('node:assert/strict')
const { test } = require('node:test')
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')
const ts = require('typescript')
const xlsx = require('xlsx')
const root = path.resolve(__dirname, '..')

// No environment file is loaded. Real DB, storage, auth and network are denied.
function harness(overrides = {}) {
  const cache = new Map()
  const paths = []
  const mocks = {
    '@/lib/auth': { requireAdminEmail: async () => 'qa@example.test' },
    'next/cache': { revalidatePath: p => paths.push(p) },
    '@/lib/db': { db: new Proxy({}, { get() { throw new Error('Real DB access blocked by QA') } }) },
    '@/services/storage.service': { storageService: {} },
    ...overrides,
  }
  function load(file) {
    file = path.resolve(root, file)
    if (cache.has(file)) return cache.get(file)
    const exports = {}; cache.set(file, exports)
    const output = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
      fileName: file, compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
    }).outputText
    vm.runInNewContext(output, {
      exports, Error, Date, Buffer, FormData, File, Blob, console: { error() {} },
      require: name => {
        if (Object.hasOwn(mocks, name)) return mocks[name]
        if (name.startsWith('@/')) return load('src/' + name.slice(2) + '.ts')
        if (name.startsWith('.')) return load(path.resolve(path.dirname(file), name + '.ts'))
        if (!['zod', 'xlsx', 'react/jsx-runtime', 'lucide-react', 'node:crypto'].includes(name)) throw new Error('Unmocked dependency: ' + name)
        return require(name)
      },
    }, { filename: file })
    return exports
  }
  return { load, paths }
}
function form(values) { const f = new FormData(); for (const [k,v] of Object.entries(values)) f.set(k,v); return f }
function excel(rows, values) {
  const wb = xlsx.utils.book_new()
  xlsx.utils.book_append_sheet(wb, xlsx.utils.json_to_sheet(rows), 'QA')
  const f = form(values)
  f.set('file', new Blob([xlsx.write(wb, { type:'buffer', bookType:'xlsx' })]), 'qa.xlsx')
  f.set('students', JSON.stringify([{ id:'qa-1', nisn:'0000000001' }, { id:'qa-2', nisn:'0000000002' }]))
  return f
}
const features = ['students','classes','teachers','subjects','announcements','achievements','grades','attendance','school-profile']
for (const feature of features) {
  test(`authorization: all ${feature} mutation actions reject an unauthenticated caller`, async () => {
    const h = harness({ '@/lib/auth': { requireAdminEmail: async () => { throw new Error('Unauthorized') } } })
    const actions = h.load(`src/features/${feature}/actions.ts`)
    for (const [name, fn] of Object.entries(actions)) {
      if (name === 'getStudentByNISNAction') continue
      const result = await fn(new FormData(), new FormData())
      assert.equal(result.error, 'Unauthorized', name)
    }
    assert.equal(h.paths.length, 0)
  })
}
for (const [feature, entity, input] of [
  ['students','Student',{ nisn:'0000000001', name:'QA Siswa', classId:'qa-class' }],
  ['classes','Class',{ name:'QA Kelas', homeroomId:'' }],
  ['teachers','Teacher',{ name:'QA Guru', position:'Guru', role:'TEACHER' }],
  ['subjects','Subject',{ name:'QA Matematika' }],
]) {
  test(`CRUD: ${feature} create, update, delete and missing required fields`, async () => {
    const calls=[]; const singular=entity[0].toLowerCase()+entity.slice(1)
    const queries={findById:async()=>({id:'qa-1'}),findByNisn:async()=>null,
      create:async data=>{calls.push(['create',data]); return data},update:async(id,data)=>{calls.push(['update',id,data]);return data},delete:async id=>{calls.push(['delete',id]);return {id}}}
    // Exercise actual services/schemas with an in-memory Prisma boundary.
    const dbModel={findUnique:async args=>args.where.nisn?null:{id:'qa-1'},create:async args=>queries.create(args.data),update:async args=>queries.update(args.where.id,args.data),delete:async args=>queries.delete(args.where.id)}
    const real=harness({'@/lib/db':{db:{[feature==='teachers'?'profile':singular]:dbModel}}})
    const api=real.load(`src/features/${feature}/actions.ts`)
    assert.equal((await api[`create${entity}Action`](form(input))).success,true)
    assert.equal((await api[`update${entity}Action`]('qa-1',form(input))).success,true)
    assert.equal((await api[`delete${entity}Action`]('qa-1')).success,true)
    assert.ok((await api[`create${entity}Action`](new FormData())).error)
    assert.equal(calls.length,3)
  })
}
function uploadHarness(feature) {
  const saved=[]
  const h=harness({'@/lib/db':{db:{ $transaction:async values=>values, [feature==='grades'?'grade':'attendance']:{upsert:arg=>{saved.push(arg);return arg}} }}})
  return {api:h.load(`src/features/${feature}/actions.ts`),saved}
}
test('grades: valid XLSX computes average 85 and preserves textual leading-zero NISN',async()=>{
  const {api,saved}=uploadHarness('grades')
  assert.equal((await api.uploadGradesAction(excel([{NISN:'0000000001','UH 1':80,UAS:90}],{subjectId:'qa-subject',semester:'Ganjil 2026/2027'}))).success,true)
  assert.equal(saved[0].create.score,85)
  assert.equal(saved[0].create.studentId,'qa-1')
})
test('attendance: valid XLSX saves the selected month',async()=>{
  const {api,saved}=uploadHarness('attendance')
  assert.equal((await api.uploadAttendanceAction(excel([{NISN:'0000000001',Hadir:20,Sakit:1,Izin:1,Alpha:0}],{monthYear:'Oktober 2026'}))).success,true)
  assert.equal(saved[0].create.hadir,20)
  assert.equal(saved[0].create.monthYear,'Oktober 2026')
})
test('BUG: empty grade components should not overwrite an existing score with zero',async()=>{
  const {api,saved}=uploadHarness('grades')
  const result=await api.uploadGradesAction(excel([{NISN:'0000000001',Nama:'QA'}],{subjectId:'qa-subject',semester:'Ganjil 2026/2027'}))
  assert.ok(result.error && saved.length===0,`Observed: ${JSON.stringify({result,saved})}`)
})
test('BUG: mixed valid/invalid grade rows must report rejected rows',async()=>{
  const {api,saved}=uploadHarness('grades')
  const result=await api.uploadGradesAction(excel([{NISN:'0000000001','UH 1':80},{NISN:'0000000002','UH 1':150}],{subjectId:'qa-subject',semester:'Ganjil 2026/2027'}))
  assert.ok(result.error || result.rejectedRows,`Observed: ${JSON.stringify(result)}; saved ${saved.length}/2`)
})
test('BUG: attendance exceeding days in the month should be rejected',async()=>{
  const {api,saved}=uploadHarness('attendance')
  const result=await api.uploadAttendanceAction(excel([{NISN:'0000000001',Hadir:999,Sakit:0,Izin:0,Alpha:0}],{monthYear:'Oktober 2026'}))
  assert.ok(result.error && saved.length===0,`Observed: ${JSON.stringify(result)}; hadir=${saved[0]?.create.hadir}`)
})
test('BUG: attendance fractions should be rejected before reaching integer DB columns',async()=>{
  const {api,saved}=uploadHarness('attendance')
  const result=await api.uploadAttendanceAction(excel([{NISN:'0000000001',Hadir:1.5}],{monthYear:'Oktober 2026'}))
  assert.ok(result.error && saved.length===0,`Observed: ${JSON.stringify(result)}; hadir=${saved[0]?.create.hadir}`)
})
test('BUG: student NISN must contain ten digits, not arbitrary letters',()=>{
  const {studentSchema}=harness().load('src/features/students/schemas.ts')
  assert.equal(studentSchema.safeParse({nisn:'abc',name:'QA',classId:'qa-class'}).success,false)
})
test('BUG: invalid birth dates must fail schema validation',()=>{
  const {studentSchema}=harness().load('src/features/students/schemas.ts')
  assert.equal(studentSchema.safeParse({nisn:'0000000001',name:'QA',classId:'qa-class',birthDate:'not-a-date'}).success,false)
})
test('BUG: failed replacement upload must retain the old ijazah',async()=>{
  const events=[]
  const h=harness({'@/lib/db':{db:{student:{findUnique:async()=>({id:'qa-1',ijazahUrl:'https://example.test/old.pdf'})}}},
    '@/services/storage.service':{storageService:{deleteDocument:async()=>events.push('old-deleted'),uploadDocument:async()=>{throw new Error('QA upload failure')}}}})
  const f=new FormData();f.set('file',new Blob(['QA'],{type:'application/pdf'}),'qa.pdf')
  assert.ok((await h.load('src/features/students/actions.ts').uploadIjazahAction('qa-1',f)).error)
  assert.equal(events.includes('old-deleted'),false)
})
for (const [feature,entity,input] of [
  ['announcements','Announcement',{title:'QA Pengumuman',content:'Konten dummy',status:'DRAFT'}],
  ['achievements','Achievement',{studentId:'qa-1',title:'QA Prestasi',level:'Sekolah',eventName:'QA Lomba',date:'2026-10-15'}],
]) {
  test(`CMS: ${feature} create, update, delete with synthetic data`,async()=>{
    const calls=[];const model=entity[0].toLowerCase()+entity.slice(1)
    const h=harness({'@/lib/db':{db:{[model]:{
      findUnique:async()=>({id:'qa-1'}),create:async arg=>calls.push(['create',arg]),update:async arg=>calls.push(['update',arg]),delete:async arg=>calls.push(['delete',arg]),
    }}}})
    const api=h.load(`src/features/${feature}/actions.ts`)
    assert.equal((await api[`create${entity}Action`](form(input))).success,true)
    assert.equal((await api[`update${entity}Action`]('qa-1',form(input))).success,true)
    assert.equal((await api[`delete${entity}Action`]('qa-1')).success,true)
    assert.equal(calls.length,3)
    if(feature==='announcements') assert.equal(calls[0][1].data.authorId,'qa@example.test')
  })
}
test('CMS: school profile update and invalid email',async()=>{
  const saved=[];const tx={schoolProfile:{findFirst:async()=>({id:'qa-profile'}),update:async arg=>saved.push(arg)}}
  const h=harness({'@/lib/db':{db:{$transaction:async callback=>callback(tx)}}})
  const api=h.load('src/features/school-profile/actions.ts')
  assert.equal((await api.updateSchoolProfileAction(form({description:'QA Sekolah',contactEmail:'qa@example.test'}))).success,true)
  assert.ok((await api.updateSchoolProfileAction(form({description:'QA Sekolah',contactEmail:'invalid'}))).error)
  assert.equal(saved.length,1)
})

test('student notes: save, clear, validate and refresh both public identifiers', async () => {
  const writes = []
  const h = harness({ '@/lib/db': { db: { student: { update: async args => {
    writes.push(args)
    return { nisn: '0000000001', nipd: '1234' }
  } } } } })
  const { updateStudentNoteAction } = h.load('src/features/students/actions.ts')
  assert.equal((await updateStudentNoteAction('qa-1', form({ note: '  Belajar rutin.\nTetap semangat!  ' }))).success, true)
  assert.equal(writes[0].where.id, 'qa-1')
  assert.equal(writes[0].data.note, 'Belajar rutin.\nTetap semangat!')
  assert.deepEqual(Object.keys(writes[0].data), ['note'])
  assert(h.paths.includes('/data-siswa/0000000001'))
  assert(h.paths.includes('/data-siswa/1234'))
  assert(h.paths.includes('/admin/data-siswa/qa-1/catatan'))
  assert.equal((await updateStudentNoteAction('qa-1', form({ note: '   ' }))).success, true)
  assert.equal(writes[1].data.note, null)
  assert((await updateStudentNoteAction('qa-1', form({ note: 'x'.repeat(5001) }))).error)
  assert((await updateStudentNoteAction('qa-1', new FormData())).error)
  assert.equal(writes.length, 2)
})

test('student notes: failed save reports error without invalidating pages', async () => {
  const h = harness({ '@/lib/db': { db: { student: { update: async () => { throw new Error('Missing student') } } } } })
  const result = await h.load('src/features/students/actions.ts').updateStudentNoteAction('missing', form({ note: 'Catatan' }))
  assert(result.error)
  assert.equal(h.paths.length, 0)
})

test('announcements: save draft, edit draft, publish directly and remove published content', async () => {
  let record = null
  const h = harness({ '@/lib/db': { db: { announcement: {
    findUnique: async () => record,
    create: async ({ data }) => { record = { id: 'qa-ann', ...data }; return record },
    update: async ({ data }) => { record = { ...record, ...data }; return record },
    delete: async () => { record = null },
  } } } })
  const api = h.load('src/features/announcements/actions.ts')
  assert.equal((await api.createAnnouncementAction(form({ title: 'Draft', content: 'Isi' }))).success, true)
  assert.equal(record.status, 'DRAFT')
  assert.equal((await api.updateAnnouncementAction('qa-ann', form({ title: 'Revisi', content: 'Isi baru', status: 'DRAFT' }))).success, true)
  assert.equal(record.title, 'Revisi')
  assert.equal(record.status, 'DRAFT')
  assert.equal((await api.updateAnnouncementAction('qa-ann', form({ title: 'Revisi', content: 'Isi baru', status: 'PUBLISHED' }))).success, true)
  assert.equal(record.status, 'PUBLISHED')
  assert.equal((await api.deleteAnnouncementAction('qa-ann')).success, true)
  assert.equal(record, null)
  assert(h.paths.includes('/informasi/qa-ann'))
  assert(h.paths.includes('/informasi'))
  assert.equal((await api.createAnnouncementAction(form({ title: 'Langsung unggah', content: 'Isi', status: 'PUBLISHED' }))).success, true)
  assert.equal(record.status, 'PUBLISHED')
  assert((await api.createAnnouncementAction(form({ title: 'Invalid', content: 'Isi', status: 'INVALID' }))).error)
})

test('announcements: published deletion succeeds when thumbnail cleanup fails', async () => {
  let deleted = false
  const h = harness({
    '@/lib/db': { db: { announcement: {
      findUnique: async () => ({ id: 'qa-ann', status: 'PUBLISHED', thumbnail: 'https://example.test/image.png' }),
      delete: async () => { deleted = true },
    } } },
    '@/services/storage.service': { storageService: { deleteImage: async () => { throw new Error('Storage unavailable') } } },
  })
  assert.equal((await h.load('src/features/announcements/actions.ts').deleteAnnouncementAction('qa-ann')).success, true)
  assert.equal(deleted, true)
  assert(h.paths.includes('/informasi/qa-ann'))
})
