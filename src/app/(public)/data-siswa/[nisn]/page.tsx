import { StudentBiodata } from '@/features/students/components/StudentBiodata'
import { StudentAttendanceRecap } from '@/features/attendance/components/StudentAttendanceRecap'
import { StudentGradeTable } from '@/features/grades/components/StudentGradeTable'
import { getStudentByNISNAction } from '@/features/students/actions'
import Link from 'next/link'
import { ArrowLeft, User, BookOpen, Download, Award, Info, StickyNote } from 'lucide-react'

export async function generateMetadata({ params }: { params: Promise<{ nisn: string }> }) {
  const resolvedParams = await params
  return { title: `Hasil Pencarian Siswa: ${resolvedParams.nisn} | SIPANDA` }
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
            <h1 className="text-2xl font-bold text-primary mb-2">Data Siswa Tidak Ditemukan</h1>
            <p className="text-text-secondary mb-6">
              Siswa dengan NIM atau NISN &quot;{resolvedParams.nisn}&quot; tidak ditemukan. Pastikan nomor yang dimasukkan sudah benar.
            </p>
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

  return (
    <div className="page-shell">
      <div className="page-container max-w-6xl py-8">
        
        {/* Top Header */}
        <div className="mb-8 flex items-center gap-4">
          <Link 
            href="/data-siswa" 
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-border text-text-secondary transition-colors hover:bg-surface-alt hover:text-primary shadow-sm"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-primary sm:text-3xl">Detail Data Siswa</h1>
            <p className="text-sm text-text-secondary">Biodata lengkap, data orang tua, nilai, absensi, dan prestasi peserta didik</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Profile & Ijazah */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Card */}
            <div className="section-card p-6 flex flex-col items-center text-center h-fit bg-white border border-border rounded-2xl shadow-sm">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-primary-light to-primary shadow-lg shadow-primary/20 mb-4 text-white text-3xl font-bold">
                {studentData.name.charAt(0).toUpperCase()}
              </div>
              <h2 className="text-xl font-bold text-primary mb-1">{studentData.name}</h2>
              <div className="flex flex-wrap justify-center gap-2 mb-4">
                <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-surface-alt text-text-secondary border border-border">
                  NISN: {studentData.nisn}
                </span>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-surface-alt text-text-secondary border border-border">
                    NIM/NIPD: {studentData.nipd || '-'}
                  </span>
              </div>
              <span className="inline-flex items-center px-3.5 py-1.5 rounded-full text-sm font-semibold bg-primary/10 text-primary border border-primary/20">
                {studentData.class?.name || 'Belum ada kelas'}
              </span>
            </div>

            {/* Download Ijazah Card */}
            {studentData.ijazahUrl && (
              <div className="section-card p-6 flex flex-col items-center text-center h-fit bg-white border border-border rounded-2xl shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 mb-3">
                  <Download className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-primary mb-1">Ijazah Kelulusan</h3>
                <p className="text-xs text-text-secondary mb-4">Berkas digital ijazah resmi siswa tersedia untuk diunduh.</p>
                <a
                  href={studentData.ijazahUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white transition-all hover:bg-emerald-700 shadow-sm shadow-emerald-600/20 hover:shadow-md hover:-translate-y-0.5 w-full"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Unduh Ijazah
                </a>
              </div>
            )}

            <StudentBiodata student={studentData} />
          </div>

          {/* Right Column: Daftar Nilai & Rekap Absensi */}
          <div className="lg:col-span-2 space-y-6">

            {studentData.note && (
              <section aria-labelledby="student-note-title" className="section-card rounded-2xl border border-amber-200 bg-amber-50/50 p-6">
                <div className="mb-3 flex items-center gap-3">
                  <StickyNote className="h-5 w-5 text-amber-600" aria-hidden="true" />
                  <h2 id="student-note-title" className="text-lg font-bold text-primary">Catatan dari Sekolah</h2>
                </div>
                <p className="whitespace-pre-wrap break-words text-sm leading-7 text-text-secondary">{studentData.note}</p>
              </section>
            )}

            {/* DAFTAR NILAI SISWA */}
            <div className="section-card p-6 bg-white border border-border rounded-2xl shadow-sm">
              <div className="flex items-center justify-between mb-5 pb-3 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/10 text-orange-600">
                    <BookOpen size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-primary">Daftar Nilai</h3>
                    <p className="text-xs text-text-secondary">Rincian UH, ASTS, ASAS, dan Nilai Rapor per semester</p>
                  </div>
                </div>
                {studentData.gradeDetails && studentData.gradeDetails.length > 0 && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
                    <Award size={13} />
                    {studentData.gradeDetails.length} Rekord Nilai
                  </span>
                )}
              </div>

              {studentData.gradeDetails && studentData.gradeDetails.length > 0 ? (
                <div className="space-y-5">
                  <StudentGradeTable grades={studentData.gradeDetails} />

                </div>
              ) : (
                <div className="text-center py-8 bg-surface-alt/30 rounded-xl border border-dashed border-border">
                  <Info className="mx-auto h-8 w-8 text-text-muted mb-2" />
                  <p className="text-sm font-semibold text-text-primary">Belum Ada Data Nilai</p>
                  <p className="text-xs text-text-secondary mt-1">Data nilai untuk siswa ini belum diinput oleh pihak sekolah.</p>
                </div>
              )}
            </div>

            <StudentAttendanceRecap history={studentData.attendanceHistory} />

            <section className="section-card rounded-2xl border border-border bg-white p-6 shadow-sm">
              <h3 className="mb-4 border-b border-border pb-3 text-lg font-bold text-primary">Prestasi Siswa</h3>
              {studentData.achievements?.length ? <div className="space-y-4">
                {studentData.achievements.map(achievement => <article key={achievement.id} className="rounded-xl border border-border bg-surface-alt/30 p-4">
                  <h4 className="font-semibold text-primary">{achievement.title}</h4>
                  <dl className="mt-3 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                    {[
                      ['Kegiatan', achievement.eventName], ['Tingkat', achievement.level],
                      ['Peringkat', achievement.rank],
                      ['Tanggal', achievement.date ? new Date(achievement.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }) : null],
                    ].map(([label, value]) => <div key={label}><dt className="text-xs text-text-muted">{label}</dt><dd className="break-words font-medium text-text-primary">{value || '-'}</dd></div>)}
                  </dl>
                  {achievement.note && <p className="mt-3 whitespace-pre-wrap break-words text-sm text-text-secondary">{achievement.note}</p>}
                  {achievement.imageUrl && <a href={achievement.imageUrl} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block text-sm font-semibold text-primary underline">Lihat Dokumentasi</a>}
                </article>)}
              </div> : <p className="text-sm text-text-muted">Belum ada data prestasi.</p>}
            </section>

          </div>
        </div>
      </div>
    </div>
  )
}
