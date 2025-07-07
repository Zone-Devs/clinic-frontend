// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Solo protegemos /dashboard
  if (!pathname.startsWith('/dashboard')) {
    return NextResponse.next()
  }

  // Comprobamos solo que exista la cookie
  const token = req.cookies.get('token')?.value

  if (!token) {
    // Sin token → login
    const url = req.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Si hay token, dejamos pasar
  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*'],
}
