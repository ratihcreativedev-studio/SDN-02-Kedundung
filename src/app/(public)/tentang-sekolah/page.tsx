import { schoolProfileService } from '@/features/school-profile/services'

export const revalidate = 3600

export const metadata = {
  title: 'Tentang Sekolah | SIPANDA',
}

export default async function TentangSekolahPage() {
  const profile = await schoolProfileService.getProfile().catch((error) => {
    console.error('Gagal memuat profil sekolah dari database:', error)
    return null
  })
  const missions = profile?.mission?.split('\n').map((item) => item.trim()).filter(Boolean) ?? []

  return (
    <div className="page-shell">
      <div className="page-container">
        <section className="page-hero">
          <span className="page-eyebrow">Tentang Sekolah</span>
          <h1 className="page-title">SD Negeri Kedundung 2</h1>
          <p className="page-description whitespace-pre-line">
            {profile?.description ?? 'Profil sekolah belum diisi dari dashboard admin.'}
          </p>
        </section>

        <div className="grid gap-6 lg:grid-cols-2">
          <article className="rounded-2xl border border-border bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-wider text-secondary">Visi</p>
            <h2 className="mt-3 text-2xl font-bold text-primary">Arah Pendidikan</h2>
            <p className="mt-4 leading-relaxed text-text-secondary">
              {profile?.vision || 'Visi sekolah belum diisi.'}
            </p>
          </article>
          <article className="rounded-2xl border border-border bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-wider text-secondary">Misi</p>
            <h2 className="mt-3 text-2xl font-bold text-primary">Langkah Strategis</h2>
            {missions.length === 0 ? (
              <p className="mt-4 leading-relaxed text-text-secondary">Misi sekolah belum diisi.</p>
            ) : (
              <ul className="mt-4 space-y-3 text-text-secondary">
                {missions.map((mission) => (
                  <li key={mission} className="flex gap-3">
                    <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-secondary" />
                    <span>{mission}</span>
                  </li>
                ))}
              </ul>
            )}
          </article>
        </div>

        <article className="mt-6 rounded-2xl border border-border bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wider text-secondary">Struktur Organisasi</p>
          <p className="mt-4 whitespace-pre-line leading-relaxed text-text-secondary">
            {profile?.organization || 'Struktur organisasi belum diisi.'}
          </p>
        </article>
      </div>
    </div>
  )
}
