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
import {
  LayoutDashboard,
  Workflow,
  Tag,
  Cog,
  ChevronDown,
  ChevronsUpDown,
  PanelLeftClose,
  PanelRightClose,
} from 'lucide-react'
import { useUser } from '@/context/UserContext'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { LogoutButton } from './LogoutButton'
import clsx from 'clsx'

const iconClass = 'w-5 h-5 flex-shrink-0'

const mainNav = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
]

const sections = [
  {
    id: 'admin',
    title: 'Administración del sistema',
    icon: Cog,
    items: [
      { href: '/stages', label: 'Flujo de trabajo', icon: Workflow },
      { href: '/categories', label: 'Categorías de equipos', icon: Tag },
    ],
  },
]

interface Props {
  collapsed: boolean
  onToggle: () => void
}

export default function AppSidebar({ collapsed, onToggle }: Props ) {
  const pathname = usePathname()
  const { user } = useUser()
  const [openSection, setOpenSection] = useState<string | null>(null)

  const isActive = (href: string) =>
    href === '/dashboard'
      ? pathname === href
      : pathname.startsWith(href)

  return (
    <>
    <Sidebar
      className={clsx(
        'h-full overflow-x-hidden transition-all duration-300',
        collapsed ? 'w-11' : 'w-72'
      )}
    >
      {/* HEADER con botón de colapso */}
      <SidebarHeader className="relative px-4 py-6">
        {/* Título siempre centrado (solo si no está colapsado) */}
        {!collapsed && (
          <span
            className="
              absolute
              left-1/2 top-1/2
              -translate-x-1/2 -translate-y-1/2
              text-xl font-bold
            "
          >
            Zonedevs
          </span>
        )}

        {/* Botón siempre en el extremo derecho, verticalmente centrado */}
        <button
          onClick={onToggle}
          aria-label={collapsed ? 'Expandir menú' : 'Colapsar menú'}
          className="
            absolute
            right-2 top-1/2
            -translate-y-1/2
            p-1 rounded hover:bg-gray-200
          "
        >
          {!collapsed ?
            <PanelLeftClose className="w-5 h-5" /> : 
            <PanelRightClose className="w-5 h-5" />
          }
        </button>
      </SidebarHeader>

      <SidebarContent className="overflow-x-hidden">
        {/* Enlaces principales */}
        <SidebarMenu>
          {mainNav.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={isActive(item.href)}
                onClick={() => setOpenSection(null)}
                className={clsx('px-2 py-2', collapsed && 'justify-center')}
              >
                <Link href={item.href} className="flex items-center">
                  <item.icon className={iconClass} />
                  {!collapsed && (
                    <span className="ml-3 text-sm">{item.label}</span>
                  )}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>

        {/* Secciones colapsables */}
        {sections.map((sec) => (
          <SidebarMenu key={sec.id}>
            <Collapsible
              open={openSection === sec.id}
              onOpenChange={(o) =>
                setOpenSection(o ? sec.id : null)
              }
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <div
                    className={clsx(
                      'flex items-center px-2 cursor-pointer',
                      collapsed
                        ? 'py-1 justify-center'
                        : 'py-2 justify-start'
                    )}
                  >
                    {/* ICONO SIEMPRE MONTADO */}
                    <sec.icon className={iconClass} />

                    {/* ETIQUETA: sólo en expandido */}
                    {!collapsed && (
                      <>
                        <span className="ml-3 text-sm">{sec.title}</span>
                        <ChevronDown
                          className={clsx(
                            'w-4 h-4 ml-auto transition-transform duration-200',
                            openSection === sec.id && 'rotate-180'
                          )}
                        />
                      </>
                    )}
                  </div>
                </CollapsibleTrigger>
              </SidebarMenuItem>


              {/* Sólo mostramos sub-items si NO está colapsado */}
              {!collapsed && (
                <CollapsibleContent className="pl-8">
                  {sec.items.map((item) => (
                    <SidebarMenuSub key={item.href}>
                      <SidebarMenuButton asChild isActive={isActive(item.href)}>
                        <Link href={item.href}
                          className="flex items-center px-2 py-1"
                        >
                          <item.icon className={iconClass} />
                          <span className="ml-3 text-sm">{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuSub>
                  ))}
                </CollapsibleContent>
              )}
            </Collapsible>
          </SidebarMenu>
        ))}
      </SidebarContent>

      {/* FOOTER */}
      <SidebarFooter className="py-4">
        {collapsed ? (
          // Sólo avatar
          <Avatar className="h-6 w-6 mx-auto">
            <AvatarFallback className='bg-primary'>{user?.firstName?.[0]}</AvatarFallback>
          </Avatar>
        ) : (
          // Dropdown completo
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center w-full px-2 py-2 cursor-pointer">
                <Avatar className="h-6 w-6">
                  <AvatarFallback className='bg-primary'>
                    {user?.firstName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium truncate">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user?.email}
                  </p>
                </div>
                <ChevronsUpDown className="w-4 h-4 text-muted-foreground" />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align="start" className="w-56">
              <DropdownMenuLabel>
                <p className="text-xs text-gray-500">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => {}}>
                Account
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => {}}>
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="flex items-center">
                <LogoutButton />
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </SidebarFooter>
    </Sidebar>
    </>
  )
}
