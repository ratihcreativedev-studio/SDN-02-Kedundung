import { z } from 'zod'

const optionalString = z.string().optional().transform(v => v === "" ? null : v)

export const studentSchema = z.object({
  nisn: z.string().trim().regex(/^\d{10}$/, 'NISN wajib terdiri dari 10 digit'),
  name: z.string().trim().min(1, 'Nama wajib diisi'),
  classId: optionalString.nullable(),
  status: z.enum(['active', 'inactive', 'graduate']).optional(),
  graduationDate: z.union([z.iso.date(), z.literal('')]).optional()
    .transform(value => value === undefined ? undefined : value ? new Date(`${value}T00:00:00.000Z`) : null),
  
  nipd: optionalString,
  gender: optionalString,
  birthPlace: optionalString,
  birthDate: z.union([z.iso.date(), z.literal('')]).optional().transform(v => v ? new Date(`${v}T00:00:00.000Z`) : null),
  nik: optionalString,
  religion: optionalString,
  address: optionalString,
  village: optionalString,
  district: optionalString,
  fatherName: optionalString,
  fatherJob: optionalString,
  motherName: optionalString,
})

export type StudentInput = z.infer<typeof studentSchema>

export const studentNoteSchema = z.object({
  note: z.string().trim().max(5000, 'Catatan maksimal 5.000 karakter')
    .transform(value => value || null),
})
