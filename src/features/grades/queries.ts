import { Prisma } from '@prisma/client'
import { randomUUID } from 'node:crypto'
import { db } from '@/lib/db'

export const gradeQueries = {
  findByClassSemester: (classId: string, semester: string) => {
    return db.studentReport.findMany({
      where: {
        semester,
        classId,
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

  countByClassSemester: (semester: string) => db.studentReport.groupBy({
    by: ['classId'], where: { semester }, _count: { _all: true },
  }),

  updateOne: (classId: string, semester: string, studentId: string, values: { uh: number; asts: number; asas: number; score: number }) =>
    db.studentReport.updateMany({ where: { classId, semester, studentId }, data: values }),

  deleteByClassSemester: (classId: string, semester: string) =>
    db.studentReport.deleteMany({ where: { classId, semester } }),

  upsertMany: async (records: { classId: string; studentId: string; semester: string; score: number; uh: number; asts: number; asas: number }[]) => {
    if (records.length === 0) return 0
    const values = records.map(record => Prisma.sql`(
      ${randomUUID()}, ${record.classId}, ${record.studentId}, ${record.semester},
      ${record.uh}, ${record.asts}, ${record.asas}, ${record.score}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    )`)
    // One atomic bulk statement avoids a database round trip for each student.
    return db.$executeRaw(Prisma.sql`
      INSERT INTO "student_reports" ("id", "classId", "studentId", "semester", "uh", "asts", "asas", "score", "createdAt", "updatedAt")
      VALUES ${Prisma.join(values)}
      ON CONFLICT ("studentId", "semester") DO UPDATE SET
        "classId" = EXCLUDED."classId", "uh" = EXCLUDED."uh", "asts" = EXCLUDED."asts", "asas" = EXCLUDED."asas",
        "score" = EXCLUDED."score", "updatedAt" = CURRENT_TIMESTAMP
    `)
  },
}
