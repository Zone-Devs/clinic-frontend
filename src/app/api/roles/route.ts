// src/app/api/roles/route.ts
import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL ?? 'http://localhost:3000'

interface ApiResponse {
  data: any[]
  total: number
  page: number
  limit: number
  totalPages: number
}

const serverErrorMsg = 'Error interno en el servidor. Intente más tarde';

// ─── GET existente ───
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
      `${BACKEND_URL}/api/roles?search=${encodeURIComponent(search)}&page=${page}`,
      { headers: { Authorization: `Bearer ${token}` } }
    )

    if (backendRes.status === 404) {
      const empty: ApiResponse = { data: [], total: 0, page, limit: 10, totalPages: 0 }
      return NextResponse.json(empty, { status: 200 })
    }

    const data = (await backendRes.json()) as ApiResponse
    return NextResponse.json(data, { status: backendRes.status })

  } catch (err) {
    console.error('Error proxy /api/roles GET:', err)
    return NextResponse.json({ message: serverErrorMsg }, { status: 500 })
  }
}

// ─── Nuevo POST ───
export async function POST(req: NextRequest) {
  const token = req.cookies.get('token')?.value
  if (!token) {
    return NextResponse.json({ message: 'No autorizado' }, { status: 401 })
  }

  let body: { name: string; description: string; permissionCodes: string[] }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ message: 'JSON inválido' }, { status: 400 })
  }

  const { name, description, permissionCodes } = body
  if (typeof name !== 'string' || !Array.isArray(permissionCodes)) {
    return NextResponse.json(
      { message: 'Faltan campos obligatorios o son de tipo incorrecto' },
      { status: 400 }
    )
  }

  try {
    const backendRes = await fetch(
      `${BACKEND_URL}/api/roles`,
      {
        method: 'POST',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: name,
          description: description,
          permissionCodes: permissionCodes
        }),
      }
    )

    // Propaga error si no es 2xx
    if (!backendRes.ok) {
      let errJson: any
      try {
        errJson = await backendRes.json()
      } catch {
        // fallback por si no viene JSON
        return NextResponse.json(
          { message: 'Error al crear el rol' },
          { status: backendRes.status }
        )
      }

      return NextResponse.json(
        { message: errJson.message ?? 'Error al crear el rol' },
        { status: backendRes.status }
      )
    }

    // Retorna la respuesta del backend (por ejemplo, el nuevo rol)
    const data = await backendRes.json()
    return NextResponse.json(data, { status: backendRes.status })

  } catch (err) {
    console.error('Error proxy /api/roles POST:', err)
    return NextResponse.json({ message: serverErrorMsg }, { status: 500 })
  }
}