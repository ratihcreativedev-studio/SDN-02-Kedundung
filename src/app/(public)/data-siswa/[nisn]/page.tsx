import { StudentGradeTable } from '@/features/grades/components/StudentGradeTable'
import { getStudentByNISNAction } from '@/features/students/actions'
import Link from 'next/link'
import { ArrowLeft, User, BookOpen, CalendarDays, Download, Award, CheckCircle2, Info, StickyNote } from 'lucide-react'

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

  const formattedDate = studentData?.birthDate 
    ? new Date(studentData.birthDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    : '-'

  // Overall attendance calculations
  const totalHadir = (studentData.monthlyAttendances || []).reduce((sum: number, att: any) => sum + (att.hadir || 0), 0)
  const totalSakit = (studentData.monthlyAttendances || []).reduce((sum: number, att: any) => sum + (att.sakit || 0), 0)
  const totalIzin = (studentData.monthlyAttendances || []).reduce((sum: number, att: any) => sum + (att.izin || 0), 0)
  const totalAlpha = (studentData.monthlyAttendances || []).reduce((sum: number, att: any) => sum + (att.alpha || 0), 0)
  const totalHariAbsen = totalHadir + totalSakit + totalIzin + totalAlpha
  const overallPercentage = totalHariAbsen > 0 ? Math.round((totalHadir / totalHariAbsen) * 100) : 0

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
            <h1 className="text-2xl font-bold text-primary sm:text-3xl">Detail Data Akademik Siswa</h1>
            <p className="text-sm text-text-secondary">Informasi profil, daftar nilai, dan riwayat absensi peserta didik</p>
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
                {studentData.nipd && (
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-surface-alt text-text-secondary border border-border">
                    NIM/NIPD: {studentData.nipd}
                  </span>
                )}
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

            {/* Data Diri Card */}
            <div className="section-card p-6 bg-white border border-border rounded-2xl shadow-sm">
              <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-border">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600">
                  <User size={18} />
                </div>
                <h3 className="text-base font-bold text-primary">Data Pribadi</h3>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center py-1.5 border-b border-border/50">
                  <span className="text-text-muted text-xs">Jenis Kelamin</span>
                  <span className="font-semibold text-text-primary">
                    {studentData.gender === 'L' ? 'Laki-Laki' : studentData.gender === 'P' ? 'Perempuan' : '-'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-border/50">
                  <span className="text-text-muted text-xs">Tempat Lahir</span>
                  <span className="font-semibold text-text-primary">{studentData.birthPlace || '-'}</span>
                </div>
                <div className="flex justify-between items-center py-1.5">
                  <span className="text-text-muted text-xs">Tanggal Lahir</span>
                  <span className="font-semibold text-text-primary">{formattedDate}</span>
                </div>
              </div>
            </div>
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

            {/* REKAP ABSENSI SISWA */}
            <div className="section-card p-6 bg-white border border-border rounded-2xl shadow-sm">
              <div className="flex items-center justify-between mb-5 pb-3 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600">
                    <CalendarDays size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-primary">Rekap & Riwayat Absensi</h3>
                    <p className="text-xs text-text-secondary">Statistik dan rincian kehadiran berkala siswa</p>
                  </div>
                </div>
                {totalHariAbsen > 0 && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle2 size={13} />
                    {overallPercentage}% Kehadiran
                  </span>
                )}
              </div>

              {studentData.monthlyAttendances && studentData.monthlyAttendances.length > 0 ? (
                <div className="space-y-5">
                  {/* Summary KPI Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-emerald-50/80 border border-emerald-200/80 p-3 rounded-xl text-center">
                      <span className="text-xs font-semibold text-emerald-700 block mb-1">Hadir</span>
                      <span className="text-2xl font-black text-emerald-700">{totalHadir}</span>
                      <span className="text-[10px] text-emerald-600 block mt-0.5">Hari</span>
                    </div>
                    <div className="bg-amber-50/80 border border-amber-200/80 p-3 rounded-xl text-center">
                      <span className="text-xs font-semibold text-amber-700 block mb-1">Sakit</span>
                      <span className="text-2xl font-black text-amber-700">{totalSakit}</span>
                      <span className="text-[10px] text-amber-600 block mt-0.5">Hari</span>
                    </div>
                    <div className="bg-blue-50/80 border border-blue-200/80 p-3 rounded-xl text-center">
                      <span className="text-xs font-semibold text-blue-700 block mb-1">Izin</span>
                      <span className="text-2xl font-black text-blue-700">{totalIzin}</span>
                      <span className="text-[10px] text-blue-600 block mt-0.5">Hari</span>
                    </div>
                    <div className="bg-rose-50/80 border border-rose-200/80 p-3 rounded-xl text-center">
                      <span className="text-xs font-semibold text-rose-700 block mb-1">Alpha</span>
                      <span className="text-2xl font-black text-rose-700">{totalAlpha}</span>
                      <span className="text-[10px] text-rose-600 block mt-0.5">Hari</span>
                    </div>
                  </div>

                  {/* Monthly Attendance Table */}
                  <div className="overflow-x-auto rounded-xl border border-border">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-surface-alt/70 text-text-secondary text-xs uppercase tracking-wider font-semibold border-b border-border">
                        <tr>
                          <th className="px-4 py-3">Bulan / Periode</th>
                          <th className="px-3 py-3 text-center text-emerald-700">Hadir</th>
                          <th className="px-3 py-3 text-center text-amber-700">Sakit</th>
                          <th className="px-3 py-3 text-center text-blue-700">Izin</th>
                          <th className="px-3 py-3 text-center text-rose-700">Alpha</th>
                          <th className="px-4 py-3 text-center font-bold">Kehadiran</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border text-xs sm:text-sm">
                        {studentData.monthlyAttendances.map((att: any) => (
                          <tr key={att.id || att.month} className="hover:bg-surface-alt/40 transition-colors">
                            <td className="px-4 py-3 font-semibold text-primary">
                              {att.month}
                            </td>
                            <td className="px-3 py-3 text-center font-bold text-emerald-600">
                              {att.hadir}
                            </td>
                            <td className="px-3 py-3 text-center text-amber-600">
                              {att.sakit}
                            </td>
                            <td className="px-3 py-3 text-center text-blue-600">
                              {att.izin}
                            </td>
                            <td className="px-3 py-3 text-center text-rose-600">
                              {att.alpha}
                            </td>
                            <td className="px-4 py-3 text-center font-bold text-primary">
                              <span className="inline-block px-2.5 py-0.5 rounded-md bg-surface-alt border border-border text-xs font-bold">
                                {att.persentase}%
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 bg-surface-alt/30 rounded-xl border border-dashed border-border">
                  <Info className="mx-auto h-8 w-8 text-text-muted mb-2" />
                  <p className="text-sm font-semibold text-text-primary">Belum Ada Data Absensi</p>
                  <p className="text-xs text-text-secondary mt-1">Data absensi untuk siswa ini belum diinput oleh pihak sekolah.</p>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
