import { cookies } from 'next/headers'
import { db } from '@/lib/db'
import { getVerifiedFirebaseEmail } from '@/lib/firebase/verify'

export async function getAdminEmail() {
  const cookieStore = await cookies()
  const token = cookieStore.get('sipanda-token')?.value
  if (!token) return null

  try {
    const email = await getVerifiedFirebaseEmail(token)
    const admin = await db.adminWhitelist.findUnique({ where: { email } })
    return admin ? email : null
  } catch {
    return null
  }
}

export async function requireAdminEmail() {
  const email = await getAdminEmail()
  if (!email) {
    throw new Error('Unauthorized')
  }

  return email
}
