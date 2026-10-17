export const ASSESSMENT_PAGE_SIZE = 10

export function paginationWindow(value: string | number | undefined, total: number, limit = ASSESSMENT_PAGE_SIZE) {
  const requested = Number(value)
  const totalPages = Math.max(1, Math.ceil(total / limit))
  const page = Math.min(totalPages, Number.isSafeInteger(requested) && requested > 0 ? requested : 1)
  return { page, totalPages, total, skip: (page - 1) * limit, take: limit }
}
