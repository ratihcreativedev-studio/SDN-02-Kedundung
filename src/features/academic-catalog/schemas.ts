import { z } from 'zod'
export const catalogCategory = z.enum(['mata-pelajaran', 'ekstrakurikuler'])
export const catalogSchema = z.object({
  category: catalogCategory,
  code: z.string().trim().toUpperCase().regex(/^[A-Z][A-Z0-9_]{0,29}$/, 'Kode harus diawali huruf dan hanya berisi huruf, angka, atau garis bawah (maksimal 30 karakter).'),
  name: z.string().trim().min(1, 'Nama wajib diisi.').max(150, 'Nama maksimal 150 karakter.'),
})
