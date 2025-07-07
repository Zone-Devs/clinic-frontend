// src/app/api/logout/route.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  const url = new URL('/login', req.url)
  const res = NextResponse.redirect(url)

  res.cookies.set('token', '', {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 0,     // aquí caduca inmediatamente
  })

  return res
}