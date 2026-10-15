import { studentQueries } from './queries'
import type { StudentInput } from './schemas'

export const studentService = {
  async getAll(classId?: string) {
    return studentQueries.findAll({ classId, limit: 10000 })
  },
  async getPaginated(params?: { classId?: string; search?: string; sortBy?: string; sortOrder?: 'asc' | 'desc'; page?: number; limit?: number }) {
    const limit = params?.limit || 10
    const [data, total] = await Promise.all([
      studentQueries.findAll(params),
      studentQueries.countAll(params)
    ])
    return {
      data,
      total,
      page: params?.page || 1,
      totalPages: Math.ceil(total / limit)
    }
  },
  async getById(id: string) {
    const student = await studentQueries.findById(id)
    if (!student) throw new Error('Siswa tidak ditemukan')
    return student
  },
  async getByNisn(nisn: string) {
    const student = await studentQueries.findByIdentifier(nisn)
    if (!student) throw new Error('Siswa tidak ditemukan')
    return student
  },
  async create(input: StudentInput) {
    const existing = await studentQueries.findByNisn(input.nisn)
    if (existing) throw new Error('NISN sudah terdaftar')
    return studentQueries.create(input)
  },
  async update(id: string, input: StudentInput) {
    const existingNisn = await studentQueries.findByNisn(input.nisn)
    if (existingNisn && existingNisn.id !== id) {
      throw new Error('NISN sudah dipakai siswa lain')
    }
    await this.getById(id)
    return studentQueries.update(id, input)
  },
  async delete(id: string) {
    await this.getById(id)
    return studentQueries.delete(id)
  },
  async updateIjazahUrl(id: string, ijazahUrl: string) {
    await this.getById(id)
    return studentQueries.update(id, { ijazahUrl } as any)
  },
}
