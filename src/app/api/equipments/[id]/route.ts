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
    
  const { id: categoryID } = await params
  try {
    const backendRes = await fetch(
      `${BACKEND_URL}/api/equipment-category/${encodeURIComponent(categoryID)}`,
      {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      }
    )

    if (backendRes.status === 204) {
      // borrado OK
      return new NextResponse(null, { status: 204 })
    }

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
    console.error('Error proxy DELETE /api/equipments/[id]:', err)
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

  const { id: categoryID } = await params
  let body: { name: string; description: string; model: string }
  
  try {
    body = await req.json()
    console.log('🚬 ===> :67 ===> PATCH ===> body:', body);
  } catch {
    return NextResponse.json(
      { message: 'Payload inválido' },
      { status: 400 }
    )
  }

  try {
    const backendRes = await fetch(
      `${BACKEND_URL}/api/equipments/${encodeURIComponent(categoryID)}`,
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
    console.error('Error proxy PATCH /api/equipments/[id]:', err)
    return NextResponse.json({ message: serverErrorMsg }, { status: 500 })
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const token = req.cookies.get('token')?.value
  if (!token) {
    return NextResponse.json({ message: 'No autorizado' }, { status: 401 })
  }

  const { id: equipmentID } = await params
  let body: { category: string; fileType: string; }

  try {
    body = await req.json()
  } catch {
    return NextResponse.json(
      { message: 'Payload inválido' },
      { status: 400 }
    )
  }

  try {
    const backendRes = await fetch(
      `${BACKEND_URL}/api/equipments/${encodeURIComponent(equipmentID)}/${body.category}//${body.fileType}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }
    )
    console.log('🚬 ===> POST ===> backendRes:', backendRes);

    const text = await backendRes.text()
    if (backendRes.ok) {
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
    console.error('Error proxy PATCH /api/equipments/[id]:', err)
    return NextResponse.json({ message: serverErrorMsg }, { status: 500 })
  }
}