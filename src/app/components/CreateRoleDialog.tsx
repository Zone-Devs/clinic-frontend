'use client'

import { useState, useEffect, useMemo } from 'react'
import axiosClient from '@/utils/axiosClient'
import axios, { AxiosError } from 'axios'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card'

import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'react-toastify'

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

// Note: If some group has been updated, this const should be updated too...
const permissionsGrouped = [
  ['Calendario', 'Dashboard', 'Pagos', 'Roles y Permisos'],
  ['Mascotitas', 'Staff', 'Veterinario'],
  ['Citas Medicas', 'Historial Medico', 'Procedimientos quirúrgicos', 'Vacunas']
];

export function CreateRoleDialog({ onCreated }: Props) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [desc, setDesc] = useState('')

  // errores de validación
  const [errors, setErrors] = useState({
    name: '',
    desc: '',
    perms: '',
  })

  // permisos
  const [groups, setGroups] = useState<PermissionGroup[]>([])
  const [loadingPerms, setLoadingPerms] = useState(false)
  const [errorPerms, setErrorPerms] = useState<string>()
  const [selected, setSelected] = useState<string[]>([])

  // cargar permisos al abrir
  useEffect(() => {
    if (!open) return
    setLoadingPerms(true)
    setErrorPerms(undefined)

    axiosClient
      .get<PermissionGroup[]>('/api/permissions')
      .then((res) => setGroups(res.data))
      .catch(() => setErrorPerms('No se pudieron cargar los permisos.'))
      .finally(() => setLoadingPerms(false))
  }, [open])

  const togglePermission = (code: string) => {
    setSelected((sel) =>
      sel.includes(code) ? sel.filter((x) => x !== code) : [...sel, code]
    )
  }

  const validate = () => {
    const errs = { name: '', desc: '', perms: '' }
    if (!name.trim()) {
      errs.name = 'El nombre es obligatorio.'
    } else if ((name.trim()).length < 3) {
      if ((name.trim()).length < 3) errs.name = 'El nombre debe contener más de 2 caracteres.'
    } else {
      errs.name = '';
    }
    if (!desc.trim()) {
      errs.desc = 'La descripción es obligatoria.'
    } else if ((desc.trim()).length < 3) {
      if ((desc.trim()).length < 3) errs.desc = 'La descripción debe contener más de 2 caracteres.'
    } else {
      errs.desc = '';
    }
    if (selected.length === 0) errs.perms = 'Debes seleccionar al menos un permiso.'
    setErrors(errs)
    // válido si todos los mensajes de error están vacíos
    return !errs.name && !errs.desc && !errs.perms
  }

  const resetForm = () => {
    setName('')
    setDesc('')
    setSelected([])
    setErrors({ name: '', desc: '', perms: '' })
  }

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) resetForm()
    setOpen(isOpen);
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    try {
      await axiosClient.post('/api/roles', {
        name,
        description: desc,
        permissionCodes: selected,
      })

      // limpio estado y cierro
      resetForm()
      setOpen(false)
      onCreated()

    } catch (err) {
      let msg = ''

      if (axios.isAxiosError(err)) {
        const data = err.response?.data
        if (data && typeof data === 'object' && 'message' in data) {
          msg = (data as any).message
        } else {
          msg = err.message
        }
      }

      toast.error(msg)
    }
  }

  const permissionsUI = useMemo(() => {
    if (loadingPerms)  return <p>Cargando permisos…</p>
    if (errorPerms)    return <p className="text-red-600">{errorPerms}</p>

    return (
      <>
        {/* Desktop: 3 cards */}
        <div className="hidden md:flex gap-6">
          {permissionsGrouped.map((col, i) => (
            <Card key={i} className="flex-2 shadow rounded-lg pt-0 overflow-hidden">
              {col
                .map(name => groups.find(g => g.group === name))
                .filter(Boolean)
                .map(group => {
                  const codes = group!.permissions.map(p => p.code)
                  const allSel = codes.every(c => selected.includes(c))
                  return (
                    <div key={group!.group}>
                      <CardHeader className="flex items-center justify-between bg-gray-100 px-4 py-2 rounded-t-lg">
                        <CardTitle className="text-lg">{group!.group}</CardTitle>
                        <Checkbox
                          checked={allSel}
                          onCheckedChange={checked => {
                            setSelected(sel =>
                              checked
                                ? Array.from(new Set([...sel, ...codes]))
                                : sel.filter(c => !codes.includes(c))
                            )
                          }}
                        />
                      </CardHeader>
                      <CardContent className="space-y-2 p-3">
                        {group!.permissions.map(perm => (
                          <label key={perm.code} className="flex items-center space-x-2">
                            <Checkbox
                              checked={selected.includes(perm.code)}
                              onCheckedChange={() => togglePermission(perm.code)}
                            />
                            <span className="text-sm">{perm.name}</span>
                          </label>
                        ))}
                      </CardContent>
                    </div>
                  )
                })}
            </Card>
          ))}
        </div>

        {/* Móvil: tal cual ya lo tienes */}
        <div className="md:hidden space-y-4">
          {groups.map(group => (
            <div key={group.group} className="p-4 border rounded-lg shadow-sm">
              <h3 className="font-semibold mb-2">{group.group}</h3>
              <div className="grid grid-cols-2 gap-3">
                {group.permissions.map(perm => (
                  <label key={perm.code} className="flex items-center space-x-2">
                    <Checkbox
                      checked={selected.includes(perm.code)}
                      onCheckedChange={() => togglePermission(perm.code)}
                    />
                    <span className="text-sm">{perm.name}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </>
    )
  }, [groups, selected, loadingPerms, errorPerms])

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>Crear nuevo rol</Button>
      </DialogTrigger>
      <DialogContent className="
        w-full
        max-w-[90vw]
        sm:max-w-[80vw]
        md:max-w-[50rem]     /* antes 32rem, ahora ~42rem */
        lg:max-w-[70rem]     /* antes 36rem, ahora ~48rem */
        max-h-[90vh]
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
              onChange={(e) => setName(e.target.value)}
            />
            {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium mb-1">Descripción</label>
            <Input
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
            />
            {errors.desc && <p className="text-red-600 text-sm mt-1">{errors.desc}</p>}
          </div>

          {/* Permisos */}
          {permissionsUI}
          {errors.perms && (
            <p className="text-red-600 text-sm mt-1">{errors.perms}</p>
          )}

          {/* Botón Crear */}
          <div className="flex justify-end">
            <Button type="submit">
              Crear rol
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
