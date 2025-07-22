'use client'

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
import { ProfileComponent } from './ProfileComponent'
import { useUser } from '@/context/UserContext'

interface Props {
  onHamburgerClick: () => void
}

export default function NavbarClient() {
  const { user } = useUser()

  return (
    <header className="flex items-center justify-between px-6 py-3 border-b border-gray-200">
      <div className="flex-1" />
      <div className="flex items-right space-x-4">

        {/* Avatar + Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="cursor-pointer">
              {user?.fullName ? (
                <AvatarImage alt={user.email} />
              ) : (
                <AvatarFallback>{user?.firstName.charAt(0)}</AvatarFallback>
              )}
            </Avatar>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuItem asChild>
              <ProfileComponent/>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <LogoutButton />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
