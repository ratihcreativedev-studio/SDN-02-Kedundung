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
    <section
      className="relative min-h-screen overflow-hidden bg-linear-to-b from-primary-dark via-primary to-primary-light pt-20"
    >
      {/* Content */}
      <div className="grid min-h-[calc(100svh-5rem)] w-full lg:grid-cols-[1.2fr_1fr]">
        <div className="flex min-w-0 items-center px-4 py-12 sm:px-8 lg:px-14 lg:py-16 xl:pl-24">
          <div className="w-full max-w-2xl">
          {/* Badge */}
          <div className="animate-fade-in-up mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 opacity-0">
            <Star size={14} className="shrink-0 text-secondary" />
            <span className="text-sm font-medium text-white">
              SD Negeri Kedundung 2 - Kota Mojokerto
            </span>
          </div>

          {/* Heading */}
          <h1 className="animate-fade-in-up opacity-0 animate-delay-100">
            <span className="block text-4xl font-black tracking-tight text-white min-[380px]:text-5xl sm:text-6xl md:text-7xl lg:text-8xl">
              SIPANDA
            </span>
            <span className="mt-2 block text-lg font-medium text-secondary-light sm:text-xl md:text-2xl">
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
          <div className="animate-fade-in-up animate-delay-300 mt-8 flex flex-col gap-4 opacity-0 sm:flex-row sm:flex-wrap">
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
              className="flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-3.5 font-medium text-white! transition-all hover:bg-white/20 sm:justify-start sm:px-6"
            >
              <MessageSquare size={18} />
              Konsultasi & Pengaduan
            </Link>
          </div>

          {/* Scroll indicator */}
          <div className="animate-fade-in-up animate-delay-500 mt-14 opacity-0">
            <a
              href="#sekilas"
              className="inline-flex flex-col items-center text-white/70 transition-colors hover:text-white"
            >
              <span className="mb-2 text-xs">Scroll</span>
              <ChevronDown size={20} className="animate-bounce" />
            </a>
          </div>
          </div>
        </div>
        <div className="flex min-w-0 items-center justify-center px-4 py-12 sm:px-8 lg:px-10 lg:py-16 xl:pr-24">
          <div className="animate-fade-in-up animate-delay-200 w-full max-w-md opacity-0 lg:max-w-xl">
          <Image
            src="/images/mascott.webp"
            alt="Maskot panda SIPANDA SD Negeri Kedundung 2"
            width={1000}
            height={1000}
            priority
            sizes="(min-width: 1024px) 42vw, (min-width: 512px) 448px, calc(100vw - 32px)"
            className="h-auto w-full rounded-md object-contain"
          />
          </div>
        </div>
      </div>
    </section>
  );
}
