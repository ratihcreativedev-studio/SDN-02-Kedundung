type AbsensiRow = { siswaId: string; nama: string; hadir: number; sakit: number; izin: number; alpa: number; totalHari: number };

type AbsensiTableProps = {
  rows: AbsensiRow[];
};

export function AbsensiTable({ rows }: AbsensiTableProps) {
  return (
    <div className="section-card overflow-hidden">
      <div className="table-wrapper">
        <table className="min-w-[780px] w-full text-sm">
          <thead>
            <tr className="bg-primary text-white">
              <th className="w-12 px-4 py-3 text-left font-semibold">No</th>
              <th className="min-w-[200px] px-4 py-3 text-left font-semibold">
                Nama
              </th>
              <th className="px-4 py-3 text-center font-semibold">Total Hari</th>
              <th className="px-4 py-3 text-center font-semibold">Hadir</th>
              <th className="px-4 py-3 text-center font-semibold">Sakit</th>
              <th className="px-4 py-3 text-center font-semibold">Izin</th>
              <th className="px-4 py-3 text-center font-semibold">Alpa</th>
              <th className="px-4 py-3 text-center font-semibold">%</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && <tr><td colSpan={8} className="px-4 py-8 text-center text-text-muted">Belum ada rekap absensi untuk kelas dan semester ini.</td></tr>}
            {rows.map((row, i) => {
              const pct = row.totalHari > 0 ? Math.round((row.hadir / row.totalHari) * 100) : 0;

              return (
                <tr
                  key={row.siswaId}
                  className="border-b border-border-light transition-colors hover:bg-surface-alt/50"
                >
                  <td className="px-4 py-3 text-text-muted">{i + 1}</td>
                  <td className="px-4 py-3 font-medium">{row.nama}</td>
                  <td className="px-4 py-3 text-center text-text-secondary">
                    {row.totalHari}
                  </td>
                  <td className="px-4 py-3 text-center font-medium text-success">
                    {row.hadir}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {row.sakit > 0 ? (
                      <span className="rounded-full bg-yellow-50 px-2 py-0.5 text-xs font-medium text-warning">
                        {row.sakit}
                      </span>
                    ) : (
                      <span className="text-text-muted">0</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {row.izin > 0 ? (
                      <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-500">
                        {row.izin}
                      </span>
                    ) : (
                      <span className="text-text-muted">0</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {row.alpa > 0 ? (
                      <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-danger">
                        {row.alpa}
                      </span>
                    ) : (
                      <span className="text-text-muted">0</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`text-xs font-semibold ${
                        pct >= 90
                          ? "text-success"
                          : pct >= 75
                            ? "text-warning"
                            : "text-danger"
                      }`}
                    >
                      {pct}%
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
