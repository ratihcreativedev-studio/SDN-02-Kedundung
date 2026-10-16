"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ArrowRight, BookOpen, CheckCircle2, Sparkles, X } from "lucide-react";

interface SchoolProfileSectionProps {
  descriptionParagraphs: string[];
  organization: string;
}

export function SchoolProfileSection({
  descriptionParagraphs,
  organization,
}: SchoolProfileSectionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsModalOpen(false);
      }
    };
    if (isModalOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isModalOpen]);

  const previewText = descriptionParagraphs[0] || "";

  return (
    <>
      <section className="overflow-hidden rounded-3xl border border-border bg-white shadow-xl">
        <div className="grid gap-8 p-6 sm:p-10 lg:grid-cols-12 lg:items-center lg:gap-12">
          {/* Headmaster Photo & Title */}
          <div className="lg:col-span-5">
            <div className="relative mx-auto max-w-sm lg:max-w-none">
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-surface-alt shadow-md">
                <Image
                  src="/images/kepala-sekolah.jpeg"
                  alt="Kepala Sekolah SDN Kedundung 2"
                  fill
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  priority
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary-dark/85 via-transparent to-transparent" />

                <div className="absolute bottom-4 left-4 right-4 rounded-xl bg-white/95 p-4 backdrop-blur-md shadow-md">
                  <span className="text-xs font-semibold uppercase tracking-wider text-secondary">
                    Kepala Sekolah
                  </span>
                  <h3 className="text-base font-bold text-primary sm:text-lg">
                    Yatik Hartini, S.Pd, M.Pd
                  </h3>
                  <p className="text-xs text-text-secondary">
                    {organization || "SD Negeri Kedundung 2 Kota Mojokerto"}
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-secondary/20 bg-secondary/5 p-4 text-center">
                <p className="text-xs italic leading-relaxed text-primary">
                  &ldquo;Pendidikan bukan hanya tentang transfer ilmu, melainkan menumbuhkan budi pekerti, kemandirian, dan cinta lingkungan.&rdquo;
                </p>
              </div>
            </div>
          </div>

          {/* School Narrative */}
          <div className="lg:col-span-7">
            <span className="inline-block rounded-full bg-primary/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-primary">
              Profil & Sejarah Singkat
            </span>

            <h2 className="mt-3 text-2xl font-extrabold text-primary sm:text-3xl lg:text-4xl">
              Dedikasi Pendidikan di Kawasan Kedundung
            </h2>

            {/* Line clamped narrative */}
            <div className="mt-5">
              <p className="line-clamp-4 text-base leading-relaxed text-text-secondary sm:text-lg">
                {previewText}
              </p>

              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="mt-3 inline-flex cursor-pointer items-center gap-1.5 text-sm font-bold text-secondary transition-colors hover:text-secondary-light sm:text-base group"
              >
                <span>Baca Selengkapnya</span>
                <ArrowRight
                  size={16}
                  className="transition-transform group-hover:translate-x-1"
                />
              </button>
            </div>

            {/* Pillars checklist */}
            <div className="mt-8 grid gap-3 border-t border-border pt-6 sm:grid-cols-2">
              <div className="flex items-center gap-2.5 text-sm font-medium text-primary">
                <CheckCircle2 size={18} className="shrink-0 text-secondary" />
                <span>Kurikulum Berbasis Karakter</span>
              </div>
              <div className="flex items-center gap-2.5 text-sm font-medium text-primary">
                <CheckCircle2 size={18} className="shrink-0 text-secondary" />
                <span>BTQ & Penguatan Nilai Agama</span>
              </div>
              <div className="flex items-center gap-2.5 text-sm font-medium text-primary">
                <CheckCircle2 size={18} className="shrink-0 text-secondary" />
                <span>Ekstrakurikuler Olahraga & Seni</span>
              </div>
              <div className="flex items-center gap-2.5 text-sm font-medium text-primary">
                <CheckCircle2 size={18} className="shrink-0 text-secondary" />
                <span>Lingkungan Belajar Ramah Anak</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Floating Modal for Full Profile */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs sm:p-6 animate-fade-in"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="relative flex max-h-[88vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-border bg-white shadow-2xl animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-border bg-surface-alt px-6 py-5 sm:px-8">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary/15 text-secondary">
                  <BookOpen size={20} />
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-secondary">
                    Profil Lengkap
                  </span>
                  <h3
                    id="modal-title"
                    className="text-lg font-bold text-primary sm:text-xl"
                  >
                    SD Negeri Kedundung 2 Kota Mojokerto
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                aria-label="Tutup modal"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-text-secondary shadow-xs transition-colors hover:bg-surface-alt hover:text-text-primary"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-8">
              <div className="space-y-4 text-base leading-relaxed text-text-secondary">
                {descriptionParagraphs.map((paragraph, index) => (
                  <p key={index} className="whitespace-pre-line">
                    {paragraph}
                  </p>
                ))}
              </div>

              {/* Quote box inside modal */}
              <div className="mt-8 rounded-2xl border border-secondary/20 bg-secondary/5 p-5">
                <div className="flex items-start gap-3">
                  <Sparkles size={20} className="shrink-0 text-secondary mt-0.5" />
                  <p className="text-sm italic text-primary">
                    &ldquo;Dengan semangat peningkatan kualitas yang berkesinambungan, SD Negeri Kedundung 2 senantiasa berupaya mengoptimalkan layanan pendidikan secara holistik demi mencetak generasi yang berkarakter, kompeten, dan berintegritas.&rdquo;
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end border-t border-border bg-surface px-6 py-4 sm:px-8">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white! transition-colors hover:bg-primary-light"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
