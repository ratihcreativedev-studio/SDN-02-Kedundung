'use server'

import { cookies } from 'next/headers'
import { db } from '@/lib/db'
import { FirebaseVerificationError, getVerifiedFirebaseEmail } from '@/lib/firebase/verify'

export async function setSessionAction(idToken: string, photoURL?: string | null) {
  try {
    const email = await getVerifiedFirebaseEmail(idToken)
    const admin = await db.adminWhitelist.findUnique({ where: { email } })

    if (!admin) {
      return { error: 'Akses ditolak: Email Anda belum terdaftar sebagai admin.' }
    }

    // Simpan profil sebelum menerbitkan sesi agar kegagalan database tidak meninggalkan sesi parsial.
    await db.profile.upsert({
      where: { id: email },
      create: {
        id: email,
        name: admin.name ?? email,
        role: admin.role,
        position: admin.role,
      },
      update: {
        name: admin.name ?? email,
        role: admin.role,
        position: admin.role,
      },
    })

    const cookieStore = await cookies()
    cookieStore.delete('sipanda-auth')
    cookieStore.set('sipanda-token', idToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60,
      path: '/',
    })
    if (photoURL) {
      cookieStore.set('sipanda-photo', photoURL, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60,
        path: '/',
      })
    } else {
      cookieStore.delete('sipanda-photo')
    }

    return { success: true }
  } catch (error) {
    if (error instanceof FirebaseVerificationError) {
      return { error: error.message }
    }
    console.error('Gagal menyiapkan sesi admin.')
    return { error: 'Gagal menyiapkan sesi admin. Silakan coba kembali.' }
  }
}

export async function logoutAction() {
  const cookieStore = await cookies()
  cookieStore.delete('sipanda-auth')
  cookieStore.delete('sipanda-token')
  cookieStore.delete('sipanda-photo')
}
