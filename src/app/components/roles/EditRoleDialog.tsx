import { useState, useRef } from "react"
import { useRoleForm } from "../../hooks/UseRoleForms"
import axiosClient from '@/utils/axiosClient'
import { toast } from 'react-toastify'
import axios from "axios"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogDescription,
} from '@/components/ui/dialog'
import { RoleForm } from '@/app/components/roles/RoleForm'
import { Button } from "@/components/ui/button"
import { Edit, RefreshCcw } from "lucide-react"

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

export function EditRoleDialog({
  role,
  onEdited,
}: {
  role: Role
  onEdited: () => void
}) {
  const [open, setOpen] = useState(false)
  const form = useRoleForm({
    name: role.name,
    description: role.description || "",
    permissionsGroups: role.permissionsGroups,
  })
  const nameRef = useRef<HTMLDivElement>(null)
  const descRef = useRef<HTMLDivElement>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      form.reset()
    }
    setOpen(isOpen)
  }

  const handleSubmit = async () => {
    const errs = form.validate()

    if (errs.name) {
      nameRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }
    if (errs.desc) {
      descRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }
    if (errs.perms) {
      return
    }

    setIsSubmitting(true)

    const payload = {
      name: form.name,
      description: form.desc,
      permissionCodes: form.selected,
    }

    try {
      await axiosClient.patch(`/api/roles/${role.id}`, payload)

      // ← aquí va tu sección 3:
      toast.success("Rol actualizado correctamente")
      form.reset()
      setOpen(false)
      onEdited()
      // fin sección 3 →

    } catch (err) {
      const msg = axios.isAxiosError(err)
        ? (err.response?.data as any).message || err.message
        : "Error al actualizar el rol"
      toast.error(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon"><Edit /></Button>
      </DialogTrigger>
      <DialogContent   onOpenAutoFocus={e => e.preventDefault()}
        className="
          bg-background
          data-[state=open]:animate-in data-[state=closed]:animate-out
          fixed top-[50%] left-[50%] z-50
          w-full max-w-[90vw] sm:max-w-[80vw]
          md:max-w-[50rem] lg:max-w-[70rem]
          translate-x-[-50%] translate-y-[-50%]
          max-h-[90vh] overflow-y-auto
          rounded-lg border p-6 shadow-lg
      ">
        <DialogHeader>
          <DialogTitle>Editar rol</DialogTitle>
          <DialogDescription className="sr-only">Pantalla para editar un rol existente</DialogDescription>
        </DialogHeader>
        <RoleForm 
            {...form}
            nameRef={nameRef}
            descRef={descRef}
          />
        <div className="flex justify-end space-x-3 mt-6">
          <Button
            variant="destructive"
            onClick={() => {
              setOpen(false)
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            isLoading={isSubmitting}
          >
            {!isSubmitting && <RefreshCcw />}
            {isSubmitting ? 'Guardando…' : 'Actualizar'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}