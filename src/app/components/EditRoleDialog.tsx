'use client'

import { useState } from 'react'
import axiosClient from '@/utils/axiosClient'
import { Edit } from 'lucide-react'
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'react-toastify'

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
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await axiosClient.put(`/api/roles/${role.id}`, { name, description: desc })
      toast.success('Rol actualizado')
      onEdited()
      setOpen(false)
    } catch {
      toast.error('Error al actualizar el rol')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon"><Edit /></Button>
      </DialogTrigger>
      <DialogContent className="w-full max-w-md">
        <DialogHeader>
          <DialogTitle>Editar rol</DialogTitle>
          <DialogClose className="absolute right-4 top-4" />
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div>
            <label className="block text-sm font-medium mb-1">Nombre</label>
            <Input value={name} onChange={e => setName(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Descripción</label>
            <Input value={desc} onChange={e => setDesc(e.target.value)} />
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
