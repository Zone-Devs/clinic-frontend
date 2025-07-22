'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarFooter,
} from '@/components/ui/sidebar'
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible'
import { LayoutDashboard, ShieldUser, Workflow, Tag, Cog, ChevronDown } from 'lucide-react'

const iconClass = 'w-4 h-4 mr-2 ml-2'


const mainNav = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
]

// Secciones con sub-items
const sections = [
  {
    id: 'admin',
    title: 'Administración del sistema',
    icon: Cog,
    items: [
      // { href: '/roles', label: 'Roles y permisos', icon: ShieldUser },
      { href: '/stages', label: 'Flujo de trabajo', icon: Workflow },
      { href: '/categories', label: 'Categorías de equipos', icon: Tag },
    ],
  },
  // aquí podrás añadir más secciones similares:
  // {
  //   id: 'otra',
  //   title: 'Otra sección',
  //   icon: OtraIcon,
  //   items: [ ... ],
  // },
]

export default function AppSidebar() {
  const pathname = usePathname()
  const [openSection, setOpenSection] = useState<string | null>(null)

  const isActive = (href: string) =>
    href === '/dashboard'
      ? pathname === href
      : pathname.startsWith(href)

  const closeSections = () => setOpenSection(null)

  return (
  <>
      {/* ─── DRAWER DESKTOP ─── */}
      <Sidebar className="h-full w-72 overflow-x-hidden">
        <SidebarHeader className="px-4 pt-3 pb-8 text-xl font-bold">
          Zonedevs
        </SidebarHeader>
        <SidebarContent className="overflow-x-hidden">
          {/* Enlaces planos */}
          <SidebarMenu>
            {mainNav.map((item) => (
              <SidebarMenuItem key={item.href}>
                <div className="px-3">
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.href)}
                    onClick={closeSections}
                  >
                  <Link
                    href={item.href}
                    className="w-full flex items-center py-2 transition"
                  >
                    <item.icon className={iconClass} />
                    {item.label}
                  </Link>
                </SidebarMenuButton>
                </div>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>

          {/* Secciones colapsables */}
          {sections.map((sec) => (
            <SidebarMenu key={sec.id}>
              <Collapsible
                open={openSection === sec.id}
                onOpenChange={(open) =>
                  setOpenSection(open ? sec.id : null)
                }
                className="group/collapsible"
              >
                {/* Trigger */}
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                  <div className="px-3">
                  <SidebarMenuButton
                    className="
                      group
                      flex items-center
                      px-2 pt-2 pb-3
                      transition
                      cursor-pointer
                    "
                  >
                      <sec.icon className={iconClass} />
                      {sec.title}
                      <ChevronDown
                        className="
                          w-4 h-4 ml-2
                          transition-transform duration-200
                          group-data-[state=open]:rotate-180
                        "
                      />
                  </SidebarMenuButton>
                  </div>
                  </CollapsibleTrigger>
                </SidebarMenuItem>

                {/* Sub-items */}
                <CollapsibleContent>
                  {sec.items.map((item) => (
                    <SidebarMenuSub key={item.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive(item.href)}
                      >
                        <Link
                          href={item.href}
                          className="flex items-center px-4 py-2 transition"
                        >
                          <item.icon className={iconClass} />
                          {item.label}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuSub>
                  ))}
                </CollapsibleContent>
              </Collapsible>
            </SidebarMenu>
          ))}
        </SidebarContent>
        <SidebarFooter className="px-4 py-2 text-xs text-muted-foreground">
          © 2025 Zonedevs
        </SidebarFooter>
      </Sidebar>
  </>
  )
}
