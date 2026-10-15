import Image from "next/image";
import { Eye, Target } from "lucide-react";

import initialProfile from "@/data/school-profile.json";
import { schoolProfileService } from "@/features/school-profile/services";

export async function TentangSection() {
  const profile = await schoolProfileService.getProfile();
  const data = profile ?? initialProfile;
  const missions = (data.mission || '').split('\n').map(point => point.trim()).filter(Boolean);
  return (
    <section id="visi-misi" className="bg-white/70 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Top Part: Profil Singkat & Headmaster Photo */}
        <div className="grid gap-12 lg:grid-cols-5 lg:items-center">
          {/* Profil Singkat (60% -> 3/5 cols) */}
          <div className="lg:col-span-3">
            <span className="mb-3 inline-block rounded-full bg-primary/5 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
              Profil Sekolah
            </span>
            <h2 className="mb-6 text-3xl font-bold text-primary sm:text-4xl">
              SD Negeri Kedundung 2
            </h2>
            <div className="space-y-4 text-lg text-text-secondary leading-relaxed">
              {data.description.split(/\n\s*\n/).map((paragraph, index) => <p key={index} className="whitespace-pre-line">{paragraph}</p>)}
            </div>
          </div>

          {/* Headmaster Photo (40% -> 2/5 cols) */}
          <div className="lg:col-span-2">
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl bg-surface-alt shadow-xl border border-border">
              <Image
                src="/images/kepala-sekolah.jpeg"
                alt="Kepala Sekolah SDN Kedundung 2"
                fill
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover"
              />
            </div>
            <div className="mt-6 text-center">
              <h3 className="text-xl font-bold text-primary">Yatik Hartini, S.Pd, M.Pd</h3>
              <p className="mt-1 text-sm font-medium text-text-secondary">Kepala Sekolah SDN Kedundung 2</p>
            </div>
          </div>
        </div>

        {/* Bottom Part: Visi & Misi */}
        <div className="mt-20 border-t border-border pt-16">
          <div className="mb-12 text-center">
            <span className="mb-3 inline-block rounded-full bg-primary/5 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
              Visi & Misi
            </span>
            <h2 className="text-3xl font-bold text-primary sm:text-4xl">
              Arah & Tujuan Kami
            </h2>
          </div>

          <div className="grid gap-12 md:grid-cols-2 md:divide-x md:divide-border">
            {/* Visi */}
            <div className="md:pr-12">
              <div className="mb-6 flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Eye size={28} />
                </div>
                <h3 className="text-2xl font-bold text-primary">Visi</h3>
              </div>
              <p className="text-lg font-medium leading-relaxed text-text-secondary">
                {data.vision}
              </p>
            </div>

            {/* Misi */}
            <div className="md:pl-12">
              <div className="mb-6 flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-secondary/10 text-secondary">
                  <Target size={28} />
                </div>
                <h3 className="text-2xl font-bold text-primary">Misi</h3>
              </div>
              <ul className="space-y-4">
                {missions.map((point, i) => (
                  <li key={point} className="flex items-start gap-4">
                    <span className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                      {i + 1}
                    </span>
                    <span className="text-base leading-relaxed text-text-secondary">
                      {point}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
