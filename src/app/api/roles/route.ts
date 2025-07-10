// src/app/api/roles/route.ts
import { NextRequest, NextResponse } from 'next/server'

interface ApiResponse {
  data: any[]        // tus roles
  total: number
  page: number
  limit: number
  totalPages: number
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const search = searchParams.get('search') || ''
  const page   = Number(searchParams.get('page') || '1')
  const token  = req.cookies.get('token')?.value

  if (!token) {
    return NextResponse.json({ message: 'No autorizado' }, { status: 401 })
  }

  try {
    const backendRes = await fetch(
      `http://localhost:3000/api/roles?search=${encodeURIComponent(search)}&page=${page}`,
      { headers: { Authorization: `Bearer ${token}` } }
    )

    // Si el backend interno no encuentra nada y devuelve 404,
    // devolvemos un payload vacío con 200 OK:
    if (backendRes.status === 404) {
      const empty: ApiResponse = {
        data: [],
        total: 0,
        page,
        limit: 10,      // o el valor por defecto que uses
        totalPages: 0,
      }
      return NextResponse.json(empty, { status: 200 })
    }

    // Para cualquier otro status (200, 400, 500, etc.), lo reenviamos:
    const data = (await backendRes.json()) as ApiResponse
    return NextResponse.json(data, { status: backendRes.status })

  } catch (err) {
    console.error('Error proxy /api/roles:', err)
    return NextResponse.json({ message: 'Error interno' }, { status: 500 })
  }
}
