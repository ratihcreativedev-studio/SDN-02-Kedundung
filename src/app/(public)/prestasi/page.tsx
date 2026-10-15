import { PrestasiHero } from "@/components/prestasi/prestasi-hero";
import { achievementService } from "@/features/achievements/services";
import { Trophy, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export const revalidate = 3600;

export default async function PrestasiPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedSearchParams = await searchParams;
  const page = typeof resolvedSearchParams.page === 'string' ? parseInt(resolvedSearchParams.page, 10) : 1;
  const ITEMS_PER_PAGE = 9;

  const allAchievements = await achievementService.getAll().catch(() => []);
  const totalPages = Math.max(1, Math.ceil(allAchievements.length / ITEMS_PER_PAGE));
  const currentPage = Math.max(1, Math.min(page, totalPages));
  
  const achievements = allAchievements.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="page-shell bg-surface-alt/30">
      <div className="page-container max-w-6xl">
        <PrestasiHero />
        {allAchievements.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border bg-white/70 p-12 text-center text-text-secondary">
            Belum ada prestasi yang dipublikasikan dari dashboard.
          </div>
        ) : (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {achievements.map((item) => (
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
                      {item.student.class?.name && <span className="text-[10px] text-white/70 whitespace-nowrap">&middot; {item.student.class.name}</span>}
                    </div>
                    <h3 className="text-base font-bold text-white line-clamp-2">{item.title}</h3>
                    <p className="mt-1.5 text-xs leading-relaxed text-white/80 line-clamp-2">
                      {item.rank ? `${item.rank} - ` : ''}{item.eventName}
                    </p>
                    {item.note && <p className="mt-2 text-[11px] leading-relaxed text-white/70 line-clamp-2">{item.note}</p>}
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-12 flex items-center justify-center gap-2">
                {currentPage > 1 ? (
                  <Link
                    href={`/prestasi?page=${currentPage - 1}`}
                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-white text-text-secondary transition-colors hover:bg-surface-alt hover:text-primary"
                  >
                    <ChevronLeft size={20} />
                  </Link>
                ) : (
                  <button disabled className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-surface-alt/50 text-text-secondary/30 cursor-not-allowed">
                    <ChevronLeft size={20} />
                  </button>
                )}
                
                <span className="flex h-10 items-center px-4 text-sm font-medium text-text-secondary">
                  Halaman {currentPage} dari {totalPages}
                </span>

                {currentPage < totalPages ? (
                  <Link
                    href={`/prestasi?page=${currentPage + 1}`}
                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-white text-text-secondary transition-colors hover:bg-surface-alt hover:text-primary"
                  >
                    <ChevronRight size={20} />
                  </Link>
                ) : (
                  <button disabled className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-surface-alt/50 text-text-secondary/30 cursor-not-allowed">
                    <ChevronRight size={20} />
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
