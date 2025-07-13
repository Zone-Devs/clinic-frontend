'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu } from 'lucide-react'
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import SidebarContent from './SidebarContent'

export default function Sidebar() {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* ─── DRAWER MÓVIL ─── */}
      <Sheet open={open} onOpenChange={setOpen}>
       <SheetTrigger asChild>
         <button
           className="
              fixed md:hidden 
              top-2
              left-4
              z-50 p-2 bg-white rounded shadow
            "
         >
           <Menu size={24} />
         </button>
       </SheetTrigger>

        <SheetContent side="left" className="w-64 border-r bg-white p-0">
          <SheetHeader className="flex items-center justify-between px-4 py-3 border-b">
            <SheetTitle className="text-lg font-semibold">ZoneDevs</SheetTitle>
            <SheetClose asChild>
            </SheetClose>
          </SheetHeader>

          <ScrollArea className="h-[calc(100vh-56px)] px-4 py-6">
            <nav className="space-y-2">
              <SheetClose asChild>
                <Link href="/dashboard" className="block rounded-md px-3 py-2 transition">
                  Dashboard
                </Link>
              </SheetClose>
              <SheetClose asChild>
                <Link href="/roles" className="block rounded-md px-3 py-2 transition">
                  Roles y permisos
                </Link>
              </SheetClose>
              {/* … más enlaces … */}
            </nav>
          </ScrollArea>
        </SheetContent>
      </Sheet>

      {/* ─── SIDEBAR DESKTOP ─── */}
      <aside className="hidden md:flex md:flex-col w-64 border-r bg-white">
        <div className="px-4 py-3">
          <h2 className="text-lg font-semibold">ZoneDevs</h2>
        </div>
        <ScrollArea className="flex-1 px-4 py-6">
          <SidebarContent />
        </ScrollArea>
      </aside>
    </>
  )
}
