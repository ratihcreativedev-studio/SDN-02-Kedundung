export class FirebaseVerificationError extends Error {}

export async function getVerifiedFirebaseEmail(idToken: string) {
  const firebaseApiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY
  if (!firebaseApiKey) {
    throw new FirebaseVerificationError('Konfigurasi login belum tersedia. Hubungi pengelola sekolah.')
  }
  if (typeof idToken !== 'string' || !idToken.trim()) {
    throw new FirebaseVerificationError('Sesi Google tidak valid atau telah berakhir. Silakan masuk kembali.')
  }

  let response: Response
  try {
    response = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${firebaseApiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
        cache: 'no-store',
        signal: AbortSignal.timeout(10_000),
      }
    )
  } catch {
    throw new FirebaseVerificationError('Layanan login belum dapat dihubungi. Silakan coba kembali.')
  }

  if (!response.ok) {
    const failure = await response.json().catch(() => null) as { error?: { message?: string } } | null
    const code = failure?.error?.message
    if (code && ['INVALID_ID_TOKEN', 'TOKEN_EXPIRED', 'USER_NOT_FOUND', 'USER_DISABLED', 'INVALID_REFRESH_TOKEN'].includes(code)) {
      throw new FirebaseVerificationError('Sesi Google tidak valid atau telah berakhir. Silakan masuk kembali.')
    }
    throw new FirebaseVerificationError('Layanan verifikasi login bermasalah. Silakan coba kembali atau hubungi pengelola sekolah.')
  }

  const payload = (await response.json()) as { users?: Array<{ email?: string; emailVerified?: boolean }> }
  const user = payload.users?.[0]
  if (!user?.email || !user.emailVerified) {
    throw new FirebaseVerificationError('Email Google belum terverifikasi.')
  }

  return user.email
}
