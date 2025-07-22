// src/app/(protected)/roles/page.tsx
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import StagesContainer from './StagesContainer'

export default async function RolesPage() {
  const token = (await cookies()).get('token')?.value
  if (!token) redirect('/login')

  return (
    <main className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Flujo de trabajo</h1>
        <p className="text-gray-500 text-sm">
          Sección donde puedes ver, añadir y reordenar las etapas de tu flujo de trabajo.
        </p>
      </div>
      <StagesContainer />
    </main>
  )
}
