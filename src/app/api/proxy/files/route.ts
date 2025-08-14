import { NextRequest } from 'next/server'

export async function GET(req: NextRequest) {
  const src = req.nextUrl.searchParams.get('src')
  if (!src) return new Response('Missing "src"', { status: 400 })

  const url = new URL(src)
  const allowedHosts = [
    'localhost:3000',
    new URL(process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000').host,
  ]
  if (!allowedHosts.includes(url.host)) {
    return new Response('Forbidden host', { status: 403 })
  }

  const token = req.cookies.get('token')?.value
  if (!token) return new Response('Unauthorized', { status: 401 })

  const upstream = await fetch(src, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  })

  if (!upstream.ok) {
    return new Response('Upstream error', { status: upstream.status })
  }

  // Stream body through, force inline display and no cache
  const headers = new Headers(upstream.headers)
  headers.set('Cache-Control', 'no-store')
  headers.set('Content-Disposition', 'inline') // show in tab instead of download

  // Some hosts send extra hop-by-hop headers; strip if necessary
  headers.delete('transfer-encoding')

  return new Response(upstream.body, {
    status: 200,
    headers,
  })
}