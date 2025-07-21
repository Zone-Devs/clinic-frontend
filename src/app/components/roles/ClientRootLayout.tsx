// app/layout.tsx  (o ClientRootLayout.tsx)
'use client'
import { ReactNode } from 'react'
import NavbarClient from '@/app/components/NavbarClient'
import { SidebarProvider } from '@/components/ui/sidebar'
import AppSidebar from '../AppSidebar'

interface Props {
  children: ReactNode
}

export default function ClientRootLayout({ children }: Props) {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* El aside ya no necesita width */}
      <aside className="overflow-y-auto">
        <SidebarProvider>
          {/* Aquí es donde aplicamos la anchura real */}
          <AppSidebar />
        </SidebarProvider>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <NavbarClient />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  )
}
