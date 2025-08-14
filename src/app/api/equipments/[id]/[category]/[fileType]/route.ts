// app/api/equipments/[equipmentID]/[category]/[fileType]/route.ts
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export const runtime = 'nodejs'  // asegura Node runtime para manejar archivos

export async function POST(
  req: Request,
  { params }: { params: { id: string; category: string; fileType: string } }
) {
  try {
    const { id, category, fileType } = await params
    const form = await req.formData()
    const file = form.get('file') as File | null
    if (!file) {
      return NextResponse.json({ message: 'file requerido' }, { status: 400 })
    }

    const token = (await cookies()).get('token')?.value
    const fd = new FormData()
    fd.append('file', file, file.name)

    const upstream = await fetch(
      `${process.env.API_BASE_URL || 'http://localhost:3000'}/api/equipments/${id}/${category}/${fileType}`,
      {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: fd,
      }
    )

    if (!upstream.ok) {
      const text = await upstream.text()
      return NextResponse.json({ message: 'Upload failed', detail: text }, { status: upstream.status })
    }

    const json = await upstream.json()
    return NextResponse.json(json, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}
