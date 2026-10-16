import { Prisma } from '@prisma/client'
import { randomUUID } from 'node:crypto'
import { db } from '@/lib/db'

export const attendanceQueries = {
  findByClassAndSemester: (classId: string, semester: string) => {
    return db.attendanceRecap.findMany({
      where: {
        semester,
        classId,
      },
      select: { studentId: true, alpha: true, hadir: true, sakit: true, izin: true, student: { select: { id: true, nisn: true, name: true } } },
    })
  },

  // Monthly records are still used by the existing student attendance history.
  findByStudent: (studentId: string) => db.attendance.findMany({ where: { studentId } }),

  findRecapsByStudent: (studentId: string) => db.attendanceRecap.findMany({ where: { studentId }, orderBy: { semester: 'desc' } }),

  updateOne: (classId: string, semester: string, studentId: string, values: { hadir: number; sakit: number; izin: number; alpha: number }) =>
    db.attendanceRecap.updateMany({ where: { classId, semester, studentId }, data: values }),

  deleteByClassSemester: (classId: string, semester: string) =>
    db.attendanceRecap.deleteMany({ where: { classId, semester } }),

  upsertMany: async (records: { classId: string; studentId: string; semester: string; alpha: number; hadir: number; sakit: number; izin: number }[]) => {
    if (records.length === 0) return 0
    const values = records.map(record => Prisma.sql`(
      ${randomUUID()}, ${record.classId}, ${record.studentId}, ${record.semester},
      ${record.hadir}, ${record.sakit}, ${record.izin}, ${record.alpha}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    )`)
    // One atomic bulk statement avoids a database round trip for each student.
    return db.$executeRaw(Prisma.sql`
      INSERT INTO "attendance_recaps" ("id", "classId", "studentId", "semester", "hadir", "sakit", "izin", "alpha", "createdAt", "updatedAt")
      VALUES ${Prisma.join(values)}
      ON CONFLICT ("studentId", "semester") DO UPDATE SET
        "classId" = EXCLUDED."classId", "hadir" = EXCLUDED."hadir", "sakit" = EXCLUDED."sakit", "izin" = EXCLUDED."izin",
        "alpha" = EXCLUDED."alpha", "updatedAt" = CURRENT_TIMESTAMP
    `)
  },
}
