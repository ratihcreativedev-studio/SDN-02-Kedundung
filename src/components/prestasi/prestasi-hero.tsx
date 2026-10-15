import { Trophy } from "lucide-react";

export function PrestasiHero() {
  return (
    <div className="page-hero">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-amber-500 to-amber-600">
          <Trophy size={20} className="text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-primary sm:text-4xl">
            Prestasi Siswa
          </h1>
          <p className="text-sm text-text-secondary sm:text-base">
            Berbagai pencapaian membanggakan siswa-siswi kami di bidang akademik,
            olahraga, seni, dan kepramukaan.
          </p>
        </div>
      </div>
    </div>
  );
}
