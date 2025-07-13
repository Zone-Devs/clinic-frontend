import { useState, useRef } from "react"
import { useRoleForm } from "../hooks/UseRoleForms"
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
import { RoleForm } from '@/app/components/RoleForm'
import { Button } from "@/components/ui/button"
import { Plus, Save } from "lucide-react"

export function CreateRoleDialog({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false)
  const form = useRoleForm({ name: "", description: "" })
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
      await axiosClient.post("/api/roles", payload)

      toast.success("Rol creado correctamente")
      form.reset()
      setOpen(false)
      onCreated()
      // fin sección 3 →

    } catch (err) {
      // el mismo tratamiento de errores que tenías antes
      const msg = axios.isAxiosError(err)
        ? (err.response?.data as any).message || err.message
        : "Error al crear el rol"
      toast.error(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button><Plus /> Crear rol</Button>
      </DialogTrigger>
      <DialogContent className="
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
          <DialogTitle>Crear nuevo rol</DialogTitle>
          <DialogDescription className="sr-only">Pantalla para crear un nuevo rol</DialogDescription>
        </DialogHeader>
          <RoleForm 
            {...form}
            nameRef={nameRef}
            descRef={descRef}
          />
        <div className="flex justify-end" >
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            isLoading={isSubmitting}
          >
            {!isSubmitting && <Save />}
            {isSubmitting ? 'Guardando…' : 'Guardar'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
