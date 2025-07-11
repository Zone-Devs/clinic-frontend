// src/app/api/permissions/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  // 1) comprueba token
  const token = req.cookies.get('token')?.value
  if (!token) {
    return NextResponse.json({ message: 'No autorizado' }, { status: 401 })
  }

  try {
    // 2) llama al backend real
    //    ajusta BACKEND_URL a tu variable de entorno
    const backendRes = await fetch(
      `${process.env.BACKEND_URL || 'http://localhost:3000'}/api/roles/permissions`,
      { headers: { Authorization: `Bearer ${token}` } }
    )

    // 3) si no existe, devuelve array vacío
    if (backendRes.status === 404) {
      return NextResponse.json([], { status: 200 })
    }

    // 4) si hay error, propágalo
    if (!backendRes.ok) {
      const text = await backendRes.text()
      return NextResponse.json(
        { message: `Error del backend: ${text}` },
        { status: backendRes.status }
      )
    }

    // 5) parsea y retorna únicamente el array de permisos
    const json = await backendRes.json()
    // si tu backend devuelve { data: [...] }
    const permisos = Array.isArray(json.data) ? json.data : json
    return NextResponse.json(permisos)
  } catch (err) {
    console.error('Error proxy /api/permissions:', err)
    return NextResponse.json({ message: 'Error interno' }, { status: 500 })
  }
}
