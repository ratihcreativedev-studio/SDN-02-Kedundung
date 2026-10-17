import type { Prisma } from '@prisma/client'
import { db } from '@/lib/db'
import { classQueries } from '@/features/classes/queries'
import { paginationWindow } from '@/lib/pagination'

type Category = 'grades' | 'attendance' | 'mata-pelajaran' | 'ekstrakurikuler'
export async function getAssessmentPageData(params: { classId?: string; semester?: string; page?: string; search?: string; subjectCode?: string }, category: Category) {
  const semester = params.semester ?? (category === 'grades' || category === 'attendance' || category === 'mata-pelajaran' ? 'Ganjil 2025/2026' : 'Genap 2025/2026')
  const classes = await classQueries.findOptions()
  const classId = params.classId ?? classes[0]?.id ?? ''
  const search = params.search?.trim() ?? ''
  const scope = { classId, semester }
  const gradeScope = { ...scope, subjectCode: params.subjectCode ?? 'BI_ID' }
  const ledgerScope = { ...scope, ...(category === 'mata-pelajaran' ? { subjects: { some: {} } } : { extracurriculars: { some: {} } }) }
  const history: Prisma.StudentWhereInput = category === 'grades' ? { reports: { some: gradeScope } }
    : category === 'mata-pelajaran' ? { reports: { some: scope } }
    : category === 'attendance' ? { attendanceRecaps: { some: scope } }
    : { ledgerReports: { some: ledgerScope } }
  // Include current students and historical reports after a student changes class.
  const where: Prisma.StudentWhereInput = { OR: [{ classId }, history] }
  if (search) where.AND = [{ OR: [
    { name: { contains: search, mode: 'insensitive' } },
    { nisn: { contains: search, mode: 'insensitive' } },
  ] }]
  const [total, recordCount] = classId ? await Promise.all([
    db.student.count({ where }),
    category === 'grades' ? db.studentReport.count({ where: gradeScope })
      : category === 'attendance' ? db.attendanceRecap.count({ where: scope })
      : category === 'mata-pelajaran' ? db.student.count({ where: { reports: { some: scope } } })
      : db.ledgerReport.count({ where: ledgerScope }),
  ]) : [0, 0]
  const pagination = paginationWindow(params.page, total)
  const students = classId ? await db.student.findMany({
    where, select: { id: true, nisn: true, name: true },
    orderBy: [{ name: 'asc' }, { id: 'asc' }], skip: pagination.skip, take: pagination.take,
  }) : []
  const pageScope = { ...scope, studentId: { in: students.map(student => student.id) } }
  const [grades, attendances, storedLedgers] = await Promise.all([
    category === 'grades' && students.length ? db.studentReport.findMany({ where: { ...pageScope, subjectCode: gradeScope.subjectCode }, select: { studentId: true, uh: true, asts: true, asas: true, score: true } }) : [],
    category === 'attendance' && students.length ? db.attendanceRecap.findMany({ where: pageScope, select: { studentId: true, hadir: true, sakit: true, izin: true, alpha: true } }) : [],
    category === 'ekstrakurikuler' && students.length ? db.ledgerReport.findMany({ where: pageScope, select: {
      studentId: true,
      subjects: { select: { code: true, name: true, score: true } },
      extracurriculars: category === 'ekstrakurikuler' ? { select: { code: true, name: true, predicate: true } } : false,
    } }) : [],
  ])
  const ledgers: { studentId: string; subjects: { code: string; name: string; score: number | null }[]; extracurriculars: { code: string; name: string; predicate: string | null }[] }[] = storedLedgers
  if (category === 'mata-pelajaran' && students.length) {
    const reports = await db.studentReport.findMany({ where: pageScope })
    for (const student of students) {
      const subjects = reports.filter(r => r.studentId === student.id).map(r => ({ code: r.subjectCode, name: r.subjectName, score: r.score }))
      if (subjects.length) ledgers.push({ studentId: student.id, subjects, extracurriculars: [] })
    }
  }
  return { classes, classId, semester, students, grades, attendances, ledgers, recordCount, pagination, search }
}
