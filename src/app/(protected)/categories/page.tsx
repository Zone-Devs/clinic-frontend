import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function RolesPage() {
  const token = (await cookies()).get('token')?.value
  if (!token) redirect('/login')

  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Categorias de equipos</h1>
    </main>
  )
}
