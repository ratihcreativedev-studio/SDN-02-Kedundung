"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X, ChevronDown } from "lucide-react";

type NavItem = {
  href?: string;
  label: string;
  children?: { href: string; label: string }[];
};

const navItems: NavItem[] = [
  { href: "/", label: "Beranda" },
  { href: "/tentang-sekolah", label: "Tentang Sekolah" },
  { href: "/data-siswa", label: "Data Siswa" },
  {
    label: "Program Sekolah",
    children: [
      { href: "/prestasi", label: "Prestasi" },
      { href: "/gerakan-7kaih", label: "7 KAIH" },
      { href: "/tata-tertib", label: "Tata Tertib" },
    ],
  },
  { href: "/informasi", label: "Informasi" },
  { href: "/#kontak", label: "Kontak" },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [overTransparentHero, setOverTransparentHero] = useState(false);
  const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>({});
  const pathname = usePathname();

  useEffect(() => {
    const updateNavbarState = () => {
      setScrolled(window.scrollY > 20);

      const transparentHero = document.querySelector<HTMLElement>(
        "[data-transparent-navbar]"
      );

      if (!transparentHero) {
        setOverTransparentHero(false);
        return;
      }

      const heroRect = transparentHero.getBoundingClientRect();
      setOverTransparentHero(heroRect.top <= 80 && heroRect.bottom > 80);
    };

    updateNavbarState();
    window.addEventListener("scroll", updateNavbarState, { passive: true });
    window.addEventListener("resize", updateNavbarState);

    return () => {
      window.removeEventListener("scroll", updateNavbarState);
      window.removeEventListener("resize", updateNavbarState);
    };
  }, [pathname]);

  const isTransparentOverHero = overTransparentHero && !scrolled && !isOpen;
  const isSolidNav = (pathname === "/" || scrolled) && !isTransparentOverHero;

  const toggleDropdown = (label: string) => {
    setOpenDropdowns((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  return (
    <nav
      className={`fixed left-0 right-0 top-0 z-50 transition-all duration-300 ${isTransparentOverHero
        ? "bg-transparent"
        : isSolidNav
        ? "bg-white/90 shadow-sm backdrop-blur-xl"
        : pathname === "/"
          ? "bg-transparent"
          : "bg-primary/90 backdrop-blur-md"
        }`}
    >
      <div className="w-full px-4 sm:px-8 lg:px-14 xl:px-24">
        <div className="flex h-20 items-center justify-between transition-all duration-300">
          <Link href="/" className="group flex shrink-0 items-center gap-2.5 sm:gap-3">
            <div className="relative h-14 w-14 shrink-0 overflow-hidden transition-transform duration-300 group-hover:scale-105 sm:h-16 sm:w-16">
              <Image
                src="/images/logo-sdn2kedundung.png"
                alt="Logo SDN Kedundung 2"
                fill
                priority
                className="object-contain"
                sizes="64px"
              />
            </div>
            <div>
              <span
                className={`block text-lg font-bold tracking-tight transition-colors ${isSolidNav ? "text-primary" : "!text-white"
                  }`}
              >
                SIPANDA
              </span>
              <span
                className={`hidden text-xs leading-tight transition-colors sm:block ${isSolidNav ? "text-text-secondary" : "!text-white"
                  }`}
              >
                SDN Kedundung 2
              </span>
            </div>
          </Link>

          <div className="hidden items-center gap-1.5 lg:flex xl:gap-3">
            {navItems.map((item) => {
              const isActive = item.href
                ? pathname === item.href
                : item.children?.some((child) => pathname === child.href);
              let itemClass = "group relative flex items-center gap-2 px-3 xl:px-4 py-2.5 rounded-xl text-[14px] xl:text-[15px] font-semibold transition-all duration-300";

              if (isActive) {
                itemClass += isSolidNav || pathname === "/"
                  ? " bg-primary !text-white shadow-md shadow-primary/20"
                  : " bg-white/20 !text-white shadow-sm";
              } else {
                itemClass += isSolidNav || pathname === "/"
                  ? " text-text-secondary hover:bg-primary/5 hover:text-primary"
                  : " !text-white hover:bg-white/20";
              }

              if (item.children) {
                return (
                  <div key={item.label} className="group/dropdown relative">
                    <button className={itemClass}>
                      {item.label}
                      <ChevronDown size={14} className="transition-transform duration-300 group-hover/dropdown:rotate-180" />
                    </button>
                    <div className="absolute left-0 top-full hidden pt-2 group-hover/dropdown:block min-w-[220px]">
                      <div className="rounded-xl border border-border bg-white p-2 shadow-xl">
                        {item.children.map((child) => {
                          const isChildActive = pathname === child.href;
                          return (
                            <Link
                              key={child.href}
                              href={child.href}
                              className={`flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all ${isChildActive
                                ? "bg-primary/10 text-primary"
                                : "text-text-secondary hover:bg-primary/5 hover:text-primary"
                                }`}
                            >
                              {child.label}
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <Link
                  key={item.label}
                  href={item.href!}
                  className={itemClass}
                >
                  {item.label}
                </Link>
              );
            })}

            {/* Curhat Ning Ita CTA */}
            <Link
              href="https://curhatningita.lapor.go.id/"
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2 relative h-10 w-10 shrink-0 overflow-hidden transition-transform duration-300 hover:scale-105 rounded-xl border border-border bg-white p-1 flex items-center justify-center shadow-sm hover:shadow"
            >
              <Image
                src="/images/curhatningita.png"
                alt="Curhat Ning Ita"
                width={32}
                height={32}
                priority
                className="object-contain"
              />
            </Link>
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`rounded-lg p-2 transition-colors lg:hidden ${isSolidNav ? "text-primary hover:bg-surface-alt" : "!text-white hover:bg-white/10"
              }`}
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      <div
        className={`overflow-hidden transition-all duration-300 lg:hidden ${isOpen ? "max-h-[80vh] overflow-y-auto" : "max-h-0"
          }`}
      >
        <div className="mx-3 mb-4 mt-2 rounded-2xl border border-border bg-white shadow-xl sm:mx-6 lg:mx-8">
          <div className="space-y-1 px-3 py-3 sm:px-4">
            {navItems.map((item) => {
              const isActive = item.href
                ? pathname === item.href
                : item.children?.some((child) => pathname === child.href);

              if (item.children) {
                const isOpenMobile = openDropdowns[item.label] !== undefined ? openDropdowns[item.label] : isActive;
                return (
                  <div key={item.label} className="space-y-1">
                    <button
                      onClick={() => toggleDropdown(item.label)}
                      className={`flex w-full items-center justify-between gap-3 rounded-xl px-5 py-3.5 text-base font-semibold transition-all ${isActive
                        ? "bg-primary/10 text-primary"
                        : "text-text-secondary hover:bg-primary/5 hover:text-primary"
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        {item.label}
                      </div>
                      <ChevronDown size={18} className={`transition-transform duration-300 ${isOpenMobile ? "rotate-180" : ""}`} />
                    </button>
                    <div className={`space-y-1 overflow-hidden transition-all duration-300 ${isOpenMobile ? "max-h-96" : "max-h-0"}`}>
                      <div className="ml-8 space-y-1 border-l-2 border-border pl-4 pb-2">
                        {item.children.map((child) => {
                          const isChildActive = pathname === child.href;
                          return (
                            <Link
                              key={child.href}
                              href={child.href}
                              onClick={() => setIsOpen(false)}
                              className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${isChildActive
                                ? "bg-primary text-white!"
                                : "text-text-secondary hover:bg-primary/5 hover:text-primary"
                                }`}
                            >
                              {child.label}
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <Link
                  key={item.label}
                  href={item.href!}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 rounded-xl px-5 py-3.5 text-base font-semibold transition-all ${isActive
                    ? "bg-primary text-white!"
                    : "text-text-secondary hover:bg-primary/5 hover:text-primary"
                    }`}
                >
                  {item.label}
                </Link>
              );
            })}

            {/* Curhat Ning Ita Mobile CTA */}
            <div className="border-t border-border mt-3 pt-3 flex justify-center pb-2">
              <Link
                href="https://curhatningita.lapor.go.id/"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsOpen(false)}
                className="relative h-12 w-12 shrink-0 overflow-hidden transition-transform duration-300 hover:scale-105 rounded-xl border border-border bg-white p-1.5 shadow-sm flex items-center justify-center"
              >
                <Image
                  src="/images/curhatningita.png"
                  alt="Curhat Ning Ita"
                  width={36}
                  height={36}
                  priority
                  className="object-contain"
                />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
