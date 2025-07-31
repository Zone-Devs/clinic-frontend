import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL ?? 'http://localhost:3000'
const serverErrorMsg = 'Error interno en el servidor. Intente más tarde'

export async function GET(req: NextRequest) {
  const token = req.cookies.get('token')?.value

  if (!token) {
    return NextResponse.json({ message: 'No autorizado' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const search = searchParams.get('search') || ''
  const page = searchParams.get('page') || '1'
  const limit = searchParams.get('limit') || '10'

  const queryString = new URLSearchParams({
    ...(search && { search }),
    page,
    limit,
  }).toString()

  try {
    const backendRes = await fetch(
      `${BACKEND_URL}/api/equipments?${queryString}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    )

    if (backendRes.status === 401) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 })
    }

    if (backendRes.status === 404) {
      return NextResponse.json([], { status: 200 })
    }

    const data = await backendRes.json()
    return NextResponse.json(data, { status: backendRes.status })
  } catch (err) {
    console.error('Error proxy /api/equipments GET:', err)
    return NextResponse.json({ message: serverErrorMsg }, { status: 500 })
  }
}


export async function POST(req: NextRequest) {
  const token = req.cookies.get('token')?.value
  if (!token) {
    return NextResponse.json({ message: 'No autorizado' }, { status: 401 })
  }

  let body: {
    name: string;
    description: string;
    model: string;
    quantity: number;
  }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ message: 'JSON inválido' }, { status: 400 })
  }

  const { name, description, model, quantity } = body
  if (typeof name !== 'string' || typeof description !== 'string' || typeof model !== 'string' || typeof quantity !== 'number') {
    return NextResponse.json(
      { message: 'Faltan campos obligatorios o son de tipo incorrecto' },
      { status: 400 }
    )
  }

  try {
    const backendRes = await fetch(
      `${BACKEND_URL}/api/equipments`,
      {
        method: 'POST',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: name,
          description: description,
          model: model,
          quantity: quantity
        }),
      }
    )

    if (!backendRes.ok) {
      let errJson: any
      try {
        errJson = await backendRes.json()
      } catch {
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
    console.error('Error proxy /api/equipments POST:', err)
    return NextResponse.json({ message: serverErrorMsg }, { status: 500 })
  }
}