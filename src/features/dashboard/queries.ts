import { db } from '@/lib/db'

type DashboardCounts = {
  students: number
  classes: number
  subjects: number
  achievements: number
  announcements: number
}

export async function getDashboardSummary() {
  // One round trip for all totals; no full records or relation joins are loaded.
  const [totals, announcements] = await Promise.all([
    db.$queryRaw<DashboardCounts[]>`
      SELECT
        (SELECT COUNT(*)::int FROM students WHERE status = 'active') AS students,
        (SELECT COUNT(*)::int FROM classes) AS classes,
        (SELECT COUNT(*)::int FROM subjects) AS subjects,
        (SELECT COUNT(*)::int FROM achievements) AS achievements,
        (SELECT COUNT(*)::int FROM announcements) AS announcements
    `,
    db.announcement.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { id: true, title: true, content: true, createdAt: true },
    }),
  ])

  return { counts: totals[0], announcements }
}
