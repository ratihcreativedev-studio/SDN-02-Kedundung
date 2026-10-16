'use server'

import { revalidatePath } from 'next/cache'
import { requireAdminEmail } from '@/lib/auth'
import { achievementSchema } from './schemas'
import { achievementService } from './services'
import { storageService } from '@/services/storage.service'

export async function createAchievementAction(formData: FormData) {
  try {
    await requireAdminEmail()
    
    // We ignore imageUrl during schema validation since we handle it manually
    const parsed = achievementSchema.safeParse(Object.fromEntries(formData))
    if (!parsed.success) return { error: 'Data tidak valid' }

    const image = formData.get('image') as File | null
    let imageUrl = ''

    if (image && image.size > 0) {
      imageUrl = await storageService.uploadImage(image, 'prestasi')
    }

    await achievementService.create({ ...parsed.data, imageUrl })
    revalidatePath('/admin/prestasi')
    revalidatePath('/prestasi')
    revalidatePath('/data-siswa', 'layout')
    return { success: true }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Terjadi kesalahan' }
  }
}

export async function updateAchievementAction(id: string, formData: FormData) {
  try {
    await requireAdminEmail()
    const parsed = achievementSchema.safeParse(Object.fromEntries(formData))
    if (!parsed.success) return { error: 'Data tidak valid' }

    const existingData = await achievementService.getById(id)
    if (!existingData) return { error: 'Data tidak ditemukan' }

    const image = formData.get('image') as File | null
    let imageUrl = existingData.imageUrl || ''

    if (image && image.size > 0) {
      imageUrl = await storageService.uploadImage(image, 'prestasi')
    }

    try {
      await achievementService.update(id, { ...parsed.data, imageUrl })
    } catch (error) {
      if (imageUrl && imageUrl !== existingData.imageUrl) await storageService.deleteImage(imageUrl).catch(() => {})
      throw error
    }
    if (existingData.imageUrl && imageUrl !== existingData.imageUrl) await storageService.deleteImage(existingData.imageUrl).catch(() => {})
    revalidatePath('/admin/prestasi')
    revalidatePath('/prestasi')
    revalidatePath('/data-siswa', 'layout')
    return { success: true }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Terjadi kesalahan' }
  }
}

export async function deleteAchievementAction(id: string) {
  try {
    await requireAdminEmail()
    const existingData = await achievementService.getById(id)
    
    await achievementService.delete(id)
    if (existingData?.imageUrl) await storageService.deleteImage(existingData.imageUrl).catch(() => {})
    revalidatePath('/admin/prestasi')
    revalidatePath('/prestasi')
    revalidatePath('/data-siswa', 'layout')
    return { success: true }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Terjadi kesalahan' }
  }
}
