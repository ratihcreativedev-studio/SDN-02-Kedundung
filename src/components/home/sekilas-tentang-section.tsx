import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Award, BookOpen, Compass, HeartHandshake, Sparkles } from "lucide-react";

import initialProfile from "@/data/school-profile.json";
import { schoolProfileService } from "@/features/school-profile/services";

export async function SekilasTentangSection() {
  const profile = await schoolProfileService.getProfile().catch(() => null);
  const data = profile ?? initialProfile;

  // Extract first 1 or 2 paragraphs for concise summary
  const paragraphs = (data.description || initialProfile.description)
    .split(/\n\s*\n/)
    .filter(Boolean);
  const summaryParagraph = paragraphs[0] || initialProfile.description;

  const highlights = [
    {
      icon: BookOpen,
      title: "Pembelajaran Bermakna",
      desc: "Kurikulum adaptif dan menyenangkan yang menumbuhkan nalar kritis siswa.",
    },
    {
      icon: HeartHandshake,
      title: "Karakter 7 KAIH",
      desc: "Pembiasaan harian terstruktur untuk membentuk akhlak mulia dan disiplin.",
    },
    {
      icon: Award,
      title: "Prestasi & Bakat",
      desc: "Wadah ekstrakurikuler seni, olahraga, pramuka, dan keagamaan BTQ Ning Ita.",
    },
    {
      icon: Compass,
      title: "Peduli Lingkungan",
      desc: "Membangun kecintaan pada lingkungan sekolah yang asri, sehat, dan ramah anak.",
    },
  ];

  return (
    <section id="sekilas" className="relative scroll-mt-20 bg-surface py-20 lg:py-24">
      {/* Background glow accent */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/4 -left-40 h-80 w-80 rounded-full bg-secondary/10 blur-3xl" />
        <div className="absolute bottom-10 right-0 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
          {/* Left Column: Narrative & Highlights */}
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-secondary/30 bg-secondary/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-secondary">
              <Sparkles size={14} />
              <span>Sekilas Tentang Sekolah</span>
            </div>

            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-primary sm:text-4xl lg:text-5xl">
              SD Negeri Kedundung 2
            </h2>

            <p className="mt-2 text-lg font-medium text-secondary">
              Mendidik Generasi Berkarakter, Cerdas, dan Berprestasi
            </p>

            <p className="mt-5 text-base leading-relaxed text-text-secondary sm:text-lg">
              {summaryParagraph}
            </p>

            {/* Highlights Grid */}
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {highlights.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div
                    key={idx}
                    className="flex items-start gap-3.5 rounded-xl border border-border/70 bg-white p-4 shadow-xs transition-all hover:border-secondary/40 hover:shadow-sm"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon size={20} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-primary">
                        {item.title}
                      </h3>
                      <p className="mt-1 text-xs leading-relaxed text-text-secondary">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* CTA Button to Full School Profile */}
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link
                href="/tentang-sekolah"
                className="group inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-white! shadow-md shadow-primary/20 transition-all duration-200 hover:bg-primary-light hover:shadow-lg"
              >
                <span>Lihat Profil & Visi Misi Lengkap</span>
                <ArrowRight
                  size={16}
                  className="transition-transform group-hover:translate-x-1"
                />
              </Link>

              <Link
                href="/gerakan-7kaih"
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-white px-5 py-3.5 text-sm font-semibold text-text-primary transition-all duration-200 hover:border-primary/30 hover:bg-surface-alt"
              >
                <span>Program 7 KAIH</span>
              </Link>
            </div>
          </div>

          {/* Right Column: Headmaster Card */}
          <div className="lg:col-span-5">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Card Container */}
              <div className="group relative overflow-hidden rounded-3xl border border-border/80 bg-white p-4 shadow-xl transition-all duration-300 hover:shadow-2xl sm:p-6">
                <div className="relative aspect-4/5 w-full overflow-hidden rounded-2xl bg-surface-alt">
                  <Image
                    src="/images/kepala-sekolah.jpeg"
                    alt="Kepala Sekolah SDN Kedundung 2"
                    fill
                    sizes="(max-width: 1024px) 100vw, 40vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary-dark/80 via-transparent to-transparent" />
                  
                  {/* Floating Badge on Image */}
                  <div className="absolute bottom-4 left-4 right-4 rounded-xl bg-white/95 p-3.5 backdrop-blur-md shadow-md">
                    <p className="text-xs font-semibold uppercase tracking-wider text-secondary">
                      Kepala Sekolah
                    </p>
                    <h3 className="text-base font-bold text-primary">
                      Yatik Hartini, S.Pd, M.Pd
                    </h3>
                    <p className="text-xs text-text-secondary">
                      SD Negeri Kedundung 2 Kota Mojokerto
                    </p>
                  </div>
                </div>

                <div className="mt-5 rounded-2xl bg-surface-alt p-4">
                  <p className="text-xs italic leading-relaxed text-text-secondary text-center">
                    &ldquo;Mewujudkan murid yang berkarakter sebagai pembelajar sepanjang hayat yang peduli lingkungan, inovatif, dan berprestasi.&rdquo;
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
