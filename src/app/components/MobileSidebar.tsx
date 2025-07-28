// components/MobileSidebar.tsx
'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  Sheet,
  SheetTrigger,
  SheetPortal,
  SheetOverlay,
  SheetContent,
  SheetClose,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible'
import {
  Menu,
  X,
  LayoutDashboard,
  Workflow,
  Cog,
  ChevronDown,
  Tag,
} from 'lucide-react'

const iconClass = 'w-4 h-4 mr-2'
const mobileLinkBase = 'flex items-center text-sm px-2 py-1 transition rounded-md'

const mainNav = [
  { href: '/dashboard', label: 'Dashboard', Icon: LayoutDashboard },
]
const sections = [
  {
    id: 'admin',
    title: 'Administración del sistema',
    Icon: Cog,
    items: [
      { href: '/stages', label: 'Flujo de trabajo', Icon: Workflow },
      { href: '/categories', label: 'Categorías de equipos', Icon: Tag },
    ],
  },
]

export function MobileSidebar() {
  const [open, setOpen] = useState(false)
  const [openSection, setOpenSection] = useState<string | null>(null)
  const pathname = usePathname()

  const isActive = (href: string) =>
    href === '/dashboard'
      ? pathname === href
      : pathname.startsWith(href)

  const linkClass = (href: string) =>
    `${mobileLinkBase} ${
      isActive(href)
        ? 'bg-accent/20 text-accent-foreground'
        : 'hover:bg-accent hover:text-accent-foreground'
    }`

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      {/* ── CABECERA MÓVIL ── */}
      <div className="md:hidden fixed inset-x-0 top-0 h-12 bg-white border-b z-30 flex items-center px-4">
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon">
            <Menu className="w-2 h-2" />
          </Button>
        </SheetTrigger>
      </div>

      {/* ── PORTAL CON OVERLAY + PANEL ── */}
      <SheetPortal>
        <SheetOverlay className="fixed inset-0 bg-black/50 z-40" />
        <SheetContent
          side="left"
          className="fixed inset-y-0 left-0 w-64 bg-white z-50 transform transition-transform"
        >
          <SheetHeader className="flex items-center justify-between px-4 py-3 border-b">
            <SheetTitle className="text-lg font-semibold">ZoneDevs</SheetTitle>
          </SheetHeader>

          <ScrollArea className="h-[calc(100vh-4rem)] px-2 py-2">
            <nav className="space-y-2">
              {/* enlaces principales */}
              {mainNav.map(({ href, label, Icon }) => (
                <SheetClose asChild key={href}>
                  <Link href={href} className={linkClass(href)}>
                    <Icon className={iconClass} />
                    {label}
                  </Link>
                </SheetClose>
              ))}

              {/* secciones colapsables */}
              {sections.map(({ id, title, Icon, items }) => (
                <Collapsible
                  key={id}
                  open={openSection === id}
                  onOpenChange={open => setOpenSection(open ? id : null)}
                  className="space-y-1"
                >
                  <CollapsibleTrigger asChild>
                    <button className={mobileLinkBase + ' w-full justify-between'}>
                      <span className="flex items-center">
                        <Icon className={iconClass} />
                        {title}
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 transition-transform ${
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
      </SheetPortal>
    </Sheet>
  )
}
