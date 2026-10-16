'use client'

import { useNotifiedAction } from '@/components/ui/notification-provider'

import { ConfirmationForm } from '@/components/ui/confirmation-dialog'

import { useActionState } from 'react'
import { createStudentAction, updateStudentAction } from '../actions'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { StudentStatus } from '@prisma/client'

const initialState = { error: '', success: false }

type StudentFormProps = {
  classes: { id: string; name: string }[]
  student?: {
    id: string
    nisn: string
    name: string
    classId: string | null
    status?: StudentStatus
    graduationDate?: Date | null
    nipd?: string | null
    gender?: string | null
    birthPlace?: string | null
    birthDate?: Date | null
    nik?: string | null
    religion?: string | null
    address?: string | null
    village?: string | null
    district?: string | null
    fatherName?: string | null
    fatherJob?: string | null
    motherName?: string | null
    motherJob?: string | null
  } | null
}

export function StudentForm({ classes, student }: StudentFormProps) {
  const runAction = useNotifiedAction()
  const router = useRouter()
  const action = student ? updateStudentAction.bind(null, student.id) : createStudentAction
  const [state, formAction, isPending] = useActionState(
    async (prevState: typeof initialState, formData: FormData) => {
      const result = await runAction(() => action(formData), 'Data siswa berhasil disimpan.')
      if (result?.error) {
        return { error: result.error, success: false }
      }
      if (result?.success) {
        router.push('/admin/data-siswa')
        return { error: '', success: true }
      }
      return prevState
    },
    initialState
  )

  const formattedDate = student?.birthDate 
    ? new Date(student.birthDate).toISOString().split('T')[0] 
    : ''

  return (
    <div className="section-card p-6 sm:p-8 animate-fade-in-up animate-delay-100">
      <ConfirmationForm confirmation={{ title: 'Simpan data?', description: 'Anda akan menyimpan data siswa. Pastikan data sudah benar sebelum melanjutkan.', confirmLabel: 'Ya, simpan' }} action={formAction} className="space-y-8">
        {state?.error && (
          <div className="p-4 text-sm text-red-600 bg-red-50 rounded-xl border border-red-200 dark:bg-red-900/30 dark:border-red-900/50 dark:text-red-400">
            {state.error}
          </div>
        )}

        <div className="space-y-8">
          {/* Data Dasar */}
          <div className="bg-surface-alt/30 p-5 rounded-2xl border border-border space-y-4">
            <h3 className="text-lg font-bold text-primary border-b border-border pb-3">Data Dasar</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="nisn" className="block text-sm font-medium text-primary">
                  NISN <span className="text-red-500">*</span>
                </label>
                <input
                  id="nisn"
                  name="nisn"
                  type="text"
                  required
                  defaultValue={student?.nisn ?? ''}
                  placeholder="Masukkan 10 digit NISN"
                  className="w-full h-11.5 rounded-xl border border-border bg-white px-4 py-2.5 text-sm text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="name" className="block text-sm font-medium text-primary">
                  Nama Lengkap <span className="text-red-500">*</span>
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  defaultValue={student?.name ?? ''}
                  placeholder="Contoh: Budi Santoso"
                  className="w-full h-11.5 rounded-xl border border-border bg-white px-4 py-2.5 text-sm text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <label htmlFor="classId" className="block text-sm font-medium text-primary">
                  Kelas
                </label>
                <select
                  id="classId"
                  name="classId"
                  defaultValue={student?.classId ?? ''}
                  className="w-full h-11.5 rounded-xl border border-border bg-white px-4 py-2.5 text-sm text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
                >
                  <option value="">-- Tanpa Kelas --</option>
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label htmlFor="status" className="block text-sm font-medium text-primary">Status Siswa</label>
                <select id="status" name="status" defaultValue={student?.status ?? 'active'} required className="w-full h-11.5 rounded-xl border border-border bg-white px-4 py-2.5 text-sm text-primary focus:outline-none focus:ring-1 focus:ring-primary">
                  <option value="active">Aktif</option>
                  <option value="inactive">Tidak Aktif</option>
                  <option value="graduate">Lulus</option>
                </select>
                <p className="text-xs text-text-muted">Siswa berstatus Lulus otomatis tampil di menu Alumni.</p>
              </div>
              <div className="space-y-2">
                <label htmlFor="graduationDate" className="block text-sm font-medium text-primary">Tanggal Kelulusan</label>
                <input id="graduationDate" name="graduationDate" type="date" defaultValue={student?.graduationDate ? new Date(student.graduationDate).toISOString().split('T')[0] : ''} className="w-full h-11.5 rounded-xl border border-border bg-white px-4 py-2.5 text-sm text-primary focus:outline-none focus:ring-1 focus:ring-primary" />
                <p className="text-xs text-text-muted">Isi untuk siswa yang sudah lulus, jika tanggalnya tersedia.</p>
              </div>
            </div>
          </div>

          {/* Data Pribadi */}
          <div className="bg-surface-alt/30 p-5 rounded-2xl border border-border space-y-4">
            <h3 className="text-lg font-bold text-primary border-b border-border pb-3">Data Pribadi</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="nipd" className="block text-sm font-medium text-primary">
                  NIPD
                </label>
                <input
                  id="nipd"
                  name="nipd"
                  type="text"
                  defaultValue={student?.nipd ?? ''}
                  placeholder="Nomor Induk Peserta Didik"
                  className="w-full h-11.5 rounded-xl border border-border bg-white px-4 py-2.5 text-sm text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="gender" className="block text-sm font-medium text-primary">
                  Jenis Kelamin
                </label>
                <select
                  id="gender"
                  name="gender"
                  defaultValue={student?.gender ?? ''}
                  className="w-full h-11.5 rounded-xl border border-border bg-white px-4 py-2.5 text-sm text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
                >
                  <option value="">-- Pilih Jenis Kelamin --</option>
                  <option value="L">Laki-Laki</option>
                  <option value="P">Perempuan</option>
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="birthPlace" className="block text-sm font-medium text-primary">
                  Tempat Lahir
                </label>
                <input
                  id="birthPlace"
                  name="birthPlace"
                  type="text"
                  defaultValue={student?.birthPlace ?? ''}
                  placeholder="Contoh: Mojokerto"
                  className="w-full h-11.5 rounded-xl border border-border bg-white px-4 py-2.5 text-sm text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="birthDate" className="block text-sm font-medium text-primary">
                  Tanggal Lahir
                </label>
                <input
                  id="birthDate"
                  name="birthDate"
                  type="date"
                  defaultValue={formattedDate}
                  className="w-full h-11.5 rounded-xl border border-border bg-white px-4 py-2.5 text-sm text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="nik" className="block text-sm font-medium text-primary">
                  NIK
                </label>
                <input
                  id="nik"
                  name="nik"
                  type="text"
                  defaultValue={student?.nik ?? ''}
                  placeholder="16 Digit NIK"
                  className="w-full h-11.5 rounded-xl border border-border bg-white px-4 py-2.5 text-sm text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="religion" className="block text-sm font-medium text-primary">
                  Agama
                </label>
                <input
                  id="religion"
                  name="religion"
                  type="text"
                  defaultValue={student?.religion ?? ''}
                  placeholder="Contoh: Islam"
                  className="w-full h-11.5 rounded-xl border border-border bg-white px-4 py-2.5 text-sm text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Data Alamat */}
          <div className="bg-surface-alt/30 p-5 rounded-2xl border border-border space-y-4">
            <h3 className="text-lg font-bold text-primary border-b border-border pb-3">Data Alamat</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2 sm:col-span-2">
                <label htmlFor="address" className="block text-sm font-medium text-primary">
                  Alamat Lengkap
                </label>
                <input
                  id="address"
                  name="address"
                  type="text"
                  defaultValue={student?.address ?? ''}
                  placeholder="Nama jalan, gang, RT/RW"
                  className="w-full h-11.5 rounded-xl border border-border bg-white px-4 py-2.5 text-sm text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="village" className="block text-sm font-medium text-primary">
                  Kelurahan / Desa
                </label>
                <input
                  id="village"
                  name="village"
                  type="text"
                  defaultValue={student?.village ?? ''}
                  placeholder="Contoh: Kedundung"
                  className="w-full h-11.5 rounded-xl border border-border bg-white px-4 py-2.5 text-sm text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="district" className="block text-sm font-medium text-primary">
                  Kecamatan
                </label>
                <input
                  id="district"
                  name="district"
                  type="text"
                  defaultValue={student?.district ?? ''}
                  placeholder="Contoh: Magersari"
                  className="w-full h-11.5 rounded-xl border border-border bg-white px-4 py-2.5 text-sm text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Data Orang Tua */}
          <div className="bg-surface-alt/30 p-5 rounded-2xl border border-border space-y-4">
            <h3 className="text-lg font-bold text-primary border-b border-border pb-3">Data Orang Tua</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="fatherName" className="block text-sm font-medium text-primary">
                  Nama Ayah
                </label>
                <input
                  id="fatherName"
                  name="fatherName"
                  type="text"
                  defaultValue={student?.fatherName ?? ''}
                  placeholder="Nama Ayah"
                  className="w-full h-11.5 rounded-xl border border-border bg-white px-4 py-2.5 text-sm text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="fatherJob" className="block text-sm font-medium text-primary">
                  Pekerjaan Ayah
                </label>
                <input
                  id="fatherJob"
                  name="fatherJob"
                  type="text"
                  defaultValue={student?.fatherJob ?? ''}
                  placeholder="Contoh: Karyawan Swasta"
                  className="w-full h-11.5 rounded-xl border border-border bg-white px-4 py-2.5 text-sm text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="motherName" className="block text-sm font-medium text-primary">
                  Nama Ibu
                </label>
                <input
                  id="motherName"
                  name="motherName"
                  type="text"
                  defaultValue={student?.motherName ?? ''}
                  placeholder="Nama Ibu"
                  className="w-full h-11.5 rounded-xl border border-border bg-white px-4 py-2.5 text-sm text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="motherJob" className="block text-sm font-medium text-primary">
                  Pekerjaan Ibu
                </label>
                <input
                  id="motherJob"
                  name="motherJob"
                  type="text"
                  defaultValue={student?.motherJob ?? ''}
                  placeholder="Contoh: Ibu Rumah Tangga"
                  className="w-full h-11.5 rounded-xl border border-border bg-white px-4 py-2.5 text-sm text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-border pt-6 sm:flex-row sm:items-center">
          <button
            type="submit"
            disabled={isPending}
            className="rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/30 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-lg"
          >
            {isPending ? 'Menyimpan...' : student ? 'Simpan Perubahan' : 'Simpan Data'}
          </button>
          <Link
            href="/admin/data-siswa"
            className="rounded-xl border border-border bg-white px-6 py-3 text-center text-sm font-medium text-text-secondary transition-colors hover:bg-surface-alt hover:text-primary"
          >
            Batal
          </Link>
        </div>
      </ConfirmationForm>
    </div>
  )
}
