'use server'

import { revalidatePath } from 'next/cache'
import { requireAdminEmail } from '@/lib/auth'
import { announcementSchema } from './schemas'
import { announcementService } from './services'
import { storageService } from '@/services/storage.service'

export async function createAnnouncementAction(formData: FormData) {
  try {
    const email = await requireAdminEmail()
    
    // Validate everything except thumbnail
    const parsed = announcementSchema.safeParse(Object.fromEntries(formData))
    if (!parsed.success) {
      return { error: 'Data tidak valid' }
    }

    const image = formData.get('image') as File | null
    let thumbnail = ''

    if (image && image.size > 0) {
      thumbnail = await storageService.uploadImage(image, 'pengumuman')
    }

    await announcementService.create({ ...parsed.data, thumbnail }, email)
    revalidatePath('/admin/pengumuman')
    revalidatePath('/admin')
    revalidatePath('/informasi')
    revalidatePath('/') // Revalidate halaman utama
    return { success: true }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Terjadi kesalahan' }
  }
}

export async function updateAnnouncementAction(id: string, formData: FormData) {
  try {
    await requireAdminEmail()
    const parsed = announcementSchema.safeParse(Object.fromEntries(formData))
    if (!parsed.success) {
      return { error: 'Data tidak valid' }
    }

    const existingData = await announcementService.getById(id)
    if (!existingData) return { error: 'Data tidak ditemukan' }

    const image = formData.get('image') as File | null
    let thumbnail = existingData.thumbnail || ''

    if (image && image.size > 0) {
      thumbnail = await storageService.uploadImage(image, 'pengumuman')
    }

    await announcementService.update(id, { ...parsed.data, thumbnail })
    if (existingData.thumbnail && thumbnail !== existingData.thumbnail) {
      try { await storageService.deleteImage(existingData.thumbnail) } catch { /* Saved content remains valid if old image cleanup fails. */ }
    }
    revalidatePath(`/informasi/${id}`)
    revalidatePath(`/admin/pengumuman/${id}/edit`)
    revalidatePath('/admin/pengumuman')
    revalidatePath('/admin')
    revalidatePath('/informasi')
    revalidatePath('/')
    return { success: true }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Terjadi kesalahan' }
  }
}

export async function deleteAnnouncementAction(id: string) {
  try {
    await requireAdminEmail()
    const existingData = await announcementService.getById(id)
    
    await announcementService.delete(id)
    if (existingData?.thumbnail) {
      try { await storageService.deleteImage(existingData.thumbnail) } catch { /* Image cleanup must not block removing a published announcement. */ }
    }
    revalidatePath(`/informasi/${id}`)
    revalidatePath('/admin/pengumuman')
    revalidatePath('/admin')
    revalidatePath('/informasi')
    revalidatePath('/')
    return { success: true }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Terjadi kesalahan' }
  }
}

export async function publishAnnouncementAction(id: string) {
  try {
    await requireAdminEmail()
    await announcementService.publish(id)
    revalidatePath(`/informasi/${id}`)
    revalidatePath('/admin/pengumuman')
    revalidatePath('/admin')
    revalidatePath('/informasi')
    revalidatePath('/')
    return { success: true }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Terjadi kesalahan' }
  }
}

