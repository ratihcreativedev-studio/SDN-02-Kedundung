import { classQueries } from '@/features/classes/queries'
import { studentQueries } from '@/features/students/queries'
import { attendanceQueries } from './queries'

export async function getAttendancePageData(selectedClassId: string | undefined, month: string) {
  const classesPromise = classQueries.findOptions()
  const classIdPromise = selectedClassId === undefined
    ? classesPromise.then(classes => classes[0]?.id ?? '')
    : Promise.resolve(selectedClassId)
  const [classes, classId, students, attendances] = await Promise.all([
    classesPromise,
    classIdPromise,
    classIdPromise.then(classId => classId ? studentQueries.findAcademicRoster(classId) : []),
    classIdPromise.then(classId => classId ? attendanceQueries.findByClassAndMonth(classId, month) : []),
  ])

  return { classes, classId, students, attendances }
}
