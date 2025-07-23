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
    const backendRes = await fetch(`${BACKEND_URL}/api/equipment-category`, {
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

export async function POST(req: NextRequest) {
  const token = req.cookies.get('token')?.value
  if (!token) {
    return NextResponse.json({ message: 'No autorizado' }, { status: 401 })
  }

  let body: { name: string; description: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ message: 'JSON inválido' }, { status: 400 })
  }

  const { name, description } = body
  if (typeof name !== 'string' || typeof description !== 'string') {
    return NextResponse.json(
      { message: 'Faltan campos obligatorios o son de tipo incorrecto' },
      { status: 400 }
    )
  }

  try {
    const backendRes = await fetch(
      `${BACKEND_URL}/api/equipment-category`,
      {
        method: 'POST',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: name,
          description: description,
        }),
      }
    )

    if (!backendRes.ok) {
      let errJson: any
      try {
        errJson = await backendRes.json()
      } catch {
        // fallback por si no viene JSON
        return NextResponse.json(
          { message: 'Error al crear la categoria' },
          { status: backendRes.status }
        )
      }

      return NextResponse.json(
        { message: errJson.message ?? 'Error al crear la categoria' },
        { status: backendRes.status }
      )
    }

    const data = await backendRes.json()
    return NextResponse.json(data, { status: backendRes.status })

  } catch (err) {
    console.error('Error proxy /api/categories POST:', err)
    return NextResponse.json({ message: serverErrorMsg }, { status: 500 })
  }
}