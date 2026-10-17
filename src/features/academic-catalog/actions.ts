'use server'

import { revalidatePath } from 'next/cache'
import { requireAdminEmail } from '@/lib/auth'
import { db } from '@/lib/db'
import { catalogCategory, catalogSchema } from './schemas'

function refresh() {
  revalidatePath('/admin/mata-pelajaran')
  revalidatePath('/admin/ekstrakurikuler')
  revalidatePath('/admin/nilai', 'layout')
}
export async function saveCatalogAction(data: FormData) {
  try {
    await requireAdminEmail()
    const parsed = catalogSchema.safeParse(Object.fromEntries(data))
    if (!parsed.success) return { error: parsed.error.issues[0].message }
    const id = data.get('id')
    if (id !== null && (typeof id !== 'string' || !id.trim())) return { error: 'Data tidak valid.' }
    if (id) {
      // Codes are stable identities shared with saved ledger records.
      const result = await db.academicItem.updateMany({ where: { id, category: parsed.data.category, code: parsed.data.code, deletedAt: null }, data: { name: parsed.data.name } })
      if (result.count !== 1) return { error: 'Data tidak ditemukan. Muat ulang halaman.' }
    } else await db.academicItem.create({ data: parsed.data })
    refresh()
    return { success: true }
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') return { error: 'Kode atau nama sudah digunakan. Gunakan kode dan nama yang berbeda.' }
    return { error: 'Data gagal disimpan. Silakan coba lagi.' }
  }
}
export async function deleteCatalogAction(data: FormData) {
  try {
    await requireAdminEmail()
    const category = catalogCategory.safeParse(data.get('category'))
    const id = data.get('id')
    if (!category.success || typeof id !== 'string' || !id.trim()) return { error: 'Data tidak valid.' }
    const result = await db.academicItem.updateMany({ where: { id, category: category.data, deletedAt: null }, data: { deletedAt: new Date() } })
    if (result.count !== 1) return { error: 'Data tidak ditemukan. Muat ulang halaman.' }
    refresh()
    return { success: true }
  } catch { return { error: 'Data gagal dihapus. Silakan coba lagi.' } }
}
