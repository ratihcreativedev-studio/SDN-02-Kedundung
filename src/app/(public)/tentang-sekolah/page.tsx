import Link from "next/link";
import {
  ArrowRight,
  Award,
  Eye,
  Home,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Sparkles,
  Target,
} from "lucide-react";

import initialProfile from "@/data/school-profile.json";
import { schoolProfileService } from "@/features/school-profile/services";
import { SchoolProfileSection } from "@/components/tentang-sekolah/profile-section";

export const revalidate = 3600;

export const metadata = {
  title: "Tentang Sekolah & Visi Misi | SIPANDA - SDN Kedundung 2",
  description:
    "Profil lengkap, visi, misi, dan program pembiasaan karakter SD Negeri Kedundung 2 Kota Mojokerto.",
};

export default async function TentangSekolahPage() {
  const profile = await schoolProfileService.getProfile().catch((error) => {
    console.error("Gagal memuat profil sekolah dari database:", error);
    return null;
  });

  const data = profile ?? initialProfile;
  const descriptionParagraphs = (data.description || initialProfile.description)
    .split(/\n\s*\n/)
    .filter(Boolean);

  const missions = (data.mission || initialProfile.mission)
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);

  const habitPrograms = [
    {
      title: "Jumat Berisi Ning Aksi",
      desc: "Kegiatan aksi nyata kebersihan, kreasi seni, olahraga, dan kepedulian lingkungan setiap pekan.",
      badge: "Pembiasaan Sehat",
    },
    {
      title: "BTQ Ning Ita di Sekolah",
      desc: "Penguatan literasi Al-Qur'an dan nilai religius yang membimbing murid sejak dini.",
      badge: "Karakter Religius",
    },
    {
      title: "Program KITA & Mager Bersama",
      desc: "Membangun gotong royong, keakraban antar-siswa, serta toleransi dalam keragaman.",
      badge: "Gotong Royong",
    },
    {
      title: "Gerakan Laciku",
      desc: "Latihan kemandirian menjaga kebersihan laci, kelas, dan lingkungan belajar masing-masing.",
      badge: "Kemandirian",
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-16">
      {/* Hero Header - Flush with navbar, no gap */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary-dark via-primary to-primary-light pt-28 pb-20 text-white sm:pt-32 lg:pt-36 lg:pb-28">
        {/* Glow accents */}
        <div className="pointer-events-none absolute inset-0 -z-0">
          <div className="absolute top-10 left-1/3 h-72 w-72 rounded-full bg-secondary/15 blur-3xl" />
          <div className="absolute bottom-0 right-10 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="mb-6 flex items-center gap-2 text-xs font-medium text-white/70 sm:text-sm">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 transition-colors hover:text-white"
            >
              <Home size={14} />
              <span>Beranda</span>
            </Link>
            <span>/</span>
            <span className="text-secondary-light">Tentang Sekolah & Visi Misi</span>
          </nav>

          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-secondary-light backdrop-blur-xs">
              <Sparkles size={14} />
              <span>Profil Lembaga Pendidikan</span>
            </div>

            <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl">
              SD Negeri Kedundung 2
            </h1>

            <p className="mt-4 text-base leading-relaxed text-white/85 sm:text-lg lg:text-xl">
              Institusi pendidikan dasar di Kota Mojokerto yang berdedikasi mencetak generasi berkarakter unggul, berprestasi, peduli lingkungan, dan adaptif terhadap masa depan.
            </p>

            {/* Quick stats pills */}
            <div className="mt-8 flex flex-wrap gap-3">
              <div className="flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-medium text-white backdrop-blur-xs sm:text-sm">
                <MapPin size={15} className="text-secondary" />
                <span>Kec. Magersari, Kota Mojokerto</span>
              </div>
              <div className="flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-medium text-white backdrop-blur-xs sm:text-sm">
                <ShieldCheck size={15} className="text-secondary" />
                <span>Ramah Anak & Berkarakter</span>
              </div>
              <div className="flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-medium text-white backdrop-blur-xs sm:text-sm">
                <Award size={15} className="text-secondary" />
                <span>Unggul Akademik & Ekstrakurikuler</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="relative -mt-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Headmaster & Line Clamped School Narrative Card */}
        <SchoolProfileSection
          descriptionParagraphs={descriptionParagraphs}
          organization={data.organization || initialProfile.organization}
        />

        {/* Visi & Misi Section - Single Grid for dynamic content length */}
        <section className="mt-16 sm:mt-24">
          <div className="text-center">
            <span className="inline-block rounded-full bg-secondary/15 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-secondary">
              Arah & Tujuan
            </span>
            <h2 className="mt-3 text-3xl font-extrabold text-primary sm:text-4xl">
              Visi & Misi Sekolah
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-base text-text-secondary sm:text-lg">
              Landasan utama yang memandu setiap langkah pendidik dan peserta didik SDN Kedundung 2 dalam meraih prestasi bermartabat.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-8">
            {/* Visi Card - Full Width */}
            <div className="rounded-3xl border border-secondary/30 bg-gradient-to-br from-white via-surface to-secondary/5 p-6 shadow-md sm:p-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-secondary text-white shadow-md shadow-secondary/30">
                    <Eye size={28} />
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-widest text-secondary">
                      Visi Sekolah
                    </span>
                    <h3 className="text-2xl font-bold text-primary">
                      Arah & Cita-Cita Kami
                    </h3>
                  </div>
                </div>
                <div className="inline-flex items-center gap-2 self-start rounded-full bg-secondary/10 px-3.5 py-1 text-xs font-semibold text-secondary sm:self-auto">
                  <Sparkles size={14} />
                  <span>Profil Pelajar Pancasila</span>
                </div>
              </div>

              <blockquote className="mt-6 rounded-2xl border-l-4 border-secondary bg-white p-6 shadow-xs">
                <p className="text-lg font-bold leading-relaxed text-primary sm:text-xl lg:text-2xl">
                  &ldquo;{data.vision || initialProfile.vision}&rdquo;
                </p>
              </blockquote>
            </div>

            {/* Misi Card - Full Width with 2-Column Responsive Items */}
            <div className="rounded-3xl border border-border bg-white p-6 shadow-md sm:p-8">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-white shadow-md shadow-primary/30">
                  <Target size={28} />
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-secondary">
                    Misi Sekolah
                  </span>
                  <h3 className="text-2xl font-bold text-primary">
                    Langkah-Langkah Strategis
                  </h3>
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {missions.map((mission, idx) => (
                  <div
                    key={idx}
                    className="group flex items-start gap-4 rounded-2xl border border-border/70 bg-surface-alt/50 p-5 transition-all hover:border-primary/30 hover:bg-white hover:shadow-sm"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-sm font-extrabold text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                      {idx + 1}
                    </span>
                    <p className="pt-0.5 text-sm leading-relaxed text-text-secondary group-hover:text-text-primary sm:text-base">
                      {mission}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Program Pembiasaan Karakter */}
        <section className="mt-16 sm:mt-24">
          <div className="text-center">
            <span className="inline-block rounded-full bg-primary/10 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-primary">
              Budaya Sekolah
            </span>
            <h2 className="mt-3 text-3xl font-extrabold text-primary sm:text-4xl">
              Program Inovasi & Pembiasaan
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-base text-text-secondary sm:text-lg">
              Membangun karakter anak Indonesia hebat melalui aksi nyata sehari-hari di lingkungan sekolah.
            </p>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {habitPrograms.map((prog, i) => (
              <div
                key={i}
                className="group flex flex-col justify-between rounded-2xl border border-border bg-white p-6 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-secondary/40 hover:shadow-lg"
              >
                <div>
                  <span className="inline-block rounded-full bg-secondary/15 px-3 py-1 text-[11px] font-semibold text-secondary">
                    {prog.badge}
                  </span>
                  <h3 className="mt-4 text-lg font-bold text-primary">
                    {prog.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                    {prog.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Identity & Contact Info Card with 2-line Email */}
        <section className="mt-16 rounded-3xl border border-border bg-white p-8 shadow-lg sm:p-12">
          <div className="grid gap-8 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-5">
              <span className="inline-block rounded-full bg-secondary/15 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-secondary">
                Informasi Resmi
              </span>
              <h2 className="mt-3 text-2xl font-extrabold text-primary sm:text-3xl">
                Alamat & Kontak Sekolah
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-text-secondary sm:text-base">
                SD Negeri Kedundung 2 terbuka untuk komunikasi, masukan, serta koordinasi pendidikan bersama orang tua dan masyarakat.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/gerakan-7kaih"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-white! shadow-sm transition-colors hover:bg-primary-light"
                >
                  <span>Gerakan 7 KAIH</span>
                  <ArrowRight size={14} />
                </Link>
                <Link
                  href="/prestasi"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-surface-alt px-4 py-2.5 text-xs font-semibold text-text-primary transition-colors hover:bg-white"
                >
                  <span>Prestasi Siswa</span>
                </Link>
                <Link
                  href="/tata-tertib"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-surface-alt px-4 py-2.5 text-xs font-semibold text-text-primary transition-colors hover:bg-white"
                >
                  <span>Tata Tertib</span>
                </Link>
              </div>
            </div>

            <div className="space-y-4 lg:col-span-7">
              <div className="flex items-start gap-4 rounded-2xl border border-border/70 bg-surface-alt/60 p-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <MapPin size={22} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-primary">Lokasi Sekolah</h4>
                  <p className="mt-1 text-xs leading-relaxed text-text-secondary sm:text-sm">
                    {data.address || initialProfile.address}
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-start gap-4 rounded-2xl border border-border/70 bg-surface-alt/60 p-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-secondary/15 text-secondary">
                    <Phone size={22} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-bold text-primary">Telepon</h4>
                    <p className="mt-1 text-xs text-text-secondary sm:text-sm">
                      {data.contactPhone || initialProfile.contactPhone}
                    </p>
                  </div>
                </div>

                {/* Email with 2 lines to prevent escaping card */}
                <div className="flex items-start gap-4 rounded-2xl border border-border/70 bg-surface-alt/60 p-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Mail size={22} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-bold text-primary">Email Resmi</h4>
                    <p className="mt-1 text-xs leading-snug text-text-secondary sm:text-sm break-all">
                      sdnkedundung2mojokerto
                      <br />
                      @gmail.com
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
