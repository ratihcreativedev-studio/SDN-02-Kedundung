import { db } from '@/lib/db'
import type { AchievementInput } from './schemas'

function toData(input: AchievementInput) {
  return {
    studentId: input.studentId,
    title: input.title,
    level: input.level,
    rank: input.rank || null,
    eventName: input.eventName,
    imageUrl: input.imageUrl || null,
    date: input.date ? new Date(`${input.date}T00:00:00`) : null,
    note: input.note || null,
  }
}

export const achievementQueries = {
  findAll: () => {
    return db.achievement.findMany({
      include: { student: { include: { class: true } } },
      orderBy: [{ date: 'desc' }, { createdAt: 'desc' }, { id: 'asc' }],
    })
  },

  findPaginated: ({ skip, take }: { skip: number; take: number }) => {
    return db.achievement.findMany({
      skip,
      take,
      include: { student: { include: { class: true } } },
      orderBy: [{ date: 'desc' }, { createdAt: 'desc' }, { id: 'asc' }],
    })
  },

  countAll: () => {
    return db.achievement.count()
  },

  findById: (id: string) => {
    return db.achievement.findUnique({
      where: { id },
      include: { student: { include: { class: true } } },
    })
  },

  create: (input: AchievementInput) => {
    return db.achievement.create({ data: toData(input) })
  },

  update: (id: string, input: AchievementInput) => {
    return db.achievement.update({ where: { id }, data: toData(input) })
  },

  delete: (id: string) => {
    return db.achievement.delete({ where: { id } })
  },
}
