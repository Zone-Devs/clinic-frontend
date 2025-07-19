'use client'

import { LayoutDashboard, ShieldUser, Workflow } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const dashboardIconClass = "w-5 h-5 mr-2"
export default function SidebarContent() {
  const pathname = usePathname()

  const isActive = (href: string) =>
    href === '/dashboard'
      ? pathname === href
      : pathname.startsWith(href)

  const linkClasses = (href: string) =>
    `block rounded-md px-3 py-2 transition ${
      isActive(href)
        ? 'bg-primary text-primary-foreground'
        : 'hover:bg-accent hover:text-accent-foreground'
    }`

  return (
    <nav className="space-y-2">
      <Link href="/dashboard" className={`${linkClasses('/dashboard')} flex items-center`}>
        <LayoutDashboard className={dashboardIconClass} />
        Dashboard
      </Link>
      <Link href="/roles" className={`${linkClasses('/roles')} flex items-center`}>
        <ShieldUser className={dashboardIconClass} />
        Roles y permisos
      </Link>
      <Link href="/stages" className={`${linkClasses('/stages')} flex items-center`}>
        <Workflow className={dashboardIconClass} />
        Flujo de trabajo
      </Link>
      {/* … más enlaces … */}
    </nav>
  )
}
