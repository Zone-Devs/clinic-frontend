// src/app/api/roles/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL ?? 'http://localhost:3000'
const serverErrorMsg = 'Error interno en el servidor. Intente más tarde'

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const token = req.cookies.get('token')?.value
  if (!token) {
      return NextResponse.json(
          { message: 'No autorizado' },
          { status: 401 }
        )
    }
    
  const { id: stageId } = await params
  try {
    const backendRes = await fetch(
      `${BACKEND_URL}/api/stages/${encodeURIComponent(stageId)}`,
      {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      }
    )

    if (backendRes.status === 204) {
      // borrado OK
      return new NextResponse(null, { status: 204 })
    }

    // lee el body sólo una vez
    const text = await backendRes.text()
    let msg = serverErrorMsg
    try {
      const json = JSON.parse(text)
      if (json.message) msg = json.message
    } catch {
      msg = text || msg
    }

    return NextResponse.json(
      { message: msg },
      { status: backendRes.status }
    )
  } catch (err) {
    console.error('Error proxy DELETE /api/roles/[id]:', err)
    return NextResponse.json(
      { message: serverErrorMsg },
      { status: 500 }
    )
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const token = req.cookies.get('token')?.value
  if (!token) {
    return NextResponse.json({ message: 'No autorizado' }, { status: 401 })
  }

  const { id: stageId } = await params
  let body: { name: string; description: string; color: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json(
      { message: 'Payload inválido' },
      { status: 400 }
    )
  }

  // proxy al backend real…
  try {
    const backendRes = await fetch(
      `${BACKEND_URL}/api/stages/${encodeURIComponent(stageId)}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      }
    )

    const text = await backendRes.text()
    if (backendRes.ok) {
      // respondemos 200 con el JSON del backend (o null)
      try {
        return NextResponse.json(JSON.parse(text), { status: 200 })
      } catch {
        return NextResponse.json(null, { status: 200 })
      }
    }

    let msg = serverErrorMsg
    try {
      const json = JSON.parse(text)
      if (json.message) msg = json.message
    } catch {
      msg = text || msg
    }
    return NextResponse.json({ message: msg }, { status: backendRes.status })
  } catch (err) {
    console.error('Error proxy PATCH /api/stages/[id]:', err)
    return NextResponse.json({ message: serverErrorMsg }, { status: 500 })
  }
}