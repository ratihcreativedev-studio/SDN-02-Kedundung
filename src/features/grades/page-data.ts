import { classQueries } from '@/features/classes/queries'
import { subjectQueries } from '@/features/subjects/queries'
import { studentQueries } from '@/features/students/queries'
import { gradeQueries } from './queries'

export async function getGradePageData(params: {
  classId?: string
  subjectId?: string
  semester?: string
}) {
  const semester = params.semester ?? 'Ganjil 2025/2026'
  const classesPromise = classQueries.findOptions()
  const subjectsPromise = subjectQueries.findOptions()
  // Explicit filters already identify the data; only defaults need the options.
  const classIdPromise = params.classId === undefined
    ? classesPromise.then(classes => classes[0]?.id ?? '')
    : Promise.resolve(params.classId)
  const subjectIdPromise = params.subjectId === undefined
    ? subjectsPromise.then(subjects => subjects[0]?.id ?? '')
    : Promise.resolve(params.subjectId)
  const selectionPromise = Promise.all([classIdPromise, subjectIdPromise])
  const [classes, subjects, [classId, subjectId], students, grades] = await Promise.all([
    classesPromise,
    subjectsPromise,
    selectionPromise,
    selectionPromise.then(([classId, subjectId]) => classId && subjectId
      ? studentQueries.findAcademicRoster(classId) : []),
    selectionPromise.then(([classId, subjectId]) => classId && subjectId
      ? gradeQueries.findByClassSubjectSemester(classId, subjectId, semester) : []),
  ])

  return { classes, subjects, classId, subjectId, semester, students,
    gradeMap: Object.fromEntries(grades.map(item => [item.studentId, item])) }
}
