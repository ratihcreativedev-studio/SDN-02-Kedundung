import { db } from '@/lib/db'
export const catalogQueries = {
  active: () => db.academicItem.findMany({ where: { deletedAt: null }, select: { id: true, category: true, code: true, name: true }, orderBy: [{ createdAt: 'asc' }, { id: 'asc' }] }),
}
