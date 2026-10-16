import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ChevronDown,
  GraduationCap,
  MessageSquare,
  Star,
} from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative flex min-h-screen items-center overflow-hidden">
      {/* Background Image */}
      <Image
        src="/images/hero-img.jpg"
        alt="SDN Kedundung 2"
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />

      {/* Dark overlay on entire image */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Gradient overlay from left (primary color) for text readability */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to right, rgba(20, 40, 68, 0.92) 0%, rgba(30, 58, 95, 0.80) 35%, rgba(30, 58, 95, 0.40) 60%, transparent 80%)",
        }}
      />

      {/* Content */}
      <div className="relative z-10 w-full px-4 pb-16 pt-28 sm:px-8 lg:px-14 xl:px-24">
        <div className="max-w-2xl">
          {/* Badge */}
          <div className="animate-fade-in-up mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 opacity-0 backdrop-blur-sm">
            <Star size={14} className="text-secondary" />
            <span className="text-sm font-medium text-white">
              SD Negeri Kedundung 2 - Kota Mojokerto
            </span>
          </div>

          {/* Heading */}
          <h1 className="animate-fade-in-up opacity-0 animate-delay-100">
            <span className="block text-4xl font-black tracking-tight text-white min-[380px]:text-5xl sm:text-6xl md:text-7xl lg:text-8xl">
              SIPANDA
            </span>
            <span className="mt-2 block text-lg font-medium text-secondary sm:text-xl md:text-2xl">
              Sistem Informasi Pendidikan Anak SD
            </span>
          </h1>

          {/* Description */}
          <p className="animate-fade-in-up animate-delay-200 mt-5 max-w-xl text-base leading-relaxed text-white/85 opacity-0 sm:text-lg">
            Platform digital untuk pengelolaan data siswa, absensi, nilai, dan
            pembentukan karakter melalui{" "}
            <span className="font-semibold text-secondary-light">
              Gerakan 7 Kebiasaan Anak Indonesia Hebat
            </span>
          </p>

          {/* CTAs */}
          <div className="animate-fade-in-up animate-delay-300 mt-8 flex flex-col gap-4 opacity-0 sm:flex-row">
            <Link
              href="#sekilas"
              className="group flex items-center justify-center gap-2 rounded-xl bg-secondary px-5 py-3.5 font-semibold text-white! shadow-lg shadow-secondary/20 transition-all duration-200 hover:bg-secondary-light hover:shadow-xl hover:shadow-secondary/30 sm:justify-start sm:px-6"
            >
              <GraduationCap size={20} />
              Sekilas Tentang Sekolah
              <ArrowRight
                size={16}
                className="transition-transform group-hover:translate-x-0.5"
              />
            </Link>
            <Link
              href="https://bit.ly/KotakSaranSDNKedundung2"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-3.5 font-medium text-white! backdrop-blur-sm transition-all hover:bg-white/20 sm:justify-start sm:px-6"
            >
              <MessageSquare size={18} />
              Konsultasi & Pengaduan
            </Link>
          </div>

          {/* Scroll indicator */}
          <div className="animate-fade-in-up animate-delay-500 mt-14 opacity-0">
            <a
              href="#sekilas"
              className="inline-flex flex-col items-center text-white/50 transition-colors hover:text-white"
            >
              <span className="mb-2 text-xs">Scroll</span>
              <ChevronDown size={20} className="animate-bounce" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
