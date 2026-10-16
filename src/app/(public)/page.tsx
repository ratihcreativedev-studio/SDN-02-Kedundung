import { HeroSection } from "@/components/home/hero-section";
import { SekilasTentangSection } from "@/components/home/sekilas-tentang-section";
import { PrestasiSection } from "@/components/home/prestasi-section";
import { InformasiSection } from "@/components/home/informasi-section";

export const revalidate = 3600;

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <SekilasTentangSection />
      <PrestasiSection />
      <InformasiSection />
    </>
  );
}
