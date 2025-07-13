'use client'

import { useState } from 'react'
import axiosClient from '@/utils/axiosClient'
import { Trash2 } from 'lucide-react'
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogClose, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { toast } from 'react-toastify'

interface Props {
  roleId: string
  onDeleted: () => void
}

export function DeleteRoleDialog({ roleId, onDeleted }: Props) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    setLoading(true)
    try {
      await axiosClient.delete(`/api/roles/${roleId}`)
      toast.success('Rol eliminado correctamente')
      onDeleted()
      setOpen(false)
    } catch (err) {
      toast.error('Error al eliminar el rol')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" size="icon">
          <Trash2 />
        </Button>
      </DialogTrigger>
      <DialogContent className="w-full max-w-xs">
        <DialogHeader>
          <DialogTitle>Confirmar eliminación</DialogTitle>
          <DialogDescription className="sr-only">
            Cuadro de dialogo confirmando la eliminacion del rol.
          </DialogDescription>
          <DialogClose className="absolute right-4 top-4" />
        </DialogHeader>
        <p className="mt-2">¿Estás seguro de que deseas eliminar este rol?</p>
        <div className="mt-4 flex justify-end space-x-2">
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={loading}>
            {loading ? 'Eliminando...' : 'Eliminar'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
