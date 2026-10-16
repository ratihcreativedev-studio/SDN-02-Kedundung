import type { Student } from '@prisma/client'
import { MapPin, User, Users } from 'lucide-react'

type Biodata = Pick<Student, 'gender' | 'birthPlace' | 'birthDate' | 'nik' | 'religion' | 'address' | 'village' | 'district' | 'fatherName' | 'fatherJob' | 'motherName' | 'motherJob' | 'status' | 'graduationDate'>

function formatDate(value: Date | string | null) {
  return value ? new Date(value).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }) : '-'
}

export function StudentBiodata({ student }: { student: Biodata }) {
  const sections = [
    { title: 'Data Pribadi', icon: User, rows: [
      ['Status Siswa', { active: 'Aktif', inactive: 'Tidak Aktif', graduate: 'Lulus' }[student.status]],
      ['Tanggal Kelulusan', formatDate(student.graduationDate)],
      ['Jenis Kelamin', student.gender === 'L' ? 'Laki-Laki' : student.gender === 'P' ? 'Perempuan' : null],
      ['Tempat Lahir', student.birthPlace], ['Tanggal Lahir', formatDate(student.birthDate)],
      ['NIK', student.nik], ['Agama', student.religion],
    ] },
    { title: 'Data Alamat', icon: MapPin, rows: [
      ['Alamat Lengkap', student.address], ['Kelurahan / Desa', student.village], ['Kecamatan', student.district],
    ] },
    { title: 'Data Orang Tua', icon: Users, rows: [
      ['Nama Ayah', student.fatherName], ['Pekerjaan Ayah', student.fatherJob], ['Nama Ibu', student.motherName], ['Pekerjaan Ibu', student.motherJob],
    ] },
  ]
  return <div className="space-y-6">
    {sections.map(section => <section key={section.title} className="section-card rounded-2xl border border-border bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-3 border-b border-border pb-3">
        <section.icon size={20} className="text-blue-600" />
        <h3 className="text-base font-bold text-primary">{section.title}</h3>
      </div>
      <dl className="space-y-3 text-sm">
        {section.rows.map(([label, value]) => <div key={label} className="border-b border-border/50 pb-3 last:border-0 last:pb-0">
          <dt className="mb-1 text-xs text-text-muted">{label}</dt>
          <dd className="whitespace-pre-wrap break-words font-semibold text-text-primary">{value || '-'}</dd>
        </div>)}
      </dl>
    </section>)}
  </div>
}
