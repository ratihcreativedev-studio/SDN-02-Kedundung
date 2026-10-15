import { getStudentByNISNAction } from '@/features/students/actions'
import Link from 'next/link'
import { ArrowLeft, User, BookOpen, CalendarDays, Download } from 'lucide-react'

export async function generateMetadata({ params }: { params: Promise<{ nisn: string }> }) {
  const resolvedParams = await params
  return { title: `Hasil Pencarian NISN: ${resolvedParams.nisn} | SIPANDA` }
}

export default async function PublicStudentDetailPage({ params }: { params: Promise<{ nisn: string }> }) {
  const resolvedParams = await params
  const result = await getStudentByNISNAction(resolvedParams.nisn)

  if (result.error || !result.success) {
    return (
      <div className="page-shell">
        <div className="page-container max-w-3xl py-12">
          <div className="flex flex-col items-center justify-center text-center p-8 bg-white rounded-2xl border border-red-100 shadow-sm">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
              <User size={32} />
            </div>
            <h1 className="text-2xl font-bold text-primary mb-2">Data Tidak Ditemukan</h1>
            <p className="text-text-secondary mb-6">{result.error || 'Siswa dengan NISN tersebut tidak ditemukan.'}</p>
            <Link 
              href="/data-siswa" 
              className="inline-flex items-center justify-center rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-primary/90"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali ke Pencarian
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const studentData = result.data

  const formattedDate = studentData?.birthDate 
    ? new Date(studentData.birthDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    : '-'

  return (
    <div className="page-shell">
      <div className="page-container max-w-5xl py-8">
        
        <div className="mb-8 flex items-center gap-4">
          <Link 
            href="/data-siswa" 
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-border text-text-secondary transition-colors hover:bg-surface-alt hover:text-primary shadow-sm"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-primary sm:text-3xl">Hasil Pencarian</h1>
            <p className="text-sm text-text-secondary">Detail akademik peserta didik</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Card */}
            <div className="section-card p-6 flex flex-col items-center text-center h-fit bg-white border border-border rounded-2xl">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-primary-light to-primary shadow-lg shadow-primary/20 mb-4 text-white text-3xl font-bold">
                {studentData.name.charAt(0).toUpperCase()}
              </div>
              <h2 className="text-xl font-bold text-primary mb-1">{studentData.name}</h2>
              <p className="text-sm font-medium text-text-secondary mb-4">NISN: {studentData.nisn}</p>
              <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold bg-primary/10 text-primary border border-primary/20">
                {studentData.class?.name || 'Belum ada kelas'}
              </span>
            </div>

            {/* Download Ijazah Card (Sisi Kiri) */}
            {studentData.ijazahUrl && (
              <div className="section-card p-6 flex flex-col items-center text-center h-fit bg-white border border-border rounded-2xl">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 mb-4">
                  <Download className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-primary mb-2">Ijazah Kelulusan</h3>
                <p className="text-sm text-text-secondary mb-5">Softfile ijazah tersedia untuk diunduh.</p>
                <a
                  href={studentData.ijazahUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white transition-all hover:bg-emerald-700 shadow-sm shadow-emerald-600/20 hover:shadow-md hover:-translate-y-0.5 w-full"
                >
                  Unduh Ijazah
                </a>
              </div>
            )}
          </div>

          <div className="lg:col-span-2 space-y-6">
            {/* Data Diri */}
            <div className="section-card p-6 bg-white border border-border rounded-2xl">
              <div className="flex items-center gap-3 mb-5 pb-3 border-b border-border">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600">
                  <User size={20} />
                </div>
                <h3 className="text-lg font-bold text-primary">Data Diri</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-surface-alt/30 p-3.5 rounded-xl border border-border">
                  <p className="text-xs font-medium text-text-muted mb-1">NIPD</p>
                  <p className="text-sm font-semibold text-text-secondary">{studentData.nipd || '-'}</p>
                </div>
                <div className="bg-surface-alt/30 p-3.5 rounded-xl border border-border">
                  <p className="text-xs font-medium text-text-muted mb-1">Jenis Kelamin</p>
                  <p className="text-sm font-semibold text-text-secondary">{studentData.gender === 'L' ? 'Laki-Laki' : studentData.gender === 'P' ? 'Perempuan' : '-'}</p>
                </div>
                <div className="bg-surface-alt/30 p-3.5 rounded-xl border border-border">
                  <p className="text-xs font-medium text-text-muted mb-1">Tempat Lahir</p>
                  <p className="text-sm font-semibold text-text-secondary">{studentData.birthPlace || '-'}</p>
                </div>
                <div className="bg-surface-alt/30 p-3.5 rounded-xl border border-border">
                  <p className="text-xs font-medium text-text-muted mb-1">Tanggal Lahir</p>
                  <p className="text-sm font-semibold text-text-secondary">{formattedDate}</p>
                </div>
              </div>
            </div>

            {/* Rekap Nilai */}
            <div className="section-card p-6 bg-white border border-border rounded-2xl">
              <div className="flex items-center gap-3 mb-5 pb-3 border-b border-border">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/10 text-orange-600">
                  <BookOpen size={20} />
                </div>
                <h3 className="text-lg font-bold text-primary">Rekap Nilai</h3>
              </div>
              {studentData.averages && studentData.averages.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {studentData.averages.map((avg: any) => (
                    <div key={avg.name} className="flex justify-between items-center bg-surface-alt/50 px-4 py-3 rounded-xl border border-border">
                      <span className="text-sm font-medium text-text-secondary">{avg.name}</span>
                      <span className="text-base font-bold text-primary">{avg.avg}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-text-muted text-center py-6 bg-surface-alt/30 rounded-xl border border-dashed border-border">
                  Belum ada data nilai
                </p>
              )}
            </div>

            {/* Rekap Absensi */}
            <div className="section-card p-6 bg-white border border-border rounded-2xl">
              <div className="flex items-center gap-3 mb-5 pb-3 border-b border-border">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600">
                  <CalendarDays size={20} />
                </div>
                <h3 className="text-lg font-bold text-primary">Rekap Absensi</h3>
              </div>
              {studentData.monthlyAttendances && studentData.monthlyAttendances.length > 0 ? (
                <div className="space-y-4">
                  {studentData.monthlyAttendances.map((att: any) => (
                    <div key={att.month} className="bg-surface-alt/30 p-4 rounded-xl border border-border">
                      <h4 className="text-sm font-bold text-primary mb-3 text-center">{att.month}</h4>
                      <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                        <div className="flex justify-between items-center sm:flex-col bg-emerald-500/10 px-3 py-2 rounded-lg border border-emerald-500/20">
                          <span className="font-medium text-emerald-700 dark:text-emerald-400">Hadir</span>
                          <span className="font-bold text-emerald-700 dark:text-emerald-400">{att.hadir}</span>
                        </div>
                        <div className="flex justify-between items-center sm:flex-col bg-amber-500/10 px-3 py-2 rounded-lg border border-amber-500/20">
                          <span className="font-medium text-amber-700 dark:text-amber-400">Sakit</span>
                          <span className="font-bold text-amber-700 dark:text-amber-400">{att.sakit}</span>
                        </div>
                        <div className="flex justify-between items-center sm:flex-col bg-blue-500/10 px-3 py-2 rounded-lg border border-blue-500/20">
                          <span className="font-medium text-blue-700 dark:text-blue-400">Izin</span>
                          <span className="font-bold text-blue-700 dark:text-blue-400">{att.izin}</span>
                        </div>
                        <div className="flex justify-between items-center sm:flex-col bg-red-500/10 px-3 py-2 rounded-lg border border-red-500/20">
                          <span className="font-medium text-red-700 dark:text-red-400">Alpha</span>
                          <span className="font-bold text-red-700 dark:text-red-400">{att.alpha}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-text-muted text-center py-6 bg-surface-alt/30 rounded-xl border border-dashed border-border">
                  Belum ada data absensi
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
