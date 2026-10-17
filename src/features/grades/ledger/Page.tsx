import { ClipboardList } from 'lucide-react'
import { getAssessmentPageData } from '@/features/assessment/page-data'
import { Pagination } from '@/components/Pagination'
import { PageHeader } from '@/components/layout/page-header'
import { GradeFilter } from '../components/GradeFilter'
import type { LedgerCategory } from './format'
import { catalogQueries } from '@/features/academic-catalog/queries'
import { LedgerUpload } from './Upload'
import { LedgerRow } from './Row'

export async function LedgerPage({ params, category }: { params: { classId?: string; semester?: string; page?: string; search?: string }; category: LedgerCategory }) {
  const [data, catalog] = await Promise.all([getAssessmentPageData(params, category), catalogQueries.active()])
  const { classes, classId, semester, students, ledgers: reports, recordCount, pagination, search } = data
  const className = classes.find(item => item.id === classId)?.name ?? 'Kelas'
  const subjects = category === 'mata-pelajaran'
  const columnMap = new Map(catalog.filter(item => item.category === category).map(item => [item.code, { code: item.code, name: item.name, label: subjects ? item.code : item.name }]))
  for (const report of reports) {
    for (const item of subjects ? report.subjects : report.extracurriculars) {
      if (!columnMap.has(item.code)) columnMap.set(item.code, { code: item.code, name: item.name, label: subjects ? item.code : item.name })
    }
  }
  const columns = Array.from(columnMap.values())
  const visible = reports.filter(r => subjects ? r.subjects.length : r.extracurriculars.length)
  const reportMap = new Map(visible.map(report => [report.studentId, report]))


  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
        title={subjects ? 'Nilai Mata Pelajaran' : 'Nilai Ekstrakurikuler'}
        description={subjects ? 'Upload leger Excel per kelas dan semester untuk mengisi nilai mata pelajaran dan ekstrakurikuler sekaligus.' : 'Nilai ekstrakurikuler otomatis terisi dari upload nilai mata pelajaran. Predikat: SB, B, C, atau K.'}
        icon={ClipboardList}
        iconGradient="from-orange-500 to-orange-600"
      />
      <GradeFilter search={search} key={`${classId}-${semester}-${search}`} basePath={`/admin/nilai/${category}`} classes={classes} classId={classId} semester={semester}>
        {search && <p role="status" className="text-sm text-text-secondary">{pagination.total} siswa ditemukan untuk “{search}”.</p>}
        {classId ? (
          <LedgerUpload key={`${category}-${classId}-${semester}`} classId={classId} className={className} semester={semester} category={category} count={recordCount}>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] text-left text-sm">
                <thead className="bg-surface-alt text-text-secondary">
                  <tr>
                    <th scope="col" className="px-4 py-3 font-semibold">NISN</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Nama Siswa</th>
                    {columns.map(column => <th scope="col" key={column.code} title={column.name} className="min-w-24 px-4 py-3 text-center font-semibold">{column.label}</th>)}
                    <th scope="col" className="px-4 py-3 font-semibold">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {students.length === 0 && <tr><td colSpan={columns.length + 3} className="px-4 py-8 text-center text-text-muted">Tidak ada siswa yang cocok dengan pencarian.</td></tr>}
                  {students.map(student => {
                    const report = reportMap.get(student.id)
                    const values = report ? Object.fromEntries(subjects
                      ? report.subjects.map(item => [item.code, item.score])
                      : report.extracurriculars.map(item => [item.code, item.predicate])) : undefined
                    return <LedgerRow key={`${student.id}-${JSON.stringify(values)}`} student={student} columns={columns} values={values} classId={classId} semester={semester} category={category} />
                  })}
                </tbody>
              </table>
            </div>
            <Pagination currentPage={pagination.page} totalPages={pagination.totalPages} />
            <p className="px-5 py-3 text-xs text-text-muted">Tanda “-” berarti nilai belum diisi.</p>
          </LedgerUpload>
        ) : (
          <div className="section-card"><div className="empty-state"><p className="text-sm text-text-muted">Tambahkan kelas terlebih dahulu.</p></div></div>
        )}
      </GradeFilter>
    </div>
  )
}
