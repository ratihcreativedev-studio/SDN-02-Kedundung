import { classQueries } from './queries'
import type { ClassInput } from './schemas'

export const classService = {
  async getById(id: string) {
    const classData = await classQueries.findById(id)
    if (!classData) throw new Error('Kelas tidak ditemukan')
    return classData
  },
  async create(input: ClassInput) {
    return classQueries.create(input)
  },
  async update(id: string, input: ClassInput) {
    await this.getById(id)
    return classQueries.update(id, input)
  },
  async delete(id: string) {
    await this.getById(id)
    return classQueries.delete(id)
  },
}
