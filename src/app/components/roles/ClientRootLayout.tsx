// app/layout.tsx  (ClientRootLayout.tsx)
'use client'

import { ReactNode, useState } from 'react'
import { SidebarProvider } from '@/components/ui/sidebar'
import AppSidebar from '../AppSidebar'
import { MobileSidebar } from '../MobileSidebar'

interface Props {
  children: ReactNode
}

export default function ClientRootLayout({ children }: Props) {
  // aquí vivirá el estado collapsed
  const [collapsed, setCollapsed] = useState(false)
  const toggle = () => setCollapsed((c) => !c)

  return (
    <div className="flex h-screen overflow-hidden">
      {/* móvil: igual que antes, si quieres también le puedes pasar collapsed si es necesario */}
      <MobileSidebar />

      {/* desktop: el wrapper <aside> ajusta su width según collapsed */}
      <aside
        className={`
          hidden md:block
          flex-shrink-0
          transition-width duration-300
          ${collapsed ? 'w-16' : 'w-72'}
        `}
      >
        <SidebarProvider>
          {/* pasamos collapsed y toggle a AppSidebar */}
          <AppSidebar collapsed={collapsed} onToggle={toggle} />
        </SidebarProvider>
      </aside>

      {/* contenido principal: flex-1 para ocupar todo lo que quede */}
      <div className="flex-1 overflow-auto transition-all duration-300">
        <main className="pt-8">
          {children}
        </main>
      </div>
    </div>
  )
}
