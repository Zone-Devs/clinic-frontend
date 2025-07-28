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
import { LayoutDashboard, ShieldUser, Workflow, Tag, Cog, ChevronDown, LogOutIcon, ChevronsUpDown } from 'lucide-react'
import { useUser } from '@/context/UserContext'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { LogoutButton } from './LogoutButton'

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
  const { user } = useUser()
  console.log('🚬 ===> :54 ===> AppSidebar ===> user:', user);

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
        <SidebarFooter className="px-4 py-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton className="w-full flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarFallback className='bg-primary'>{user?.firstName?.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col text-sm truncate">
                <span className="font-medium text-primary-foreground truncate">{user?.firstName} {user?.lastName}</span>
                <span className="text-xs text-muted-foreground truncate">{user?.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto w-4 h-4 text-muted-foreground" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent side="top" align="start" className="w-56">
            <DropdownMenuLabel>
              <p className='text-xs text-gray-500'>{user?.firstName} {user?.lastName}</p>
              <p className='text-xs text-gray-500'>{user?.email}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => { /* ir a perfil */ }}>
              Account
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => { /* ir a settings */ }}>
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="flex items-center">
              {/* <LogOutIcon className="w-4 h-4 mr-2" />
              Log out */}
              <LogoutButton />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
      </Sidebar>
  </>
  )
}
