import { Users } from "lucide-react";

import { DATA_SISWA_PAGE_SIZE } from "@/data";

type DataSiswaHeroProps = {
  totalShown: number;
};

export function DataSiswaHero({ totalShown }: DataSiswaHeroProps) {
  return (
    <div className="page-hero soft-grid">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
            Data Akademik
          </div>
          <div className="mb-2 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-blue-500 to-blue-600">
              <Users size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-primary sm:text-4xl">
                Data Peserta Didik
              </h1>
              <p className="text-sm text-text-secondary sm:text-base">
                Pusat data siswa SDN Kedundung 2 dengan pencarian yang lebih
                cepat dan tampilan yang lebih nyaman dibaca.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:max-w-sm">
          <div className="rounded-2xl bg-white/80 p-4 shadow-sm">
            <div className="text-xs uppercase tracking-[0.16em] text-text-muted">
              Total Tampil
            </div>
            <div className="mt-1 text-2xl font-bold text-primary">
              {totalShown}
            </div>
          </div>
          <div className="rounded-2xl bg-white/80 p-4 shadow-sm">
            <div className="text-xs uppercase tracking-[0.16em] text-text-muted">
              Per Halaman
            </div>
            <div className="mt-1 text-2xl font-bold text-primary">
              {DATA_SISWA_PAGE_SIZE}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
