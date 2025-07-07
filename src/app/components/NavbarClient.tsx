// src/app/components/NavbarClient.tsx
'use client'
import { FiMenu, FiLogOut } from 'react-icons/fi'

interface Props {
  onMenuToggle?: () => void
  user: { id: string; email: string }
}

export default function NavbarClient({ onMenuToggle, user }: Props) {
  return (
    <nav className="flex items-center justify-between px-6 py-3 shadow">
      <button
        onClick={onMenuToggle}
        className="flex items-center text-gray-700 hover:text-gray-900 md:hidden"
      >
        <FiMenu size={24} />
      </button>
      <div className="hidden md:block">Hola, {user.email}</div>
      <form action="/api/logout" method="post">
        <button
          type="submit"
          className="flex items-center border border-red-500 text-red-500 px-2 rounded hover:bg-red-50"
        >
          <FiLogOut size={18} />
          <span className="ml-2 pt-2 pb-1 text-sm">Logout</span>
        </button>
      </form>
    </nav>
  )
}
