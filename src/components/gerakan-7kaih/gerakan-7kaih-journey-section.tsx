import { ArrowRight, Star } from "lucide-react";

import { kebiasaan7Kaih } from "@/data";

export function Gerakan7KaihJourneySection() {
  return (
    <section className="relative overflow-hidden py-24">
      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="mb-20 text-center">
          <h2 className="text-3xl font-black text-primary sm:text-4xl">
            Perjalanan Hebat Sehari-hari
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-text-secondary">
            Tujuh langkah pembiasaan positif untuk masa depan yang lebih cerah
          </p>
        </div>

        <div className="relative">
          <div className="absolute bottom-8 left-8 top-4 -ml-[3px] w-1.5 rounded-full bg-border md:left-1/2" />

          <div className="space-y-16">
            {kebiasaan7Kaih.map((item, i) => {
              const Icon = item.icon;
              const isEven = i % 2 === 0;

              return (
                <div
                  key={item.title}
                  className={`group relative flex w-full items-center ${
                    isEven ? "md:justify-start" : "md:justify-end"
                  }`}
                >
                  <div
                    className={`absolute left-8 z-10 -ml-8 flex h-16 w-16 items-center justify-center rounded-2xl border-4 border-surface bg-gradient-to-br ${item.color} shadow-xl transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 md:left-1/2`}
                  >
                    <Icon size={28} className="text-white drop-shadow-md" />
                  </div>

                  <div
                    className={`ml-24 w-full transition-all duration-500 group-hover:-translate-y-1 md:ml-0 md:w-[45%] ${
                      isEven ? "md:pr-12 md:text-right" : "md:pl-12 md:text-left"
                    }`}
                  >
                    <div className="relative overflow-hidden rounded-3xl border border-border bg-white p-8 shadow-sm transition-all duration-300 group-hover:border-primary/20 group-hover:shadow-xl">
                      <div
                        className={`absolute top-0 h-full w-2 bg-gradient-to-b ${item.color} ${
                          isEven ? "right-0" : "left-0"
                        }`}
                      />
                      <div
                        className={`flex flex-col gap-3 ${
                          isEven ? "md:items-end" : "md:items-start"
                        }`}
                      >
                        <span className="rounded-full bg-surface-alt px-3 py-1 text-xs font-black uppercase tracking-wider text-text-muted">
                          Langkah {i + 1}
                        </span>
                        <h3 className="text-2xl font-black text-primary transition-colors group-hover:text-primary-light">
                          {item.title}
                        </h3>
                        <p className="text-base leading-relaxed text-text-secondary">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="relative mt-24 md:mt-32">
            <div className="absolute left-8 top-[-4rem] z-10 -ml-4 h-8 w-8 rounded-full border-4 border-surface bg-secondary shadow-lg animate-bounce md:left-1/2" />

            <div className="group relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-gradient-to-r from-primary to-primary-light p-10 text-center text-white shadow-2xl md:p-14">
              <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-secondary/20 blur-3xl transition-colors duration-500 group-hover:bg-secondary/30" />
              <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-primary-dark/40 blur-3xl" />

              <div className="relative z-10">
                <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md transition-transform duration-500 group-hover:scale-110">
                  <Star size={32} className="text-secondary" />
                </div>
                <h3 className="mb-4 text-3xl font-black md:text-4xl">
                  Pantau Perkembangan Anak
                </h3>
                <p className="mx-auto mb-10 max-w-xl text-lg leading-relaxed text-white/80">
                  Setiap langkah kecil adalah awal dari kebiasaan hebat. Isi
                  jurnal harian secara rutin untuk mendukung masa depan cerah
                  mereka.
                </p>
                <a
                  href="https://docs.google.com/forms/d/e/1FAIpQLSfmlUY6oM8-JIWhyRRqWVSpy1LWQhI3z_HzHOtVC-sxGcUK2A/viewform?usp=publish-editor"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group/btn inline-flex items-center gap-3 rounded-2xl bg-secondary px-10 py-5 text-lg font-black text-primary-dark shadow-xl shadow-secondary/20 transition-all duration-300 hover:-translate-y-1 hover:bg-secondary-light hover:shadow-2xl"
                >
                  Isi Jurnal Sekarang
                  <ArrowRight
                    size={20}
                    className="transition-transform group-hover/btn:translate-x-1"
                  />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
