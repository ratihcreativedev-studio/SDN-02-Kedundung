import { Prisma } from '@prisma/client'
import { randomUUID } from 'node:crypto'
import { db } from '@/lib/db'

export const gradeQueries = {
  findLedgerByStudent: async (studentId: string) => {
    const [ledgers, reports] = await Promise.all([
      db.ledgerReport.findMany({
        where: { studentId },
        select: {
          id: true, semester: true, class: { select: { name: true } },
          extracurriculars: { where: { predicate: { not: null } }, select: { code: true, name: true, predicate: true } },
        },
        orderBy: { semester: 'desc' },
      }),
      db.studentReport.findMany({ where: { studentId }, include: { class: { select: { name: true } } } }),
    ])
    const semesters = new Set([...ledgers.map(r => r.semester), ...reports.map(r => r.semester)])
    return [...semesters].map(semester => {
      const ledger = ledgers.find(r => r.semester === semester)
      const grades = reports.filter(r => r.semester === semester)
      return {
        id: ledger?.id ?? grades[0].id, semester, class: grades[0]?.class ?? ledger?.class ?? null,
        subjects: grades.map(r => ({ code: r.subjectCode, name: r.subjectName, score: r.score })),
        extracurriculars: ledger?.extracurriculars ?? [],
      }
    })
  },
  findByClassSemester: (classId: string, semester: string, subjectCode = 'BI_ID') => {
    return db.studentReport.findMany({
      where: {
        semester,
        classId,
        subjectCode,
      },
      select: { studentId: true, score: true, uh: true, asts: true, asas: true, student: { select: { id: true, nisn: true, name: true } } },
    })
  },

  findByStudent: (studentId: string) => {
    return db.studentReport.findMany({
      where: { studentId },
      orderBy: { semester: 'desc' },
    })
  },

  updateOne: (classId: string, semester: string, studentId: string, subjectCode: string, values: { uh: number | null; asts: number | null; asas: number | null; score: number }) =>
    db.studentReport.updateMany({ where: { classId, semester, studentId, subjectCode }, data: values }),

  deleteByClassSemester: (classId: string, semester: string, subjectCode: string) =>
    db.studentReport.deleteMany({ where: { classId, semester, subjectCode } }),

  upsertMany: async (records: { subjectCode: string; subjectName: string; classId: string; studentId: string; semester: string; score: number; uh: number; asts: number; asas: number }[]) => {
    if (records.length === 0) return 0
    const values = records.map(record => Prisma.sql`(
      ${randomUUID()}, ${record.classId}, ${record.studentId}, ${record.semester}, ${record.subjectCode}, ${record.subjectName},
      ${record.uh}, ${record.asts}, ${record.asas}, ${record.score}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    )`)
    // One atomic bulk statement avoids a database round trip for each student.
    return db.$executeRaw(Prisma.sql`
      INSERT INTO "student_reports" ("id", "classId", "studentId", "semester", "subjectCode", "subjectName", "uh", "asts", "asas", "score", "createdAt", "updatedAt")
      VALUES ${Prisma.join(values)}
      ON CONFLICT ("studentId", "subjectCode", "semester") DO UPDATE SET
        "subjectName" = EXCLUDED."subjectName", "classId" = EXCLUDED."classId", "uh" = EXCLUDED."uh", "asts" = EXCLUDED."asts", "asas" = EXCLUDED."asas",
        "score" = EXCLUDED."score", "updatedAt" = CURRENT_TIMESTAMP
    `)
  },
}
