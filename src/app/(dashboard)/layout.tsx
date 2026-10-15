import { DashboardShell } from '@/components/layout/dashboard-shell'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { requireAdminEmail } from '@/lib/auth'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const photoSession = cookieStore.get('sipanda-photo')

  let email: string
  try {
    email = await requireAdminEmail()
  } catch {
    redirect('/login')
  }

  return <DashboardShell email={email} photoURL={photoSession?.value}>{children}</DashboardShell>
}
