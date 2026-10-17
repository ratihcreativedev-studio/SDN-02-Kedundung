import { paginationWindow } from '@/lib/pagination'
import { achievementQueries } from './queries'
import type { AchievementInput } from './schemas'

export const achievementService = {
  getAll() {
    return achievementQueries.findAll()
  },

  async getPaginated({ page = 1, limit = 10 }: { page?: number; limit?: number }) {
    const safeLimit = Number.isSafeInteger(limit) && limit > 0 ? Math.min(limit, 100) : 10
    const total = await achievementQueries.countAll()
    const pagination = paginationWindow(page, total, safeLimit)
    const data = await achievementQueries.findPaginated({ skip: pagination.skip, take: pagination.take })
    return { data, total, totalPages: pagination.totalPages, page: pagination.page }
  },

  async getById(id: string) {
    const achievement = await achievementQueries.findById(id)
    if (!achievement) throw new Error('Prestasi tidak ditemukan')
    return achievement
  },

  create(input: AchievementInput) {
    return achievementQueries.create(input)
  },

  async update(id: string, input: AchievementInput) {
    await this.getById(id)
    return achievementQueries.update(id, input)
  },

  async delete(id: string) {
    await this.getById(id)
    return achievementQueries.delete(id)
  },
}
