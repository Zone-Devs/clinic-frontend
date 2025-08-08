import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { EquipmentManager } from './EquipmentManager'
import ErrorFallback from '@/app/components/ErrorFallback'

const serverURL = process.env.BACKEND_URL || 'http://localhost:3000'
export default async function EquipmentsPage() {
  const token = (await cookies()).get('token')?.value
  if (!token) redirect('/login')
  let equipments = []
  try {
    const res = await fetch(`${serverURL}/api/equipments`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    })
    const json = await res.json()
    equipments = Array.isArray(json) ? json : json.data
  } catch (err: any) {
      return (
      <main className="p-6">
        <ErrorFallback />
      </main>
    )
  }

  return (
    <main className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Equipo Médico</h1>
        <p className="text-sm text-gray-400">
          Sección donde puedes ver y gestionar las equipos médicos.
        </p>
      </div>
      <EquipmentManager initial={equipments} />
    </main>
  )
}
