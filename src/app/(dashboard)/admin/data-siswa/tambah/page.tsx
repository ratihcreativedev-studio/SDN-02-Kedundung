import { StudentForm } from '@/features/students/components/StudentForm'
import { classQueries } from '@/features/classes/queries'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export const metadata = {
  title: 'Tambah Data Siswa | SIPANDA Admin',
  description: 'Tambah data induk siswa SDN Kedundung 2',
}

export default async function TambahSiswaPage() {
  const classes = await classQueries.findOptions()

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in-up">
      <div>
        <Link
          href="/admin/data-siswa"
          className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Data Siswa
        </Link>
        <h1 className="text-3xl font-bold text-primary">Tambah Siswa</h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-1">Masukkan data siswa baru ke dalam sistem.</p>
      </div>

      <StudentForm classes={classes} />
    </div>
  )
}
