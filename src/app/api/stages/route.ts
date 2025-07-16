// src/app/api/stages/route.ts
import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL ?? 'http://localhost:3000'
const serverErrorMsg = 'Error interno en el servidor. Intente más tarde'

export async function GET(req: NextRequest) {
  const token = req.cookies.get('token')?.value

  if (!token) {
    return NextResponse.json({ message: 'No autorizado' }, { status: 401 })
  }

  try {
    const backendRes = await fetch(`${BACKEND_URL}/api/stages`, {
      method: 'GET',
      headers: {
          'Authorization': `Bearer ${token}`
        }
    })

    if (backendRes.status === 401) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 })
    }

    if (backendRes.status === 404) {
      return NextResponse.json([], { status: 200 })
    }

    const data = await backendRes.json()
    return NextResponse.json(data, { status: backendRes.status })

  } catch (err) {
    console.error('Error proxy /api/stages GET:', err)
    return NextResponse.json({ message: serverErrorMsg }, { status: 500 })
  }
}
