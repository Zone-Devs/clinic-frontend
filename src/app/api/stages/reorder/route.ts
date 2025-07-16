// src/app/api/stages/reorder/route.ts
import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL ?? 'http://localhost:3000'
const serverErrorMsg = 'Error interno en el servidor. Intente más tarde'

interface StageOrder {
  id: string
  orderNumber: number
}

interface Payload {
  stages: StageOrder[]
}

export async function PATCH(req: NextRequest) {
  const token = req.cookies.get('token')?.value
  if (!token) {
    return NextResponse.json({ message: 'No autorizado' }, { status: 401 })
  }

  // 1) Leer payload directamente
  let body: Payload
  try {
    const stageData = await req.json();
    body = {
        stages: stageData
    }
  } catch {
    return NextResponse.json({ message: 'JSON inválido' }, { status: 400 })
  }

  // 2) Validar estructura
  if (
    !Array.isArray(body.stages) ||
    body.stages.some(
      (s) => typeof s.id !== 'string' || typeof s.orderNumber !== 'number'
    )
  ) {
    return NextResponse.json(
      {
        message:
          'El campo `stages` debe ser un array de objetos { id: string, orderNumber: number }',
      },
      { status: 400 }
    )
  }

  try {
    // 3) Proxy al backend remoto
    const backendRes = await fetch(`${BACKEND_URL}/api/stages/reorder`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (backendRes.status === 401) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 })
    }
    if (backendRes.status === 404) {
      return NextResponse.json({ message: 'Recurso no encontrado' }, { status: 404 })
    }

    // 4) Manejar respuestas sin cuerpo
    if (backendRes.status === 204 || backendRes.status === 205) {
      return new NextResponse(null, { status: backendRes.status })
    }

    // 5) Parsear JSON solo si hay contenido
    const data = await backendRes.json()
    return NextResponse.json(data, { status: backendRes.status })
  } catch (err) {
    console.error('Error proxy /api/stages PATCH:', err)
    return NextResponse.json({ message: serverErrorMsg }, { status: 500 })
  }
}
