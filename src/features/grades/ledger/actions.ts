'use server'

import { revalidatePath } from 'next/cache'
import { requireAdminEmail } from '@/lib/auth'
import { db } from '@/lib/db'
import { gradeScopeSchema } from '../schemas'
import { parseExtracurricularWorkbook } from './extracurricular-excel'
import { ledgerEditScopeSchema, ledgerScopeSchema, ledgerValuesSchema } from './schemas'
import { catalogQueries } from '@/features/academic-catalog/queries'
import { randomUUID } from 'node:crypto'

function refreshStudentDetails() {
  revalidatePath('/admin/data-siswa', 'layout')
  revalidatePath('/data-siswa', 'layout')
}

export async function uploadLedgerAction(data: FormData) {
  try {
    await requireAdminEmail()
    const scope = gradeScopeSchema.safeParse(Object.fromEntries(data))
    const category = data.get('category')
    if (category !== 'ekstrakurikuler') return { error: 'Upload nilai rapor melalui menu Nilai Mata Pelajaran.' }
    const file = data.get('file')
    if (!scope.success || !(file instanceof File) || !file.size) return { error: 'File Excel, kelas, semester, dan kategori wajib diisi.' }
    if (file.size > 10 * 1024 * 1024) return { error: 'Ukuran file maksimal 10 MB.' }
    const catalog = await catalogQueries.active()
    const parsed = parseExtracurricularWorkbook(Buffer.from(await file.arrayBuffer()), catalog)
    const { classId, semester } = scope.data
    const roster = await db.student.findMany({ where: { classId }, select: { id: true, nisn: true } })
    const ids = new Map(roster.map(s => [s.nisn, s.id]))
    if (parsed.rows.some(row => !ids.has(row.nisn))) return { error: 'Ada NISN yang tidak terdaftar di kelas terpilih. Belum ada nilai yang disimpan.' }
    const records = parsed.rows.map(row => ({
      id: randomUUID(), studentId: ids.get(row.nisn)!,
      extracurriculars: row.extracurriculars.map(item => ({ ...item, id: randomUUID() })),
    }))
    // One atomic statement avoids per-student nested writes exhausting the transaction timeout.
    // Only activities present in the workbook are updated, including explicit blank predicates.
    await db.$executeRaw`
      WITH input AS (
        SELECT * FROM jsonb_to_recordset(${JSON.stringify(records)}::jsonb)
          AS row(id text, "studentId" text, extracurriculars jsonb)
      ), reports AS (
        INSERT INTO ledger_reports (id, "classId", "studentId", semester, "createdAt", "updatedAt")
        SELECT id, ${classId}, "studentId", ${semester}, NOW(), NOW() FROM input
        ON CONFLICT ("studentId", semester) DO UPDATE
          SET "classId" = EXCLUDED."classId", "updatedAt" = EXCLUDED."updatedAt"
        RETURNING id, "studentId"
      )
      INSERT INTO ledger_extracurricular_grades (id, "reportId", code, name, predicate)
      SELECT activity.id, reports.id, activity.code, activity.name, activity.predicate
      FROM input JOIN reports ON reports."studentId" = input."studentId"
      CROSS JOIN LATERAL jsonb_to_recordset(input.extracurriculars)
        AS activity(id text, code text, name text, predicate text)
      ON CONFLICT ("reportId", code) DO UPDATE
        SET name = EXCLUDED.name, predicate = EXCLUDED.predicate
    `
    revalidatePath('/admin/nilai/mata-pelajaran')
    revalidatePath('/admin/nilai/ekstrakurikuler')
    refreshStudentDetails()
    return { success: true, count: parsed.rows.length }
  } catch (error) {
    console.error('Ledger upload failed', error)
    return { error: error instanceof Error && !('code' in error) ? error.message : 'Nilai gagal disimpan. Silakan coba lagi.' }
  }
}

export async function editLedgerAction(data: FormData) {
  try {
    await requireAdminEmail()
    const input = Object.fromEntries(data)
    const scope = ledgerEditScopeSchema.safeParse(input)
    if (!scope.success) return { error: 'Siswa, kelas, semester, dan kategori wajib valid.' }
    const { classId, semester, studentId, category } = scope.data
    const subjects = category === 'mata-pelajaran'
    const [catalog, report] = await Promise.all([
      catalogQueries.active(),
      db.ledgerReport.findFirst({ where: { studentId, classId, semester }, select: { subjects: true, extracurriculars: true } }),
    ])
    if (!report || !(subjects ? report.subjects.length : report.extracurriculars.length)) return { error: 'Rekap siswa tidak ditemukan. Muat ulang halaman.' }
    const entries = Array.from(new Map([
      ...(subjects ? report.subjects : report.extracurriculars).map(item => [item.code, { code: item.code, name: item.name }] as const),
      ...catalog.filter(item => item.category === category).map(item => [item.code, { code: item.code, name: item.name }] as const),
    ]).values())
    const values = ledgerValuesSchema(category, entries.map(item => item.code)).safeParse(input)
    if (!values.success) return { error: subjects ? 'Nilai harus berupa angka 0–100 atau kosong.' : 'Predikat harus SB, B, C, K, atau kosong.' }
    // Scope against the saved class, so historical reports remain editable after promotion.
    await db.ledgerReport.update({
      where: {
        studentId_semester: { studentId, semester }, classId,
        ...(subjects ? { subjects: { some: {} } } : { extracurriculars: { some: {} } }),
      },
      data: subjects
        ? { subjects: { deleteMany: {}, create: entries.map(({ code, name }) => ({ code, name, score: values.data[code] as number | null })) } }
        : { extracurriculars: { deleteMany: {}, create: entries.map(({ code, name }) => ({ code, name, predicate: values.data[code] as string | null })) } },
    })
    revalidatePath(`/admin/nilai/${category}`)
    refreshStudentDetails()
    return { success: true }
  } catch {
    return { error: 'Nilai gagal diperbarui. Pastikan rekap masih tersedia pada kelas dan semester ini, lalu coba lagi.' }
  }
}

export async function deleteLedgerRecapAction(data: FormData) {
  try {
    await requireAdminEmail()
    const scope = ledgerScopeSchema.safeParse(Object.fromEntries(data))
    if (!scope.success) return { error: 'Kelas, semester, dan kategori wajib valid.' }
    const { classId, semester, category } = scope.data
    const where = { report: { classId, semester } }
    // Retain the shared report, attendance and the other category.
    if (category === 'mata-pelajaran') await db.ledgerSubjectGrade.deleteMany({ where })
    else await db.ledgerExtracurricularGrade.deleteMany({ where })
    revalidatePath(`/admin/nilai/${category}`)
    refreshStudentDetails()
    return { success: true }
  } catch {
    return { error: 'Rekap nilai gagal dihapus. Silakan coba lagi.' }
  }
}
