import { getSubjectOptions } from './subjects'
import { classQueries } from '@/features/classes/queries'
import { studentQueries } from '@/features/students/queries'
import { gradeQueries } from './queries'

export async function getGradePageData(params: { classId?: string; semester?: string; subjectCode?: string }) {
  const subjects = await getSubjectOptions()
  const subjectCode = subjects.some(s => s.code === params.subjectCode) ? params.subjectCode! : subjects.find(s => s.code === 'BI_ID')?.code ?? subjects[0]?.code ?? ''
  const semester = params.semester ?? 'Ganjil 2025/2026'
  const classesPromise = classQueries.findOptions()
  const classIdPromise = params.classId === undefined
    ? classesPromise.then(classes => classes[0]?.id ?? '')
    : Promise.resolve(params.classId)
  const [classes, classId, roster, grades] = await Promise.all([
    classesPromise,
    classIdPromise,
    classIdPromise.then(id => id ? studentQueries.findAcademicRoster(id) : []),
    classIdPromise.then(id => id ? gradeQueries.findByClassSemester(id, semester, subjectCode) : []),
  ])
  const students = Array.from(new Map([
    ...roster.map(student => [student.id, student] as const),
    ...grades.map(grade => [grade.student.id, grade.student] as const),
  ]).values()).sort((a, b) => a.name.localeCompare(b.name))
  return { subjects, subjectCode, classes, classId, semester, students,
    gradeMap: Object.fromEntries(grades.map(item => [item.studentId, item])) }
}
