import Link from 'next/link'
import { Pencil } from 'lucide-react'
import { classQueries } from '@/features/classes/queries'
import { subjectService } from '../services'
import { DeleteSubjectButton } from './DeleteSubjectButton'
import { SubjectAllocationForm } from './SubjectAllocationForm'

export async function SubjectList() {
  const [subjects, classes] = await Promise.all([subjectService.getAll(), classQueries.findOptions()])

  return (
    <div className="space-y-4">
      {subjects.length === 0 ? (
        <div className="section-card p-10 text-center text-text-muted">
          Belum ada mata pelajaran.
        </div>
      ) : (
        subjects.map((subject) => (
          <div key={subject.id} className="section-card p-5 transition-all hover:shadow-lg">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <h3 className="text-lg font-semibold text-primary">{subject.name}</h3>
                <p className="mt-1 text-sm text-text-secondary">
                  Dialokasikan ke {subject.classes.length} kelas.
                </p>
              </div>
              <div className="flex shrink-0 justify-end gap-1">
                <Link href={`/admin/mata-pelajaran/${subject.id}/edit`} className="inline-flex items-center justify-center rounded-md p-2 text-primary transition-colors hover:bg-primary/10">
                  <Pencil className="h-4 w-4" />
                </Link>
                <DeleteSubjectButton id={subject.id} name={subject.name} />
              </div>
            </div>
            <div className="mt-4 border-t border-border pt-4">
              <SubjectAllocationForm
                subjectId={subject.id}
                classes={classes}
                selectedClassIds={subject.classes.map((item) => item.classId)}
              />
            </div>
          </div>
        ))
      )}
    </div>
  )
}
