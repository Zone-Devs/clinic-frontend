'use client'

import Link from 'next/link'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import { LogoutButton } from './LogoutButton'

interface Props {
  onMenuToggle?: () => void
  user: {
    id: string
    email?: string
    avatarUrl?: string
  }
}

export default function NavbarClient({ onMenuToggle, user }: Props) {
  return (
    <header className="flex items-center justify-between px-6 py-3 border-b bg-white">
      <div className="flex-1" />

      {/* Área de usuario */}
      <div className="flex items-right space-x-4">

        {/* Avatar + Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="cursor-pointer">
              {user?.avatarUrl ? (
                <AvatarImage src={user.avatarUrl} alt={user.email} />
              ) : (
                <AvatarFallback>
                  {user?.email?.[0].toUpperCase()}
                </AvatarFallback>
              )}
            </Avatar>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem asChild>
              <Link href="/profile" className="flex items-center gap-2 px-2 py-1">
                Perfil
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <LogoutButton />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
