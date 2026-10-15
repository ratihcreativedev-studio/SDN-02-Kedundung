import { db } from '@/lib/db'
import type { ClassInput } from './schemas'

export const classQueries = {
  findOptions: () => db.class.findMany({
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  }),
  findAll: () => {
    return db.class.findMany({
      include: {
        homeroom: true,
        _count: {
          select: { students: true },
        },
        subjects: {
          include: { subject: true },
          orderBy: { subject: { name: 'asc' } },
        },
      },
      orderBy: { name: 'asc' },
    })
  },
  findById: (id: string) => {
    return db.class.findUnique({
      where: { id },
      include: { homeroom: true, subjects: true },
    })
  },
  create: (data: ClassInput) => {
    return db.class.create({
      data: {
        name: data.name,
        homeroomId: data.homeroomId || null,
      },
    })
  },
  update: (id: string, data: ClassInput) => {
    return db.class.update({
      where: { id },
      data: {
        name: data.name,
        homeroomId: data.homeroomId || null,
      },
    })
  },
  delete: (id: string) => {
    return db.class.delete({
      where: { id },
    })
  },
}
