'use server'

import { revalidatePath } from 'next/cache'
import { requireAdminEmail } from '@/lib/auth'
import { classSchema } from './schemas'
import { classService } from './services'

export async function createClassAction(formData: FormData) {
  try {
    await requireAdminEmail()
    const parsed = classSchema.safeParse(Object.fromEntries(formData))
    if (!parsed.success) return { error: 'Data tidak valid' }
    await classService.create(parsed.data)
    revalidatePath('/admin', 'layout')
    revalidatePath('/data-siswa', 'layout')
    revalidatePath('/absensi')
    revalidatePath('/daftar-nilai')
    return { success: true }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Terjadi kesalahan' }
  }
}

export async function updateClassAction(id: string, formData: FormData) {
  try {
    await requireAdminEmail()
    const parsed = classSchema.safeParse(Object.fromEntries(formData))
    if (!parsed.success) return { error: 'Data tidak valid' }
    await classService.update(id, parsed.data)
    revalidatePath('/admin', 'layout')
    revalidatePath('/data-siswa', 'layout')
    revalidatePath('/absensi')
    revalidatePath('/daftar-nilai')
    return { success: true }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Terjadi kesalahan' }
  }
}

export async function deleteClassAction(id: string) {
  try {
    await requireAdminEmail()
    await classService.delete(id)
    revalidatePath('/admin', 'layout')
    revalidatePath('/data-siswa', 'layout')
    revalidatePath('/absensi')
    revalidatePath('/daftar-nilai')
    return { success: true }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Terjadi kesalahan' }
  }
}
