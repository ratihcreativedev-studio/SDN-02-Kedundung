import { schoolProfileService } from '@/features/school-profile/services'
import { SchoolProfileForm } from '@/features/school-profile/components/SchoolProfileForm'
import { School } from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'

export const metadata = {
  title: 'Profil Sekolah | SIPANDA Admin',
}

export default async function ProfilPage() {
  const profile = await schoolProfileService.getProfile()

  return (
    <div className="max-w-3xl space-y-4 sm:space-y-6">
      <PageHeader
        title="Profil Sekolah"
        description="Ubah informasi dasar SDN Kedundung 2."
        icon={School}
        iconGradient="from-emerald-500 to-emerald-600"
      />

      <div className="section-card overflow-hidden animate-fade-in-up animate-delay-100">
        <SchoolProfileForm initialData={profile} />
      </div>
    </div>
  )
}
