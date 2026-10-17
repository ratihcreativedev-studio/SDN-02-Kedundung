type NilaiRow = {
  id: string
  nisn: string
  name: string
  uh?: number | null
  asts?: number | null
  asas?: number | null
  score?: number
}

export function DaftarNilaiTable({ rows }: { rows: NilaiRow[] }) {
  return (
    <div className="section-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="bg-primary text-white">
              {['NISN', 'NAMA', 'UH', 'ASTS', 'ASAS', 'NILAI RAPOR'].map(label => (
                <th key={label} scope="col" className="px-4 py-3 text-left font-semibold">{label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(row => (
              <tr key={row.id} className="border-b border-border-light">
                <td className="px-4 py-3">{row.nisn}</td>
                <td className="px-4 py-3 font-medium">{row.name}</td>
                <td className="px-4 py-3">{row.uh ?? '-'}</td>
                <td className="px-4 py-3">{row.asts ?? '-'}</td>
                <td className="px-4 py-3">{row.asas ?? '-'}</td>
                <td className="px-4 py-3 font-bold">{row.score ?? '-'}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={6} className="p-6 text-center text-text-muted">Belum ada data siswa.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
