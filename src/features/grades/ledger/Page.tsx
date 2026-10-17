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
  const columns = Array.from(columnMap.values()).map(column => ({
    ...column,
    label: subjects && column.code === 'BI_ID' ? 'BI'
      : subjects && column.code === 'BI_EN' ? 'BIng'
      : column.label,
  }))
  const visible = reports.filter(r => subjects ? r.subjects.length : r.extracurriculars.length)
  const reportMap = new Map(visible.map(report => [report.studentId, report]))

  if (subjects) return (
    <div className="space-y-6">
      <PageHeader title="Rekap Nilai" description="Nilai rapor setiap mata pelajaran otomatis diambil dari menu Nilai Mata Pelajaran." icon={ClipboardList} iconGradient="from-orange-500 to-orange-600" />
      <GradeFilter search={search} key={`${classId}-${semester}-${search}`} basePath="/admin/nilai/mata-pelajaran" classes={classes} classId={classId} semester={semester}>
        <div className="section-card overflow-hidden">
          <p className="p-5 text-sm text-text-secondary">Untuk mengisi atau memperbarui nilai, buka <a className="font-semibold text-primary underline" href={`/admin/nilai?${new URLSearchParams({ classId, semester })}`}>Nilai Mata Pelajaran</a>.</p>
          <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-alt"><tr><th scope="col" className="p-3">NISN</th><th scope="col" className="p-3">Nama Siswa</th>{columns.map(c => <th scope="col" key={c.code} title={c.name} className="whitespace-nowrap p-3 text-center">{c.label}</th>)}</tr></thead>
            <tbody>{students.map(student => <tr key={student.id} className="border-b border-border"><td className="p-3">{student.nisn}</td><td className="p-3">{student.name}</td>{columns.map(c => <td key={c.code} className="p-3 text-center">{reportMap.get(student.id)?.subjects.find(s => s.code === c.code)?.score ?? '-'}</td>)}</tr>)}</tbody>
          </table>
          </div>
          {!students.length && <p className="p-6 text-center">Tidak ada siswa untuk pilihan ini.</p>}
          <Pagination currentPage={pagination.page} totalPages={pagination.totalPages} />
          <div className="space-y-3 border-t border-border p-5 text-xs text-text-secondary">
            <h2 className="font-semibold text-primary">Keterangan Singkatan Mata Pelajaran</h2>
            <dl className="grid gap-x-6 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
              {columns.map(column => (
                <div key={column.code} className="flex items-baseline gap-2">
                  <dt className="shrink-0 font-semibold text-primary">{column.label}</dt>
                  <dd>{column.name}</dd>
                </div>
              ))}
            </dl>
            <p className="text-text-muted">Tanda “-” berarti nilai rapor belum diunggah untuk mata pelajaran ini.</p>
          </div>
        </div>
      </GradeFilter>
    </div>
  )


  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
        title={subjects ? 'Rekap Nilai' : 'Nilai Ekstrakurikuler'}
        description={subjects ? 'Upload leger Excel per kelas dan semester untuk mengisi nilai mata pelajaran dan ekstrakurikuler sekaligus.' : 'Upload file Excel Nilai Ekstra sesuai format sekolah. Predikat: SB, B, C, atau K.'}
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
