// app/(protected)/stages/CreateStageForm.tsx
import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Save, X } from 'lucide-react';

interface Props {
  onConfirm: (data: {name: string; description: string; color: string}) => void
  isLoading: boolean
  onCancel: () => void
}

interface StageFormValues {
  name: string
  description: string
  color: string
}

export const CreateStageForm = React.memo(function CreateStageForm({
  onConfirm,
  isLoading,
  onCancel,
}: Props) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [color, setColor] = useState('#000000')

  return (
    <>
      <DialogHeader>
        <DialogTitle>Añadir nueva etapa</DialogTitle>
        <DialogDescription>
          Completa los datos para crear una etapa.
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-2">
        <label className="block">
          <span className="text-sm font-medium">Nombre</span>
          <input
            type="text"
            className="mt-1 block w-full rounded border px-3 py-2"
            value={name}
            onChange={e => setName(e.target.value)
            }
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium">Descripción</span>
          <textarea
            className="mt-1 block w-full rounded border px-3 py-2"
            rows={2}
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
        </label>
        <div className="flex items-center gap-2">
          <label htmlFor="new-stage-color" className="text-sm font-medium">
            Color
          </label>
          <input
            id="new-stage-color"
            type="color"
            className="
              h-7 w-7
              rounded-full
              border-2
              p-0
              appearance-none
              cursor-pointer
            "
            value={color}
            onChange={e => setColor(e.target.value)}
          />
        </div>
      </div>
      <DialogFooter className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel} disabled={isLoading}>
          <X />
          Cancelar
        </Button>
        <Button onClick={() => onConfirm({ name: name.trim(), description: description.trim(), color: color.trim() })}
          isLoading={isLoading}
          disabled={!name.trim() || !description.trim()}
        >
          {!isLoading && <Save />}
          Guardar
        </Button>
      </DialogFooter>
    </>
  )
})
