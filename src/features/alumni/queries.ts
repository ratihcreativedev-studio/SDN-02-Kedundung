import type { Prisma } from '@prisma/client'
import { db } from '@/lib/db'
import { requireAdminEmail } from '@/lib/auth'

export async function getAlumni(params: { q?: string; year?: string; page?: string }) {
  await requireAdminEmail()

  const search = params.q?.trim() || ''
  const year = /^\d{4}$/.test(params.year || '') && Number(params.year) >= 1000 && Number(params.year) <= 9998
    ? params.year!
    : ''
  const requestedPage = Number(params.page)
  const limit = 10
  const where: Prisma.StudentWhereInput = {
    status: 'graduate',
    ...(search ? {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { nisn: { contains: search, mode: 'insensitive' } },
      ],
    } : {}),
    ...(year ? {
      graduationDate: {
        gte: new Date(`${year}-01-01T00:00:00.000Z`),
        lt: new Date(`${Number(year) + 1}-01-01T00:00:00.000Z`),
      },
    } : {}),
  }

  const [total, graduationDates] = await Promise.all([
    db.student.count({ where }),
    db.student.findMany({
      where: { status: 'graduate', graduationDate: { not: null } },
      select: { graduationDate: true },
      distinct: ['graduationDate'],
    }),
  ])
  const totalPages = Math.max(1, Math.ceil(total / limit))
  const page = Number.isSafeInteger(requestedPage) && requestedPage > 0
    ? Math.min(requestedPage, totalPages)
    : 1
  const students = await db.student.findMany({
    where,
    select: { id: true, name: true, nisn: true, graduationDate: true, class: { select: { name: true } } },
    orderBy: [{ graduationDate: { sort: 'desc', nulls: 'last' } }, { name: 'asc' }, { id: 'asc' }],
    skip: (page - 1) * limit,
    take: limit,
  })
  const years = [...new Set(graduationDates.flatMap(({ graduationDate }) =>
    graduationDate ? [String(graduationDate.getUTCFullYear())] : []
  ))].sort().reverse()

  return { students, total, totalPages, page, years, search, year }
}
