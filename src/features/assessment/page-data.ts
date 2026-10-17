import type { Prisma } from '@prisma/client'
import { db } from '@/lib/db'
import { classQueries } from '@/features/classes/queries'
import { paginationWindow } from '@/lib/pagination'

type Category = 'grades' | 'attendance' | 'mata-pelajaran' | 'ekstrakurikuler'
export async function getAssessmentPageData(params: { classId?: string; semester?: string; page?: string; search?: string }, category: Category) {
  const semester = params.semester ?? (category === 'grades' || category === 'attendance' ? 'Ganjil 2025/2026' : 'Genap 2025/2026')
  const classes = await classQueries.findOptions()
  const classId = params.classId ?? classes[0]?.id ?? ''
  const search = params.search?.trim() ?? ''
  const scope = { classId, semester }
  const ledgerScope = { ...scope, ...(category === 'mata-pelajaran' ? { subjects: { some: {} } } : { extracurriculars: { some: {} } }) }
  const history: Prisma.StudentWhereInput = category === 'grades' ? { reports: { some: scope } }
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
    category === 'grades' ? db.studentReport.count({ where: scope })
      : category === 'attendance' ? db.attendanceRecap.count({ where: scope })
      : db.ledgerReport.count({ where: ledgerScope }),
  ]) : [0, 0]
  const pagination = paginationWindow(params.page, total)
  const students = classId ? await db.student.findMany({
    where, select: { id: true, nisn: true, name: true },
    orderBy: [{ name: 'asc' }, { id: 'asc' }], skip: pagination.skip, take: pagination.take,
  }) : []
  const pageScope = { ...scope, studentId: { in: students.map(student => student.id) } }
  const [grades, attendances, ledgers] = await Promise.all([
    category === 'grades' && students.length ? db.studentReport.findMany({ where: pageScope, select: { studentId: true, uh: true, asts: true, asas: true, score: true } }) : [],
    category === 'attendance' && students.length ? db.attendanceRecap.findMany({ where: pageScope, select: { studentId: true, hadir: true, sakit: true, izin: true, alpha: true } }) : [],
    (category === 'mata-pelajaran' || category === 'ekstrakurikuler') && students.length ? db.ledgerReport.findMany({ where: pageScope, select: {
      studentId: true,
      subjects: category === 'mata-pelajaran' ? { select: { code: true, name: true, score: true } } : false,
      extracurriculars: category === 'ekstrakurikuler' ? { select: { code: true, name: true, predicate: true } } : false,
    } }) : [],
  ])
  return { classes, classId, semester, students, grades, attendances, ledgers, recordCount, pagination, search }
}
