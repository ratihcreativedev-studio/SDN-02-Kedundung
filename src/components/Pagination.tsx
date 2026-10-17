'use client'

import { useTransition } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export function Pagination({ totalPages, currentPage }: { totalPages: number; currentPage: number }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  const createPageURL = (pageNumber: number | string) => {
    const params = new URLSearchParams(searchParams)
    params.set('page', pageNumber.toString())
    return `${pathname}?${params.toString()}`
  }

  const handlePageChange = (page: number) => {
    startTransition(() => router.push(createPageURL(page), { scroll: false }))
  }

  if (totalPages <= 1) return null

  const pages: (number | string)[] = []
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i)
    }
  } else {
    if (currentPage <= 4) {
      pages.push(1, 2, 3, 4, 5, '...', totalPages)
    } else if (currentPage >= totalPages - 3) {
      pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages)
    } else {
      pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages)
    }
  }

  return (
    <div aria-busy={pending} className="flex items-center justify-between px-4 py-3 sm:px-6 mt-4 bg-surface-alt/50 rounded-xl border border-border">
      {pending && <span role="status" className="sr-only">Memuat halaman...</span>}
      <div className="flex flex-1 flex-col gap-3 sm:hidden">
        <p className="text-center text-sm text-text-secondary">Halaman {currentPage} dari {totalPages}</p>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={pending || currentPage <= 1}
            className="inline-flex min-h-11 items-center justify-center rounded-lg border border-border bg-white px-2 py-2 text-sm font-medium text-primary hover:bg-surface-alt focus-visible:outline-2 focus-visible:outline-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Sebelumnya
          </button>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={pending || currentPage >= totalPages}
            className="inline-flex min-h-11 items-center justify-center rounded-lg border border-border bg-white px-2 py-2 text-sm font-medium text-primary hover:bg-surface-alt focus-visible:outline-2 focus-visible:outline-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Selanjutnya
          </button>
        </div>
      </div>
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-text-secondary">
            Halaman <span className="font-medium text-primary">{currentPage}</span> dari <span className="font-medium text-primary">{totalPages}</span>
          </p>
        </div>
        <div>
          <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={pending || currentPage <= 1}
              className="relative inline-flex items-center rounded-l-md px-2 py-2 text-text-secondary ring-1 ring-inset ring-border hover:bg-surface-alt focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed bg-white transition-colors"
            >
              <span className="sr-only">Previous</span>
              <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            </button>
            
            {pages.map((p, i) => (
              p === '...' ? (
                <span key={`ellipsis-${i}`} className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-text-secondary ring-1 ring-inset ring-border bg-white">
                  ...
                </span>
              ) : (
                <button
                  key={`page-${p}`}
                  disabled={pending || p === currentPage}
                  aria-current={p === currentPage ? 'page' : undefined}
                  onClick={() => handlePageChange(p as number)}
                  className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold focus:z-20 focus:outline-offset-0 ring-1 ring-inset ring-border transition-colors ${
                    p === currentPage
                      ? 'z-10 bg-primary text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'
                      : 'text-text-secondary bg-white hover:bg-surface-alt'
                  }`}
                >
                  {p}
                </button>
              )
            ))}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={pending || currentPage >= totalPages}
              className="relative inline-flex items-center rounded-r-md px-2 py-2 text-text-secondary ring-1 ring-inset ring-border hover:bg-surface-alt focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed bg-white transition-colors"
            >
              <span className="sr-only">Next</span>
              <ChevronRight className="h-5 w-5" aria-hidden="true" />
            </button>
          </nav>
        </div>
      </div>
    </div>
  )
}
