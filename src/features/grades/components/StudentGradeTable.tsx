type StudentGrade = {
  id: string
  subjectName: string
  uh: number | null
  asts: number | null
  asas: number | null
  score: number
}

export function StudentGradeTable({ grades }: { grades: StudentGrade[] }) {
  if (grades.length === 0) {
    return <p className="py-6 text-center text-sm text-text-muted">Belum ada data nilai.</p>
  }

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-surface-alt/70 text-xs font-semibold text-text-secondary">
            <tr>
              <th scope="col" className="px-3 py-3 text-center">Mata Pelajaran</th>
              <th scope="col" className="px-3 py-3 text-center">UH</th>
              <th scope="col" className="px-3 py-3 text-center">ASTS</th>
              <th scope="col" className="px-3 py-3 text-center">ASAS</th>
              <th scope="col" className="px-4 py-3 text-center">Nilai Rapor</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {grades.map(grade => (
              <tr key={grade.id} className="hover:bg-surface-alt/40">
                <td className="px-3 py-3 text-center">{grade.subjectName}</td>
                <td className="px-3 py-3 text-center">{grade.uh ?? '-'}</td>
                <td className="px-3 py-3 text-center">{grade.asts ?? '-'}</td>
                <td className="px-3 py-3 text-center">{grade.asas ?? '-'}</td>
                <td className="px-4 py-3 text-center font-bold text-primary">{grade.score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {grades.some(grade => grade.uh == null || grade.asts == null || grade.asas == null) && (
        <p className="text-xs text-text-muted">Tanda “-” berarti komponen nilai belum tersedia.</p>
      )}
    </div>
  )
}
