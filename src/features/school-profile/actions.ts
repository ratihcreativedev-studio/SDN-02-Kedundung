'use server'

import { revalidatePath } from 'next/cache'
import { requireAdminEmail } from '@/lib/auth'
import { schoolProfileSchema } from './schemas'
import { schoolProfileService } from './services'

export async function updateSchoolProfileAction(formData: FormData) {
  try {
    await requireAdminEmail()
    const parsed = schoolProfileSchema.safeParse(Object.fromEntries(formData))
    if (!parsed.success) {
      return { error: 'Data tidak valid' }
    }
    await schoolProfileService.updateProfile(parsed.data)
    revalidatePath('/admin/profil')
    revalidatePath('/')
    revalidatePath('/tentang-sekolah')
    revalidatePath('/(public)', 'layout')
    return { success: true }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Terjadi kesalahan' }
  }
}
