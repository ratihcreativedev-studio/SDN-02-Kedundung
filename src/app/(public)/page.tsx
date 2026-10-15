import { HeroSection } from "@/components/home/hero-section";
import { PrestasiSection } from "@/components/home/prestasi-section";
import { TentangSection } from "@/components/home/tentang-section";
import { InformasiSection } from "@/components/home/informasi-section";

export const revalidate = 3600;

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <TentangSection />
      <PrestasiSection />
      <InformasiSection />
    </>
  );
}
