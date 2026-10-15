import { Bell, ArrowRight } from "lucide-react";
import Link from "next/link";
import { announcementService } from "@/features/announcements/services";
import { AnnouncementList } from "./announcement-list";

export async function InformasiSection() {
  const announcements = await announcementService.getPublished(6).catch((error) => {
    console.error("Gagal memuat pengumuman dari database:", error);
    return [];
  });

  return (
    <section id="informasi" className="bg-surface-alt pt-10 pb-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-14 text-center">
          <span className="mb-3 inline-block rounded-full bg-primary/5 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
            Update Terkini
          </span>
          <h2 className="text-3xl font-bold text-primary sm:text-4xl">
            Informasi Sekolah
          </h2>
        </div>

        {announcements.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-white/50 p-12 text-center backdrop-blur-sm sm:p-20">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/5 text-primary">
              <Bell size={32} className="opacity-40" />
            </div>
            <h3 className="mb-2 text-xl font-bold text-primary">
              Belum Ada Informasi Terbaru
            </h3>
            <p className="max-w-md text-text-secondary">
              Saat ini belum ada pengumuman atau informasi terbaru yang tersedia. 
              Silakan cek kembali nanti untuk mendapatkan pembaruan seputar kegiatan sekolah.
            </p>
          </div>
        ) : (
          <>
            <AnnouncementList announcements={announcements} />

            <div className="mt-10 flex justify-center">
              <Link
                href="/informasi"
                className="group inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3.5 font-semibold text-white! shadow-lg shadow-primary/20 transition-all duration-200 hover:bg-primary-light hover:shadow-xl hover:shadow-primary/30"
              >
                Lihat Semua Informasi
                <ArrowRight
                  size={16}
                  className="transition-transform group-hover:translate-x-0.5"
                />
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
