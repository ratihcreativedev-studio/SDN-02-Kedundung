import { db } from '@/lib/db'
import { catalogQueries } from '@/features/academic-catalog/queries'

export async function getSubjectOptions() {
  const [catalog, history] = await Promise.all([
    catalogQueries.active(),
    db.studentReport.findMany({ distinct: ['subjectCode'], select: { subjectCode: true, subjectName: true } }),
  ])
  return Array.from(new Map([
    ...history.map(s => [s.subjectCode, { code: s.subjectCode, name: s.subjectName }] as const),
    ...catalog.filter(s => s.category === 'mata-pelajaran').map(s => [s.code, { code: s.code, name: s.name }] as const),
  ]).values())
}
