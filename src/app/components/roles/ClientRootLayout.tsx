// app/layout.tsx  (o ClientRootLayout.tsx)
'use client'
import { ReactNode } from 'react'
import NavbarClient from '@/app/components/NavbarClient'
import { SidebarProvider } from '@/components/ui/sidebar'
import AppSidebar from '../AppSidebar'
import { MobileSidebar } from '../MobileSidebar'
import { TooltipProvider } from "@/components/ui/tooltip"

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
        <TooltipProvider>
          <main className="flex-1 overflow-auto">{children}</main>
        </TooltipProvider>
      </div>
    </div>
  )
}
