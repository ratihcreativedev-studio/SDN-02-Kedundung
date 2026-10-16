import { db } from '@/lib/db'
import type { Prisma } from '@prisma/client'
import type { StudentInput } from './schemas'

export const studentQueries = {
  findAcademicRoster: (classId: string) => db.student.findMany({
    where: { classId },
    select: { id: true, nisn: true, name: true },
    orderBy: { name: 'asc' },
  }),
  findAll: (params?: { classId?: string; search?: string; sortBy?: string; sortOrder?: 'asc' | 'desc'; page?: number; limit?: number }) => {
    const { classId, search, sortBy = 'name', sortOrder = 'asc', page = 1, limit = 10 } = params || {}
    const skip = (page - 1) * limit

    const where: Prisma.StudentWhereInput = {}
    if (classId) where.classId = classId
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { nisn: { contains: search, mode: 'insensitive' } },
      ]
    }

    const safeSort = ['name', 'nisn', 'createdAt', 'status'].includes(sortBy) ? sortBy : 'name'
    const direction = sortOrder === 'desc' ? 'desc' : 'asc'
    let orderBy: Prisma.StudentOrderByWithRelationInput = { [safeSort]: direction }
    if (sortBy === 'class') {
      orderBy = { class: { name: direction } }
    }

    return db.student.findMany({
      where,
      include: { class: true },
      orderBy,
      take: limit,
      skip,
    })
  },
  countAll: (params?: { classId?: string; search?: string }) => {
    const { classId, search } = params || {}
    const where: Prisma.StudentWhereInput = {}
    if (classId) where.classId = classId
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { nisn: { contains: search, mode: 'insensitive' } },
      ]
    }
    return db.student.count({ where })
  },
  findById: (id: string) => {
    return db.student.findUnique({
      where: { id },
      include: { class: true },
    })
  },
  findByNisn: (nisn: string) => {
    return db.student.findUnique({
      where: { nisn },
      include: { class: true },
    })
  },
  findByIdentifier: (identifier: string) => {
    return db.student.findFirst({
      where: {
        OR: [
          { nisn: identifier },
          { nipd: identifier },
        ],
      },
      include: { class: true, achievements: { orderBy: [{ date: 'desc' }, { createdAt: 'desc' }] } },
    })
  },
  create: (data: StudentInput) => {
    return db.student.create({ data })
  },
  update: (id: string, data: Prisma.StudentUncheckedUpdateInput) => {
    return db.student.update({
      where: { id },
      data,
    })
  },
  delete: (id: string) => {
    return db.student.delete({
      where: { id },
    })
  },
  updateNote: (id: string, note: string | null) => db.student.update({
    where: { id },
    data: { note },
    select: { nisn: true, nipd: true },
  }),
}
