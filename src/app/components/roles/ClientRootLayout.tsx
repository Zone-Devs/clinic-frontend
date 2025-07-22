// app/layout.tsx  (o ClientRootLayout.tsx)
'use client'
import { ReactNode } from 'react'
import NavbarClient from '@/app/components/NavbarClient'
import { SidebarProvider } from '@/components/ui/sidebar'
import AppSidebar from '../AppSidebar'
import { MobileSidebar } from '../MobileSidebar'

interface Props {
  children: ReactNode
}

export default function ClientRootLayout({ children }: Props) {
  return (
    <div className="flex h-screen overflow-hidden">
      <MobileSidebar />
      <aside className="hidden md:block w-72 shrink-0 overflow-y-auto overflow-x-hidden">
        <SidebarProvider>
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
