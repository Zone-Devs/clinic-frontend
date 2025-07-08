'use client'

import Link from 'next/link'
import { FiMenu, FiX } from 'react-icons/fi'
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'

export default function Sidebar() {
  return (
    <>
      {/** ─────────────────────────── MÓVIL ─────────────────────────── */}
      <Sheet>
        {/** El trigger es tu hamburguesa, solo en móvil: */}
        <SheetTrigger asChild>
          <button className="p-2 md:hidden">
            <FiMenu size={20} />
          </button>
        </SheetTrigger>

        <SheetContent side="left" className="w-64 border-r bg-surface p-0">
          <SheetHeader className="flex items-center justify-between px-4 py-3 border-b">
            <SheetTitle className="text-lg font-semibold">Navegación</SheetTitle>
            <SheetClose asChild>
              <Button variant="ghost" size="icon">
                <FiX size={20} />
              </Button>
            </SheetClose>
          </SheetHeader>

          <ScrollArea className="h-[calc(100vh-56px)] px-4 py-6">
            <nav className="space-y-2">
              <Link href="/dashboard" className="block rounded-md px-3 py-2 hover:bg-accent hover:text-accent-foreground transition">
                Dashboard
              </Link>
              <Link href="/roles" className="block rounded-md px-3 py-2 hover:bg-accent hover:text-accent-foreground transition">
                Roles y permisos
              </Link>
              {/** … otros enlaces … */}
            </nav>
          </ScrollArea>
        </SheetContent>
      </Sheet>

      {/** ─────────────────────────── DESKTOP ─────────────────────────── */}
      <aside className="hidden md:flex md:flex-col w-64 border-r bg-surface">
        <div className="px-4 py-3 border-b">
          <h2 className="text-lg font-semibold">Navegación</h2>
        </div>
        <ScrollArea className="flex-1 px-4 py-6">
          <nav className="space-y-2">
            <Link href="/dashboard" className="block rounded-md px-3 py-2 hover:bg-accent hover:text-accent-foreground transition">
              Dashboard
            </Link>
            <Link href="/roles" className="block rounded-md px-3 py-2 hover:bg-accent hover:text-accent-foreground transition">
              Roles y permisos
            </Link>
            {/** … otros enlaces … */}
          </nav>
        </ScrollArea>
      </aside>
    </>
  )
}
