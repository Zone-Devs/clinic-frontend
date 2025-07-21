'use client'

import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from '@/components/ui/sheet'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { User2, X } from 'lucide-react'
import { useUser } from '@/context/UserContext'

export function ProfileComponent() {
  const { user } = useUser()

  return (
    <Sheet>
      {/* Dispara el sheet con el avatar */}
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start transition-all ml-2 mt-2 py-4"
        >
          <User2 className="mr-2 h-4 w-4" />
          Perfil
        </Button>
      </SheetTrigger>

      <SheetContent>
        {/* Header con título y botón de cerrar */}
        <SheetHeader className="flex items-center justify-between">
          <SheetTitle>Tu Perfil</SheetTitle>
        </SheetHeader>

        {/* Avatar grande + nombre y email */}
        <div className="flex flex-col items-center py-4 space-y-2">
          <Avatar className="h-20 w-20">
            {user?.fullName ? (
              <AvatarImage />
            ) : (
              <AvatarFallback className="text-2xl">
                {user?.firstName.charAt(0)}
              </AvatarFallback>
            )}
          </Avatar>
          <p className="text-lg font-semibold">{user?.fullName}</p>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
        </div>

        <Separator />

        {/* Datos adicionales */}
        <div className="space-y-4 p-4">
          <div>
            <p className="text-xs text-muted-foreground">Nombre</p>
            <p>{user?.firstName}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Apellido</p>
            <p>{user?.lastName}</p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
