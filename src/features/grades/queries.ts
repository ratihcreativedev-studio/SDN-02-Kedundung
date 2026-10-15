import { db } from '@/lib/db'

export const gradeQueries = {
  findByClassSubjectSemester: (classId: string, subjectId: string, semester: string) => {
    return db.grade.findMany({
      where: {
        subjectId,
        semester,
        student: { classId },
      },
      select: { studentId: true, score: true, uh1: true, uh2: true, uh3: true, uas: true },
    })
  },

  findByStudent: (studentId: string) => {
    return db.grade.findMany({
      where: { studentId },
      include: { subject: true },
    })
  },

  upsertMany: async (records: { studentId: string; subjectId: string; semester: string; score: number; uh1?: number; uh2?: number; uh3?: number; uas?: number }[]) => {
    return db.$transaction(
      records.map((record) =>
        db.grade.upsert({
          where: {
            studentId_subjectId_semester: {
              studentId: record.studentId,
              subjectId: record.subjectId,
              semester: record.semester,
            },
          },
          update: { 
            score: record.score,
            uh1: record.uh1 ?? null,
            uh2: record.uh2 ?? null,
            uh3: record.uh3 ?? null,
            uas: record.uas ?? null,
          },
          create: record,
        })
      )
    )
  },
}
