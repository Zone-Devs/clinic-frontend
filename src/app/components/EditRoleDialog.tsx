'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import axiosClient from '@/utils/axiosClient'
import { Edit, UserCog } from 'lucide-react'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogDescription,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'react-toastify'
import { PermissionCard } from '@/app/components/PermissionCard'
import { permissionsGrouped } from "./CreateRoleDialog"
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

interface PermissionGroup {
  group: string
  permissions: { code: string; name: string }[]
}

interface Role {
  id: string
  name: string
  description?: string
  permissionsGroups?: PermissionGroup[]
}

interface Props {
  role: Role
  onEdited: () => void
}

export function EditRoleDialog({ role, onEdited }: Props) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState(role.name)
  const [desc, setDesc] = useState(role.description || '')
  const [groups, setGroups] = useState<PermissionGroup[]>([])
  const [selected, setSelected] = useState<string[]>([])
  const [loadingPerms, setLoadingPerms] = useState(false)
  const [errorPerms, setErrorPerms] = useState<string>()
  const [submitting, setSubmitting] = useState(false)

  // cuando abres el modal, carga todos los permisos y marca los que ya tiene el rol
  useEffect(() => {
    if (!open) return

    setLoadingPerms(true)
    axiosClient
      .get<PermissionGroup[]>('/api/permissions')
      .then(({ data }) => {
        setGroups(data)
        // extrae todos los codes de role.permissionsGroups
        const codes = role.permissionsGroups
          ? role.permissionsGroups.flatMap(g => g.permissions.map(p => p.code))
          : []
        setSelected(codes)
      })
      .catch(() => setErrorPerms('No se pudieron cargar los permisos.'))
      .finally(() => setLoadingPerms(false))
  }, [open, role.permissionsGroups])

  const togglePermission = useCallback((code: string) => {
    setSelected(sel =>
      sel.includes(code) ? sel.filter(c => c !== code) : [...sel, code]
    )
  }, [])

  const toggleAll = useCallback((codes: string[], checked: boolean) => {
    setSelected(sel =>
      checked
        ? Array.from(new Set([...sel, ...codes]))
        : sel.filter(c => !codes.includes(c))
    )
  }, [])

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
    <>
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
      {/* si quieres versión móvil real: */}
      <div className="md:hidden space-y-4">
        {permissionsGrouped.map((colNames, colIndex) => (
          <div key={colIndex} className="space-y-2">
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
    </>
  )
}, [groups, loadingPerms, errorPerms, selected, togglePermission, toggleAll])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      await axiosClient.put(`/api/roles/${role.id}`, {
        name,
        description: desc,
        permissionCodes: selected,
      })
      toast.success('Rol actualizado correctamente')
      onEdited()
      setOpen(false)
    } catch {
      toast.error('Error al actualizar el rol')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Edit />
        </Button>
      </DialogTrigger>
      <DialogContent className="
        w-full max-w-[90vw] sm:max-w-[80vw]
        md:max-w-[50rem] lg:max-w-[70rem]
        max-h-[90vh] overflow-y-auto
      ">
        <DialogHeader>
          <DialogTitle>Editar rol</DialogTitle>
          <DialogClose className="absolute right-4 top-4" />
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 mt-2">
          <div>
            <label className="block text-sm font-medium mb-1">Nombre</label>
            <Input
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Descripción</label>
            <Input value={desc} onChange={e => setDesc(e.target.value)} />
          </div>

          <div>
            <span className="block text-sm font-medium mb-2">
              Permisos
            </span>
            {permissionsUI}
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="submit" disabled={submitting} isLoading={submitting}>
              {!submitting && <UserCog />} 
              {submitting ? 'Guardando…' : 'Guardar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
