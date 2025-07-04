// src/components/Navbar.tsx
import Link from 'next/link';
import { cookies } from 'next/headers';
import { verifyToken } from '@/utils/auth';

export default async function Navbar() {
  // 1) Leer la cookie en el servidor
  const token = (await cookies()).get('token')?.value;
  // 2) Verificarla
  const user = token ? verifyToken(token) : null;

  // 3) Si no hay usuario, no mostramos nada
  if (!user) {
    return null;
  }

  // 4) Si está autenticado, renderizamos el navbar
  return (
    <nav className="flex items-center justify-between bg-gray-100 px-6 py-4">
      <div className="flex space-x-4">
        <Link href="/dashboard" className="font-medium hover:underline">
          Dashboard
        </Link>
        {/* otros enlaces… */}
      </div>
      <form action="/api/logout" method="post">
        <button
          type="submit"
          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </form>
    </nav>
  );
}
