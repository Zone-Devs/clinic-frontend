// app/categories/page.tsx
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { CategoryManager } from './CategoryManager'
import ErrorFallback from '@/app/components/ErrorFallback'

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
    const json = await res.json()
    console.log('🚬 ===> :18 ===> CategoriesPage ===> json:', json);
    categories = Array.isArray(json) ? json : json.data
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
        <h1 className="text-2xl font-bold text-gray-900">Categorías de equipos</h1>
        <p className="text-sm text-gray-400">
          Sección donde puedes ver y gestionar las categorías de los equipos.
        </p>
      </div>
      <CategoryManager initial={categories} />
    </main>
  )
}
