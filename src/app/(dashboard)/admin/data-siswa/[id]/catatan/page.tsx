import { notFound } from 'next/navigation'
import { StickyNote } from 'lucide-react'
import { requireAdminEmail } from '@/lib/auth'
import { studentQueries } from '@/features/students/queries'
import { StudentNoteForm } from '@/features/students/components/StudentNoteForm'
import { PageHeader } from '@/components/layout/page-header'

export const metadata = { title: 'Catatan Siswa | SIPANDA Admin' }

export default async function StudentNotePage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminEmail()
  const { id } = await params
  const student = await studentQueries.findById(id)
  if (!student) notFound()

  return <div className="space-y-6 animate-fade-in-up">
    <PageHeader title="Catatan Siswa" description={`${student.name} · NISN ${student.nisn}`} icon={StickyNote} iconGradient="from-amber-400 to-orange-500" />
    <StudentNoteForm studentId={student.id} initialNote={student.note} />
  </div>
}
