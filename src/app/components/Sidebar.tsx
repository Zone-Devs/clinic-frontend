'use client'
import Link from 'next/link'
import { FiX } from 'react-icons/fi'

interface Props {
  open: boolean
  onClose: () => void
}

export default function Sidebar({ open, onClose }: Props) {
  return (
    <aside
      className={`
        border-r transition-[width] duration-300
        ${open ? 'w-64' : 'w-0'} overflow-hidden
      `}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <h2 className="text-lg font-semibold">Navegación</h2>
        <button onClick={onClose} className="md:hidden text-gray-600 hover:text-gray-900">
          <FiX size={20} />
        </button>
      </div>
      <nav className="px-4 py-6 space-y-4">
        <Link href="/dashboard" onClick={onClose} className="block font-medium hover:underline">
          Dashboard
        </Link>
        <Link href="/roles" onClick={onClose} className="block font-medium hover:underline">
          Roles y permisos
        </Link>
        {/* ...otros enlaces con onClick={onClose} */}
      </nav>
    </aside>
  )
}
