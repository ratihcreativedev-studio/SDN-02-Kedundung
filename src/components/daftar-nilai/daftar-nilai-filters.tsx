import { Filter } from "lucide-react";

type DaftarNilaiFiltersProps = {
  kelas: string;
  kelasList: string[];
  semester: string;
  semesterList: string[];
  onKelasChange: (value: string) => void;
  onSemesterChange: (value: string) => void;
};

export function DaftarNilaiFilters({
  kelas,
  kelasList,
  semester,
  semesterList,
  onKelasChange,
  onSemesterChange,
}: DaftarNilaiFiltersProps) {
  return (
    <div className="section-card mb-6 p-4 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative sm:w-40">
          <Filter
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
          />
          <select
            value={kelas}
            onChange={(e) => onKelasChange(e.target.value)}
            className="w-full h-[46px] appearance-none cursor-pointer rounded-xl border-0 bg-surface-alt py-2.5 pl-9 pr-8 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            {kelasList.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
        </div>
        <div className="sm:w-52">
          <select
            value={semester}
            onChange={(e) => onSemesterChange(e.target.value)}
            className="w-full h-[46px] appearance-none cursor-pointer rounded-xl border-0 bg-surface-alt px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            {semesterList.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
