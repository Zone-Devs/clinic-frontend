// components/MobileSidebar.tsx
'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { Sheet, SheetTrigger, SheetContent, SheetClose, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible'
import { Menu, X, LayoutDashboard, ShieldUser, Workflow, Cog, ChevronDown } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import Link from 'next/link'

const iconClass = 'w-4 h-4 mr-2'
const mobileLinkBase = 'flex items-center text-sm px-2 py-1 transition'

const mainNav = [
  { href: '/dashboard', label: 'Dashboard', Icon: LayoutDashboard },
]

const sections = [
  {
    id: 'admin',
    title: 'Administración del sistema',
    Icon: Cog,
    items: [
      { href: '/roles', label: 'Roles y permisos', Icon: ShieldUser },
      { href: '/stages', label: 'Flujo de trabajo', Icon: Workflow },
    ],
  },
]

export function MobileSidebar() {
  const [open, setOpen] = useState(false)
  const [openSection, setOpenSection] = useState<string | null>(null)
  const pathname = usePathname()

  const linkClass = (href: string) =>
    `${mobileLinkBase} ${
      pathname === href || pathname.startsWith(href)
        ? 'bg-accent/20 text-accent-foreground rounded-md'
        : 'hover:bg-accent hover:text-accent-foreground'
    }`

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      {/* Trigger hamburguesa */}
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden fixed top-4 left-4 z-50"
        >
          <Menu className="w-5 h-5" />
        </Button>
      </SheetTrigger>

      {/* Panel */}
      <SheetContent side="left" className="w-64 border-r bg-white p-0 md:hidden">
        <SheetHeader className="flex items-center justify-between px-4 py-3 border-b">
          <SheetTitle className="text-lg font-semibold">ZoneDevs</SheetTitle>

        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-56px)] px-2 py-2">
          <nav className="space-y-2">
            {/* Enlaces principales */}
            {mainNav.map(({ href, label, Icon }) => (
              <SheetClose asChild key={href}>
                <Link href={href} className={linkClass(href)}>
                  <Icon className={iconClass} />
                  {label}
                </Link>
              </SheetClose>
            ))}

            {/* Secciones colapsables */}
            {sections.map(({ id, title, Icon, items }) => (
              <Collapsible
                key={id}
                open={openSection === id}
                onOpenChange={(b) => setOpenSection(b ? id : null)}
                className="space-y-1"
              >
                <CollapsibleTrigger asChild>
                  <button className={mobileLinkBase}>
                    <Icon className={iconClass} />
                    {title}
                    <ChevronDown
                      className={`w-3 h-3 ml-2 transition-transform duration-200 ${
                        openSection === id ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                </CollapsibleTrigger>

                <CollapsibleContent className="space-y-1 pl-6">
                  {items.map(({ href, label, Icon }) => (
                    <SheetClose asChild key={href}>
                      <Link href={href} className={linkClass(href)}>
                        <Icon className={iconClass} />
                        {label}
                      </Link>
                    </SheetClose>
                  ))}
                </CollapsibleContent>
              </Collapsible>
            ))}
          </nav>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
