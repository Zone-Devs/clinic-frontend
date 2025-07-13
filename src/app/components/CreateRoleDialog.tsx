'use client'

import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import axiosClient from '@/utils/axiosClient'
import axios from 'axios'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Card,
  CardHeader,
  CardContent,
} from '@/components/ui/card'

import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'react-toastify'
import { PermissionCard } from '@/app/components/PermissionCard'
import { CirclePlusIcon, Plus, UserCog } from 'lucide-react'

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
  const nameRef = useRef<HTMLDivElement>(null)
  const descRef = useRef<HTMLDivElement>(null)

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
  const [isSubmitting, setIsSubmitting] = useState(false)


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
  const togglePermission = useCallback((code: string) => {
    setSelected(sel =>
      sel.includes(code)
        ? sel.filter(x => x !== code)
        : [...sel, code]
    )
  }, [])

  const toggleAll = useCallback((codes: string[], checked: boolean) => {
    setSelected(sel =>
      checked
        ? Array.from(new Set([...sel, ...codes]))
        : sel.filter(c => !codes.includes(c))
    )
  }, [])

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
    // if (!validate()) return
    const errs = { name: "", desc: "", perms: "" }
    if (!name.trim()) errs.name = "El nombre es obligatorio."
    else if (name.trim().length < 3) errs.name = "…más de 2 caracteres."
    if (!desc.trim()) errs.desc = "La descripción es obligatoria."
    else if (desc.trim().length < 3)
      errs.desc = "…más de 2 caracteres."
    if (selected.length === 0) errs.perms = "Debes seleccionar al menos un permiso."

    setErrors(errs)

    if (errs.name) {
      nameRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
      return
    }
    if (errs.desc) {
      descRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
      return
    }

    setIsSubmitting(true)

    try {
      await axiosClient.post('/api/roles', {
        name,
        description: desc,
        permissionCodes: selected,
      })

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
    } finally {
      setIsSubmitting(false)
    }
  }

  const permissionsUI = useMemo(() => {
    if (loadingPerms) {
      return (
        <>
          <div className="hidden md:flex gap-6">
            {permissionsGrouped.map((_, i) => (
              <Card key={i} className="flex-1 shadow animate-pulse">
                <CardHeader className="px-4 py-2">
                  <Skeleton className="h-6 w-1/2" />
                </CardHeader>
                <CardContent className="p-3 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </CardContent>
              </Card>
            ))}
          </div>
          {/* skeleton móvil */}
          <div className="md:hidden space-y-4">
            {permissionsGrouped.map((_, i) => (
              <div key={i} className="p-4 border rounded-lg shadow animate-pulse">
                <Skeleton className="h-5 w-1/3 mb-2" />
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-5/6" />
              </div>
            ))}
          </div>
        </>
      )
    }
    if (errorPerms) return <p className="text-red-600">{errorPerms}</p>

    return (
      <div className="hidden md:flex gap-6">
        {permissionsGrouped.map((colNames, colIndex) => (
          <div key={colIndex} className="space-y-2 flex-1">
            {colNames.map(groupName => {
              const grp = groups.find(g => g.group === groupName)
              return grp ? (
                <PermissionCard
                  key={grp.group}
                  group={grp}
                  selected={selected}
                  onToggle={togglePermission}
                  onToggleAll={toggleAll}
                />
              ) : null
            })}
          </div>
        ))}
      </div>
    )
  }, [groups, loadingPerms, errorPerms, selected, togglePermission, toggleAll])

    return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button><Plus />Crear nuevo rol</Button>
      </DialogTrigger>
      <DialogContent
        className="
          w-full max-w-[90vw] sm:max-w-[80vw]
          md:max-w-[50rem] lg:max-w-[70rem]
          max-h-[90vh] overflow-y-auto
        "
      >

        <DialogHeader>
          <DialogTitle>Crear nuevo rol</DialogTitle>
          <DialogDescription className="sr-only">
            Rellena los campos y asigna los permisos que quieras otorgar.
          </DialogDescription>
          <DialogClose className="absolute right-4 top-4" />
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4 mt-2">
          <div ref={nameRef}>
            <label className="block text-sm font-medium mb-1">Nombre</label>
            <Input
              value={name}
              onChange={e => setName(e.target.value)}
              disabled={isSubmitting}
            />
            {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
          </div>
          <div ref={descRef}>
            <label className="block text-sm font-medium mb-1">Descripción</label>
            <Input
              value={desc}
              onChange={e => setDesc(e.target.value)}
              disabled={isSubmitting}
            />
            {errors.desc && <p className="text-red-600 text-sm mt-1">{errors.desc}</p>}
          </div>
          <div>
            <span className="block text-sm font-medium mb-2">Permisos</span>
            {permissionsUI}
            {errors.perms && <p className="text-red-600 text-sm mt-1">{errors.perms}</p>}
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting} isLoading={isSubmitting}>
              {!isSubmitting && <UserCog />}
              {isSubmitting ? 'Creando…' : 'Crear rol'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
