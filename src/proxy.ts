import { NextResponse, type NextRequest } from 'next/server'

const LOGIN_PATH = '/login'
export function proxy(request: NextRequest) {
  const hasSession = Boolean(request.cookies.get('sipanda-token')?.value)

  if (!hasSession) {
    const url = request.nextUrl.clone()
    url.pathname = LOGIN_PATH
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
