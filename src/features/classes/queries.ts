import { db } from '@/lib/db'
import type { ClassInput } from './schemas'

export const classQueries = {
  findOptions: () => db.class.findMany({
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  }),
  findActiveStatistics: () => db.class.findMany({
    select: { id: true, name: true, homeroom: { select: { name: true } }, _count: { select: { students: { where: { status: 'active' } } } } },
    orderBy: { name: 'asc' },
  }),
  findAll: () => {
    return db.class.findMany({
      include: {
        homeroom: true,
        _count: {
          select: { students: true },
        },
      },
      orderBy: { name: 'asc' },
    })
  },
  findById: (id: string) => {
    return db.class.findUnique({
      where: { id },
      include: { homeroom: true },
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
