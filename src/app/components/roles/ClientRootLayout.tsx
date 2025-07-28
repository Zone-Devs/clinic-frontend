// app/layout.tsx (ClientRootLayout.tsx)
'use client'
import { ReactNode } from 'react'
import AppSidebar from '../AppSidebar'
import { SidebarProvider } from '@/components/ui/sidebar'
import { MobileSidebar } from '../MobileSidebar'

interface Props {
  children: ReactNode
}

export default function ClientRootLayout({ children }: Props) {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* —————— MÓVIL: trigger/header fijo —————— */}
      <MobileSidebar />

      {/* —————— DESKTOP: sidebar permanente —————— */}
      <aside className="hidden md:block w-72 shrink-0 overflow-y-auto overflow-x-hidden">
        <SidebarProvider>
          <AppSidebar />
        </SidebarProvider>
      </aside>

      {/* —————— CONTENIDO PRINCIPAL —————— */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 
          En móvil: pt-16 para que main empuje su contenido debajo de la cabecera fija;
          en desktop: pt-0 porque md:pt-0 anula el pt-16 a partir de md.
        */}
        <main className="flex-1 overflow-auto pt-16 md:pt-0">
          {children}
        </main>
      </div>
    </div>
  )
}
