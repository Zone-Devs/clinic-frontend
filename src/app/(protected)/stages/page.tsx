// src/app/(protected)/roles/page.tsx
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import StagesContainer from './StagesContainer'
import ErrorFallback from '@/app/components/ErrorFallback'

const serverURL = process.env.BACKEND_URL || 'http://localhost:3000'

export default async function RolesPage() {
  const token = (await cookies()).get('token')?.value
  if (!token) redirect('/login')

  let stages
  try {
    const res = await fetch(`${serverURL}/api/stages`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    })
    if (!res.ok) throw new Error('Fetch failed')
    stages = await res.json()
  } catch (err) {
    return (
      <main className="p-6">
        <ErrorFallback />
      </main>
    )
  }

  return (
    <main className="p-6">
    <div className="mb-6">
      <h1 className="text-2xl font-bold text-gray-900">Flujo de trabajo</h1>
      <p className="text-sm text-gray-400">
        Sección donde puedes ver, añadir y reordenar las etapas de tu flujo de trabajo.
      </p>
    </div>
      {/* Pasamos los datos iniciales */}
      <StagesContainer initialStages={stages} />
    </main>
  )
}
