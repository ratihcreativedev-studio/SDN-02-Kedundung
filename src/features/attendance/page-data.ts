import { classQueries } from '@/features/classes/queries'
import { studentQueries } from '@/features/students/queries'
import { attendanceQueries } from './queries'

export async function getAttendancePageData(selectedClassId: string | undefined, semester: string) {
  const classesPromise = classQueries.findOptions()
  const classIdPromise = selectedClassId === undefined
    ? classesPromise.then(classes => classes[0]?.id ?? '')
    : Promise.resolve(selectedClassId)
  const [classes, classId, roster, attendances] = await Promise.all([
    classesPromise,
    classIdPromise,
    classIdPromise.then(classId => classId ? studentQueries.findAcademicRoster(classId) : []),
    classIdPromise.then(classId => classId ? attendanceQueries.findByClassAndSemester(classId, semester) : []),
  ])

  const students = Array.from(new Map([
    ...roster.map(student => [student.id, student] as const),
    ...attendances.map(item => [item.student.id, item.student] as const),
  ]).values()).sort((a, b) => a.name.localeCompare(b.name))
  return { classes, classId, students, attendances }
}
