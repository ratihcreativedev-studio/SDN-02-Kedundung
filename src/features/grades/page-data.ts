import { classQueries } from '@/features/classes/queries'
import { studentQueries } from '@/features/students/queries'
import { gradeQueries } from './queries'

export async function getGradePageData(params: { classId?: string; semester?: string }) {
  const semester = params.semester ?? 'Ganjil 2025/2026'
  const classesPromise = classQueries.findOptions()
  const classIdPromise = params.classId === undefined
    ? classesPromise.then(classes => classes[0]?.id ?? '')
    : Promise.resolve(params.classId)
  const [classes, classId, roster, grades] = await Promise.all([
    classesPromise,
    classIdPromise,
    classIdPromise.then(id => id ? studentQueries.findAcademicRoster(id) : []),
    classIdPromise.then(id => id ? gradeQueries.findByClassSemester(id, semester) : []),
  ])
  const students = Array.from(new Map([
    ...roster.map(student => [student.id, student] as const),
    ...grades.map(grade => [grade.student.id, grade.student] as const),
  ]).values()).sort((a, b) => a.name.localeCompare(b.name))
  return { classes, classId, semester, students,
    gradeMap: Object.fromEntries(grades.map(item => [item.studentId, item])) }
}
