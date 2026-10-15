import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Trophy } from "lucide-react";

import { achievementService } from "@/features/achievements/services";

export async function PrestasiSection() {
  const achievements = await achievementService.getAll().catch(() => []);
  const dynamicHighlights = achievements.slice(0, 3);

  return (
    <section id="prestasi" className="bg-surface-alt py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-14 text-center">
          <span className="mb-3 inline-block rounded-full bg-secondary/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-secondary">
            Prestasi Siswa
          </span>
          <h2 className="text-3xl font-bold text-primary sm:text-4xl">
            Bangga Dengan Prestasi Kami
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-text-secondary">
            Siswa-siswi SDN Kedundung 2 aktif meraih prestasi di berbagai
            bidang kompetisi
          </p>
        </div>

        {dynamicHighlights.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {dynamicHighlights.map((item) => (
              <div key={item.id} className="group relative aspect-4/5 overflow-hidden rounded-2xl shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                {item.imageUrl ? (
                  <Image src={item.imageUrl} alt={item.title} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover transition-transform duration-500 group-hover:scale-110" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-primary/10 text-primary">
                    <Trophy size={48} />
                  </div>
                )}
                
                {/* Gradient Overlay */}
                <div className="absolute inset-x-0 bottom-0 h-3/4 bg-linear-to-t from-black/95 via-black/60 to-transparent transition-opacity duration-300 group-hover:from-black"></div>

                {/* Content */}
                <div className="absolute inset-0 flex flex-col justify-end p-5">
                  <div className="mb-2 flex flex-wrap items-center gap-1.5">
                    <Trophy size={14} className="text-secondary shrink-0" />
                    <span className="text-xs font-medium text-white/90 line-clamp-1">{item.student.name}</span>
                  </div>
                  <h3 className="text-base font-bold text-white line-clamp-2">{item.title}</h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-white/80 line-clamp-2">
                    {item.rank ? `${item.rank} - ` : ''}{item.eventName}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-text-secondary">Belum ada data prestasi untuk saat ini.</p>
          </div>
        )}

        <div className="mt-10 text-center">
          <Link
            href="/prestasi"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white! transition-all duration-200 hover:bg-primary-dark hover:shadow-lg"
          >
            Lihat Semua Prestasi
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
