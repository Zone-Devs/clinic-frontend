// app/categories/page.tsx
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { CategoryManager } from './CategoryManager'

const serverURL = process.env.BACKEND_URL || 'http://localhost:3000'
export default async function CategoriesPage() {
  const token = (await cookies()).get('token')?.value
  if (!token) redirect('/login')
  let categories = []
  try {
    const res = await fetch(`${serverURL}/api/equipment-category`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    })
    categories = await res.json()    
  } catch (err: any) {
        return (
      <main className="p-6">
        <h1 className="text-xl font-bold text-red-600">Error interno en el servidor</h1>
        <p className="text-red-500">
          No se pudieron cargar las categorías. Intente más tarde.
        </p>
      </main>
    )
  }

  return (
    <main className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Categorías de equipos</h1>
        <p className="text-gray-500 text-sm">
          Sección donde puedes ver y gestionar las categorías de los equipos.
        </p>
      </div>
      <CategoryManager initial={categories} />
    </main>
  )
}
