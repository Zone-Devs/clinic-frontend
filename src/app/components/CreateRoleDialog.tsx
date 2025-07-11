'use client'

import { useState, useEffect } from 'react'
import axiosClient from '@/utils/axiosClient'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'

// Tipos ajustados
interface Permission {
  code: string
  name: string
}
interface PermissionGroup {
  group: string
  permissions: Permission[]
}

interface Props {
  onCreated: () => void
}

export function CreateRoleDialog({ onCreated }: Props) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [desc, setDesc] = useState('')

  // ─── States para permisos ───
  const [groups, setGroups] = useState<PermissionGroup[]>([])
  const [loadingPerms, setLoadingPerms] = useState(false)
  const [errorPerms, setErrorPerms] = useState<string>()
  const [selected, setSelected] = useState<string[]>([])

  // Cargo la lista de PermissionGroup cuando se abre el modal
  useEffect(() => {
    if (!open) return
    setLoadingPerms(true)
    setErrorPerms(undefined)

    axiosClient
      .get<PermissionGroup[]>('/api/permissions')
      .then(res => {
        setGroups(res.data)
      })
      .catch(() => {
        setErrorPerms('No se pudieron cargar los permisos.')
      })
      .finally(() => {
        setLoadingPerms(false)
      })
  }, [open])

  const togglePermission = (code: string) => {
    setSelected(sel =>
      sel.includes(code)
        ? sel.filter(x => x !== code)
        : [...sel, code]
    )
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()

    await axiosClient.post('/api/roles', {
      name,
      description: desc,
      permissionCodes: selected,
    })
    // limpio estado y cierro
    setName('')
    setDesc('')
    setSelected([])
    setOpen(false)
    onCreated()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Nuevo rol</Button>
      </DialogTrigger>
      <DialogContent className="
        w-full max-w-[90vw] sm:max-w-[80vw]
        md:max-w-lg lg:max-w-xl max-h-[80vh]
        overflow-y-auto
      ">
        <DialogHeader>
          <DialogTitle>Crear nuevo rol</DialogTitle>
          <DialogClose className="absolute right-4 top-4" />
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4 mt-2">
          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium mb-1">Nombre</label>
            <Input
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium mb-1">Descripción</label>
            <Input
              value={desc}
              onChange={e => setDesc(e.target.value)}
            />
          </div>

          {/* Permisos */}
            <div>
            <span className="block text-sm font-medium mb-2">Permisos</span>

            {loadingPerms && <p>Cargando permisos…</p>}
            {errorPerms   && <p className="text-destructive">{errorPerms}</p>}

            {!loadingPerms && !errorPerms && (
                <Accordion type="multiple" className="space-y-4">
                {groups.map(group => (
                    <AccordionItem key={group.group} value={group.group}>
                    <AccordionTrigger className="flex justify-between items-center bg-gray-100 px-4 py-2 rounded">
                        <span className="font-semibold">{group.group}</span>
                    </AccordionTrigger>

                    <AccordionContent className="px-4 pt-2">
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {group.permissions.map(perm => (
                            <div key={perm.code} className="flex items-center space-x-2">
                            <Checkbox
                                id={perm.code}
                                checked={selected.includes(perm.code)}
                                onCheckedChange={() => togglePermission(perm.code)}
                            />
                            <label htmlFor={perm.code} className="text-sm">
                                {perm.name}
                            </label>
                            </div>
                        ))}
                        </div>
                        <Separator className="my-3"/>
                    </AccordionContent>
                    </AccordionItem>
                ))}
                </Accordion>
            )}
            </div>

          {/* Botón Crear */}
          <div className="flex justify-end">
            <Button type="submit">Crear rol</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
