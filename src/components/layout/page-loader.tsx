'use client'

import { Suspense, useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import NextTopLoader, { useTopLoader } from 'nextjs-toploader'

function NavigationEvents() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { done } = useTopLoader()

  useEffect(() => {
    done()
  }, [pathname, searchParams, done])

  return null
}

export function PageLoader() {
  return (
    <>
      <NextTopLoader
        color="#d4a843"
        initialPosition={0.08}
        crawlSpeed={200}
        height={3}
        crawl={true}
        showSpinner={false}
        easing="ease"
        speed={250}
        shadow="0 0 10px #d4a843, 0 0 5px #e8c36e"
        zIndex={99999}
        showForHashAnchor={false}
      />
      <Suspense fallback={null}>
        <NavigationEvents />
      </Suspense>
    </>
  )
}
