import { StudentGradeTable } from '@/features/grades/components/StudentGradeTable'
import { studentService } from '@/features/students/services'
import { gradeQueries } from '@/features/grades/queries'
import { attendanceQueries } from '@/features/attendance/queries'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, User, MapPin, Users, BookOpen, CalendarDays } from 'lucide-react'
import { IjazahUploader } from '@/features/students/components/IjazahUploader'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  try {
    const student = await studentService.getById(resolvedParams.id)
    return { title: `${student.name} | SIPANDA Admin` }
  } catch {
    return { title: 'Siswa Tidak Ditemukan | SIPANDA Admin' }
  }
}

export default async function StudentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  let student: Awaited<ReturnType<typeof studentService.getById>>
  let grades: Awaited<ReturnType<typeof gradeQueries.findByStudent>> = []
  let attendances: Awaited<ReturnType<typeof attendanceQueries.findByStudent>> = []
  try {
    student = await studentService.getById(resolvedParams.id)
    grades = await gradeQueries.findByStudent(student.id)
    attendances = await attendanceQueries.findByStudent(student.id)
  } catch {
    notFound()
  }

  const formattedDate = student.birthDate 
    ? new Date(student.birthDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    : '-'

  // Attendance is now stored as monthly summaries directly
  const monthlyAttendances = attendances.map((att) => ({
    month: att.monthYear,
    hadir: att.hadir,
    sakit: att.sakit,
    izin: att.izin,
    alpha: att.alpha,
  }))

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in-up">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/data-siswa" className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-border text-text-secondary transition-colors hover:bg-surface-alt hover:text-primary shadow-sm">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-primary sm:text-3xl">Detail Siswa</h1>
          <p className="text-sm text-text-secondary">Informasi lengkap peserta didik</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 items-start">
        {/* Left Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Profile Card */}
          <div className="section-card p-6 flex flex-col items-center text-center h-fit">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-linear-to-br from-primary-light to-primary shadow-lg shadow-primary/20 mb-4 text-white text-3xl font-bold">
              {student.name.charAt(0).toUpperCase()}
            </div>
            <h2 className="text-xl font-bold text-primary mb-1">{student.name}</h2>
            <p className="text-sm font-medium text-text-secondary mb-4">NISN: {student.nisn}</p>
            <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold bg-primary/10 text-primary border border-primary/20">
              {student.class?.name || 'Belum ada kelas'}
            </span>
            <p className="mt-3 text-sm font-medium text-text-secondary">Status: {{ active: 'Aktif', inactive: 'Tidak Aktif', graduate: 'Lulus' }[student.status]}</p>
            {student.graduationDate && <p className="mt-1 text-xs text-text-muted">Tanggal kelulusan: {student.graduationDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })}</p>}
          </div>

          {/* Attendance Recap Card */}
          <div className="section-card p-6 h-fit">
            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-border">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600">
                <CalendarDays size={16} />
              </div>
              <h3 className="text-lg font-bold text-primary">Rekap Absensi</h3>
            </div>
            
            {monthlyAttendances.length > 0 ? (
              <div className="space-y-4">
                {monthlyAttendances.map(att => (
                  <div key={att.month} className="bg-surface-alt/30 p-4 rounded-xl border border-border">
                    <h4 className="text-sm font-bold text-primary mb-3 text-center">{att.month}</h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex justify-between items-center bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
                        <span className="font-medium text-emerald-700 dark:text-emerald-400">Hadir</span>
                        <span className="font-bold text-emerald-700 dark:text-emerald-400">{att.hadir}</span>
                      </div>
                      <div className="flex justify-between items-center bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/20">
                        <span className="font-medium text-amber-700 dark:text-amber-400">Sakit</span>
                        <span className="font-bold text-amber-700 dark:text-amber-400">{att.sakit}</span>
                      </div>
                      <div className="flex justify-between items-center bg-blue-500/10 px-3 py-1.5 rounded-lg border border-blue-500/20">
                        <span className="font-medium text-blue-700 dark:text-blue-400">Izin</span>
                        <span className="font-bold text-blue-700 dark:text-blue-400">{att.izin}</span>
                      </div>
                      <div className="flex justify-between items-center bg-red-500/10 px-3 py-1.5 rounded-lg border border-red-500/20">
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

          {/* Ijazah Upload Card */}
          <IjazahUploader studentId={student.id} existingUrl={student.ijazahUrl} />
        </div>

        {/* Details Data (Scrollable) */}
        <div className="lg:col-span-2 space-y-6">
          <section className="section-card p-6">
            <div className="mb-5 flex items-center gap-3 border-b border-border pb-3">
              <BookOpen size={20} className="text-orange-600" />
              <h3 className="text-lg font-bold text-primary">Rincian Nilai Siswa</h3>
            </div>
            <StudentGradeTable grades={grades.map(grade => ({
              id: grade.id,
              semester: grade.semester,
              uh: grade.uh,
              asts: grade.asts,
              asas: grade.asas,
              score: grade.score,
            }))} />
          </section>

          {/* Data Diri */}
          <div className="section-card p-6">
            <div className="flex items-center gap-3 mb-5 pb-3 border-b border-border">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600">
                <User size={20} />
              </div>
              <h3 className="text-lg font-bold text-primary">Data Diri</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-surface-alt/30 p-3.5 rounded-xl border border-border">
                <p className="text-xs font-medium text-text-muted mb-1">NIPD</p>
                <p className="text-sm font-semibold text-text-secondary">{student.nipd || '-'}</p>
              </div>
              <div className="bg-surface-alt/30 p-3.5 rounded-xl border border-border">
                <p className="text-xs font-medium text-text-muted mb-1">Jenis Kelamin</p>
                <p className="text-sm font-semibold text-text-secondary">{student.gender === 'L' ? 'Laki-Laki' : student.gender === 'P' ? 'Perempuan' : '-'}</p>
              </div>
              <div className="bg-surface-alt/30 p-3.5 rounded-xl border border-border">
                <p className="text-xs font-medium text-text-muted mb-1">Tempat Lahir</p>
                <p className="text-sm font-semibold text-text-secondary">{student.birthPlace || '-'}</p>
              </div>
              <div className="bg-surface-alt/30 p-3.5 rounded-xl border border-border">
                <p className="text-xs font-medium text-text-muted mb-1">Tanggal Lahir</p>
                <p className="text-sm font-semibold text-text-secondary">{formattedDate}</p>
              </div>
              <div className="bg-surface-alt/30 p-3.5 rounded-xl border border-border">
                <p className="text-xs font-medium text-text-muted mb-1">NIK</p>
                <p className="text-sm font-semibold text-text-secondary">{student.nik || '-'}</p>
              </div>
              <div className="bg-surface-alt/30 p-3.5 rounded-xl border border-border">
                <p className="text-xs font-medium text-text-muted mb-1">Agama</p>
                <p className="text-sm font-semibold text-text-secondary">{student.religion || '-'}</p>
              </div>
            </div>
          </div>

          {/* Alamat */}
          <div className="section-card p-6">
            <div className="flex items-center gap-3 mb-5 pb-3 border-b border-border">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
                <MapPin size={20} />
              </div>
              <h3 className="text-lg font-bold text-primary">Data Alamat</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2 bg-surface-alt/30 p-3.5 rounded-xl border border-border">
                <p className="text-xs font-medium text-text-muted mb-1">Alamat Lengkap</p>
                <p className="text-sm font-semibold text-text-secondary">{student.address || '-'}</p>
              </div>
              <div className="bg-surface-alt/30 p-3.5 rounded-xl border border-border">
                <p className="text-xs font-medium text-text-muted mb-1">Kelurahan</p>
                <p className="text-sm font-semibold text-text-secondary">{student.village || '-'}</p>
              </div>
              <div className="bg-surface-alt/30 p-3.5 rounded-xl border border-border">
                <p className="text-xs font-medium text-text-muted mb-1">Kecamatan</p>
                <p className="text-sm font-semibold text-text-secondary">{student.district || '-'}</p>
              </div>
            </div>
          </div>

          {/* Orang Tua */}
          <div className="section-card p-6">
            <div className="flex items-center gap-3 mb-5 pb-3 border-b border-border">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600">
                <Users size={20} />
              </div>
              <h3 className="text-lg font-bold text-primary">Data Orang Tua</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-surface-alt/30 p-3.5 rounded-xl border border-border">
                <p className="text-xs font-medium text-text-muted mb-1">Nama Ayah</p>
                <p className="text-sm font-semibold text-text-secondary">{student.fatherName || '-'}</p>
              </div>
              <div className="bg-surface-alt/30 p-3.5 rounded-xl border border-border">
                <p className="text-xs font-medium text-text-muted mb-1">Pekerjaan Ayah</p>
                <p className="text-sm font-semibold text-text-secondary">{student.fatherJob || '-'}</p>
              </div>
              <div className="sm:col-span-2 bg-surface-alt/30 p-3.5 rounded-xl border border-border">
                <p className="text-xs font-medium text-text-muted mb-1">Nama Ibu</p>
                <p className="text-sm font-semibold text-text-secondary">{student.motherName || '-'}</p>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  )
}
