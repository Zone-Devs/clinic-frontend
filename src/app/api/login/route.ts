// app/api/login/route.ts
import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3000"

export async function POST(req: NextRequest) {
  const { email, password } = await req.json()
  const backendRes = await fetch(`${BACKEND_URL}/api/auth/login`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ email, password }),
  })

  if (!backendRes.ok) {
    const { message } = await backendRes.json().catch(() => ({ message: 'Credenciales inválidas' }))
    return NextResponse.json(
      { error: message },
      { status: backendRes.status }
    )
  }
  // TODO: Set additional parametes to return on Login
  const { token, firstName, lastName } = await backendRes.json()

  const res = NextResponse.json({ firstName, lastName, email })
  res.cookies.set('token', token, {
    httpOnly: true,
    path:     '/',
    maxAge:   60 * 60 * 24,
    sameSite: 'lax',
    secure:   process.env.NODE_ENV === 'production',
  })
  return res
}
