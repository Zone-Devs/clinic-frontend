// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtDecode } from 'jwt-decode'

interface JwtPayload { exp: number }

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (!pathname.startsWith('/dashboard')) {
    return NextResponse.next()
  }

  const loginUrl = req.nextUrl.clone()
  loginUrl.pathname = '/login'
  const token = req.cookies.get('token')?.value

  if (!token) {
    const res = NextResponse.redirect(loginUrl)
    res.headers.set('x-middleware-reason', 'no-token')
    return res
  }

  try {
    const { exp } = jwtDecode<JwtPayload>(token)
    if (!exp || Date.now() >= exp * 1000) {
      const res = NextResponse.redirect(loginUrl)
      res.cookies.delete('token')
      res.headers.set('x-middleware-reason', 'expired')
      return res
    }
  } catch {
    const res = NextResponse.redirect(loginUrl)
    res.cookies.delete('token')
    res.headers.set('x-middleware-reason', 'invalid')
    return res
  }

  // todo OK
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next|favicon.ico|images|fonts|.*\\.svg).*)'],
}
