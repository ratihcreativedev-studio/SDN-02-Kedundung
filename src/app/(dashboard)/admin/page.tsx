import { getDashboardSummary } from '@/features/dashboard/queries'
import { FileText, GraduationCap, Trophy, Users, LayoutDashboard, TrendingUp } from 'lucide-react'

export const metadata = {
  title: 'Dashboard Admin | SIPANDA',
}

export default async function DashboardPage() {
  const { counts, announcements } = await getDashboardSummary()

  const stats = [
    { name: 'Total Siswa', value: counts.students, icon: GraduationCap, gradient: 'from-emerald-500 to-teal-600', bg: 'bg-emerald-50', text: 'text-emerald-600' },
    { name: 'Total Kelas', value: counts.classes, icon: Users, gradient: 'from-violet-500 to-purple-600', bg: 'bg-violet-50', text: 'text-violet-600' },
    { name: 'Mata Pelajaran', value: counts.subjects, icon: FileText, gradient: 'from-amber-500 to-orange-600', bg: 'bg-amber-50', text: 'text-amber-600' },
    { name: 'Prestasi', value: counts.achievements, icon: Trophy, gradient: 'from-rose-500 to-pink-600', bg: 'bg-rose-50', text: 'text-rose-600' },
    { name: 'Pengumuman', value: counts.announcements, icon: FileText, gradient: 'from-blue-500 to-indigo-600', bg: 'bg-blue-50', text: 'text-blue-600' },
  ]

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in-up">
      {/* Hero */}
      <div className="page-hero">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl bg-linear-to-br from-primary-light to-primary shadow-lg shadow-primary/20">
            <LayoutDashboard size={20} className="text-white sm:hidden" />
            <LayoutDashboard size={24} className="text-white hidden sm:block" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-primary sm:text-3xl lg:text-4xl">
              Dashboard
            </h1>
            <p className="text-xs text-text-secondary sm:text-sm mt-0.5 sm:mt-1">
              Ringkasan statistik SDN Kedundung 2
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid - 2 cols on mobile, 3 on tablet+  */}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-4 md:grid-cols-3 xl:grid-cols-5">
        {stats.map((stat, index) => (
          <div
            key={stat.name}
            className={`stat-card animate-fade-in-up`}
            style={{ animationDelay: `${index * 0.06}s` }}
          >
            <div className={`flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl bg-linear-to-br ${stat.gradient} shadow-sm`}>
              <stat.icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] sm:text-xs font-medium text-text-muted leading-tight">{stat.name}</p>
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-primary mt-0.5">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Announcements */}
      <div className="section-card overflow-hidden animate-fade-in-up animate-delay-500">
        <div className="flex items-center gap-2.5 p-3.5 sm:p-5 lg:p-6 border-b border-border/50">
          <div className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-lg sm:rounded-xl bg-primary/8">
            <TrendingUp size={16} className="text-primary sm:hidden" />
            <TrendingUp size={18} className="text-primary hidden sm:block" />
          </div>
          <h2 className="text-base sm:text-lg font-bold text-primary">Pengumuman Terbaru</h2>
        </div>

        <div className="p-3.5 sm:p-5 lg:p-6">
          {announcements.length === 0 ? (
            <div className="empty-state">
              <FileText className="h-8 w-8 sm:h-10 sm:w-10 text-text-muted mb-2.5" />
              <p className="text-sm font-medium text-text-secondary">Belum ada pengumuman</p>
              <p className="text-xs text-text-muted mt-1">Pengumuman baru akan muncul di sini.</p>
            </div>
          ) : (
            <div className="space-y-2.5 sm:space-y-3">
              {announcements.map((item) => (
                <div
                  key={item.id}
                  className="group flex flex-col gap-2 rounded-xl border border-border/60 bg-white p-3 sm:p-4 transition-all hover:border-primary/20 hover:shadow-sm sm:flex-row sm:items-start sm:justify-between"
                >
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-primary group-hover:text-primary-light transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-text-secondary mt-1 leading-relaxed line-clamp-2">
                      {item.content}
                    </p>
                  </div>
                  <span className="shrink-0 self-start inline-flex items-center rounded-lg bg-surface-alt px-2 py-0.5 text-[10px] sm:text-xs font-medium text-text-muted border border-border/50">
                    {new Date(item.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
