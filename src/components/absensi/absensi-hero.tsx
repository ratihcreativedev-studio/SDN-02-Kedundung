import { ClipboardList } from "lucide-react";

type AbsensiHeroProps = {
  semester: string;
  kelas: string;
};

export function AbsensiHero({ semester, kelas }: AbsensiHeroProps) {
  return (
    <div className="page-hero">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600">
            <ClipboardList size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-primary sm:text-4xl">
              Rekap Absensi
            </h1>
            <p className="text-sm text-text-secondary sm:text-base">
              Pantau kehadiran siswa per kelas dan per semester dalam satu
              tampilan ringkas.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:max-w-sm">
          <div className="rounded-2xl bg-white/80 p-4 shadow-sm">
            <div className="text-xs uppercase tracking-[0.16em] text-text-muted">
              Kelas
            </div>
            <div className="mt-1 text-lg font-bold text-primary">{kelas}</div>
          </div>
          <div className="rounded-2xl bg-white/80 p-4 shadow-sm">
            <div className="text-xs uppercase tracking-[0.16em] text-text-muted">
              Semester
            </div>
            <div className="mt-1 text-lg font-bold text-primary">{semester}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
