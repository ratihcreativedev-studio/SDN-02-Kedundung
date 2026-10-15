import { LoginForm } from '@/features/auth/components/LoginForm'
import { redirect } from 'next/navigation'
import { getAdminEmail } from '@/lib/auth'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  if (await getAdminEmail()) {
    redirect('/admin')
  }
  const { error } = await searchParams
  const initialError = error === 'auth-failed'
    ? 'Autentikasi gagal atau Anda tidak memiliki akses.'
    : ''

  return (
    <main className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 px-4">
      <LoginForm initialError={initialError} />
    </main>
  )
}
