import { StudentGradeTable } from './StudentGradeTable'
import { ledgerSubjects, ledgerActivities } from '../ledger/format'

type Report = { id: string; semester: string; uh: number | null; asts: number | null; asas: number | null; score: number }
type Ledger = {
  id: string
  semester: string
  class: { name: string } | null
  subjects: { code: string; name: string; score: number | null }[]
  extracurriculars: { code: string; name: string; predicate: string | null }[]
}
const periodOrder = (semester: string) => Number(semester.match(/20\d{2}/)?.[0] ?? 0) * 2 + (semester.startsWith('Genap') ? 1 : 0)
const subjectOrder = new Map<string, number>(ledgerSubjects.map(([code], index) => [code, index]))
const activityOrder = new Map<string, number>(ledgerActivities.map((name, index) => [name.toUpperCase().replaceAll(' ', '_'), index]))

export function StudentAllGrades({ grades, ledgers }: { grades: Report[]; ledgers: Ledger[] }) {
  const available = ledgers.map(report => ({
    ...report,
    subjects: report.subjects.filter(item => item.score !== null).sort((a, b) => (subjectOrder.get(a.code) ?? 99) - (subjectOrder.get(b.code) ?? 99)),
    extracurriculars: report.extracurriculars.filter(item => item.predicate?.trim()).sort((a, b) => (activityOrder.get(a.code) ?? 99) - (activityOrder.get(b.code) ?? 99)),
  })).filter(report => report.subjects.length || report.extracurriculars.length)
  const semesters = [...new Set([...grades.map(report => report.semester), ...available.map(report => report.semester)])]
    .sort((a, b) => periodOrder(b) - periodOrder(a))
  if (!semesters.length) return <p className="py-6 text-center text-sm text-text-muted">Belum ada data nilai.</p>
  return <div className="space-y-6">
    {semesters.map(semester => {
      const reports = grades.filter(report => report.semester === semester)
      const ledger = available.find(report => report.semester === semester)
      return <section key={semester} className="space-y-4">
        <div className="rounded-xl bg-surface-alt px-4 py-3">
          <h4 className="font-bold text-primary">{semester}</h4>
          {ledger?.class && <p className="mt-1 text-xs text-text-secondary">{ledger.class.name}</p>}
        </div>
        {reports.length > 0 && <div className="space-y-2">
          <h5 className="text-sm font-semibold text-primary">Nilai UH, ASTS, ASAS dan Rapor</h5>
          <StudentGradeTable grades={reports} />
        </div>}
        {!!ledger?.subjects.length && <div className="space-y-2">
          <h5 className="text-sm font-semibold text-primary">Nilai Mata Pelajaran</h5>
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-alt/70 text-text-secondary"><tr><th scope="col" className="px-4 py-3">Mata Pelajaran</th><th scope="col" className="px-4 py-3 text-center">Nilai</th></tr></thead>
              <tbody className="divide-y divide-border">{ledger.subjects.map(item => <tr key={item.code} className="hover:bg-surface-alt/40"><td className="px-4 py-3">{item.name}</td><td className="px-4 py-3 text-center font-semibold text-primary">{item.score}</td></tr>)}</tbody>
            </table>
          </div>
        </div>}
        {!!ledger?.extracurriculars.length && <div className="space-y-2">
          <h5 className="text-sm font-semibold text-primary">Ekstrakurikuler yang Diikuti</h5>
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-alt/70 text-text-secondary"><tr><th scope="col" className="px-4 py-3">Kegiatan</th><th scope="col" className="px-4 py-3 text-center">Predikat</th></tr></thead>
              <tbody className="divide-y divide-border">{ledger.extracurriculars.map(item => <tr key={item.code} className="hover:bg-surface-alt/40"><td className="px-4 py-3">{item.name}</td><td className="px-4 py-3 text-center font-semibold text-primary">{item.predicate}</td></tr>)}</tbody>
            </table>
          </div>
        </div>}
      </section>
    })}
  </div>
}
