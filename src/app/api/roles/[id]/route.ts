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
    
  const { id: roleId } = await params
  try {
    const backendRes = await fetch(
      `${BACKEND_URL}/api/roles/${encodeURIComponent(roleId)}`,
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
