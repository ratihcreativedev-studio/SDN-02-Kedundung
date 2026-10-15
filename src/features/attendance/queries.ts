import { db } from '@/lib/db'

export const attendanceQueries = {
  findByClassAndMonth: (classId: string, monthYear: string) => {
    return db.attendance.findMany({
      where: {
        monthYear,
        student: { classId },
      },
      select: { studentId: true, hadir: true, sakit: true, izin: true, alpha: true },
    })
  },

  findByStudent: (studentId: string) => {
    return db.attendance.findMany({
      where: { studentId },
    })
  },

  upsertMany: async (records: { studentId: string; monthYear: string; hadir: number; sakit: number; izin: number; alpha: number }[]) => {
    return db.$transaction(
      records.map((record) =>
        db.attendance.upsert({
          where: {
            studentId_monthYear: {
              studentId: record.studentId,
              monthYear: record.monthYear,
            },
          },
          update: { 
            hadir: record.hadir,
            sakit: record.sakit,
            izin: record.izin,
            alpha: record.alpha
          },
          create: record,
        })
      )
    )
  },
}
