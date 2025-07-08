// src/app/api/roles/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const search = searchParams.get('search') || ''
  const page   = searchParams.get('page')   || '1'
  const token  = req.cookies.get('token')?.value

  if (!token) {
    return NextResponse.json({ message: 'No autorizado' }, { status: 401 })
  }

  // Llamas a tu backend real
  const backendRes = await fetch(
    `http://localhost:3000/api/roles?search=${encodeURIComponent(search)}&page=${page}`,
    { headers: { Authorization: `Bearer ${token}` } }
  )

  const data = await backendRes.json()
  return NextResponse.json(data, { status: backendRes.status })
}
