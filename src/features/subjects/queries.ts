import { db } from '@/lib/db'
import type { SubjectInput } from './schemas'

export const subjectQueries = {
  findOptions: () => db.subject.findMany({
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  }),
  findAll: () => {
    return db.subject.findMany({
      include: {
        classes: {
          include: { class: true },
          orderBy: { class: { name: 'asc' } },
        },
      },
      orderBy: { name: 'asc' },
    })
  },
  findById: (id: string) => {
    return db.subject.findUnique({
      where: { id },
      include: { classes: true },
    })
  },
  create: (data: SubjectInput) => {
    return db.subject.create({ data })
  },
  update: (id: string, data: SubjectInput) => {
    return db.subject.update({
      where: { id },
      data,
    })
  },
  delete: (id: string) => {
    return db.subject.delete({
      where: { id },
    })
  },
  updateClassAllocations: async (subjectId: string, classIds: string[]) => {
    return db.$transaction([
      db.classSubject.deleteMany({ where: { subjectId } }),
      ...classIds.map((classId) =>
        db.classSubject.create({
          data: { subjectId, classId },
        })
      ),
    ])
  },
}
