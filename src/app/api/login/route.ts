// src/app/api/login/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { email, password } = await req.json()
  const backendRes = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })

  if (!backendRes.ok) {
    const errorBody = await backendRes.json()
    return NextResponse.json(
      { error: errorBody.message || 'Credenciales inválidas' },
      { status: backendRes.status }
    )
  }

  const { token } = await backendRes.json()

  // 1) Preparamos una redirección a /dashboard
  const res = NextResponse.redirect(new URL('/dashboard', req.url))
  // 2) Y al mismo tiempo seteamos la cookie
  res.cookies.set('token', token, {
    httpOnly: true,
    path: '/',
    maxAge: 60 * 60 * 24,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  })
  return res
}
