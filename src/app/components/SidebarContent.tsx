'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function SidebarContent() {
  const pathname = usePathname()

  const isActive = (href: string) =>
    href === '/dashboard'
      ? pathname === href
      : pathname.startsWith(href)

  const linkClasses = (href: string) =>
    `block rounded-md px-3 py-2 transition ${
      isActive(href)
        ? 'bg-accent text-accent-foreground'
        : 'hover:bg-accent/50 hover:text-accent-foreground'
    }`

  return (
    <nav className="space-y-2">
      <Link href="/dashboard" className={linkClasses('/dashboard')}>
        Dashboard
      </Link>
      <Link href="/roles" className={linkClasses('/roles')}>
        Roles y permisos
      </Link>
      {/* … más enlaces … */}
    </nav>
  )
}
