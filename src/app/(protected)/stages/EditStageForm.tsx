'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { RefreshCcw, X } from 'lucide-react'

interface Props {
  initial: {
    name: string
    description: string
    color: string
  }
  onConfirm: (data: { name: string; description: string; color: string }) => void
  isLoading: boolean
  onCancel: () => void
}

export const EditStageForm = React.memo(function EditStageForm({
  initial,
  onConfirm,
  isLoading = false,
  onCancel,
}: Props) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [color, setColor] = useState('')

  useEffect(() => {
    setName(initial.name)
    setDescription(initial.description)
    setColor(initial.color)
  }, [initial.name, initial.description, initial.color])


  return (
    <>
      <DialogHeader>
        <DialogTitle>Editar etapa:</DialogTitle>
        <DialogDescription>Edita la información deseada.</DialogDescription>
      </DialogHeader>

      <div className="grid gap-4 py-2">
        {/* Nombre */}
        <label className="block">
          <span className="text-sm font-medium">Nombre</span>
          <input
            type="text"
            className="mt-1 block w-full rounded border px-3 py-2"
            value={name}
            onChange={e => setName(e.target.value)}
          />
        </label>

        {/* Descripción */}
        <label className="block">
          <span className="text-sm font-medium">Descripción</span>
          <textarea
            rows={3}
            className="mt-1 block w-full rounded border px-3 py-2"
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
        </label>

        {/* Color */}
        <div className="flex items-center gap-2">
          <label htmlFor="edit-stage-color" className="text-sm font-medium">
            Color
          </label>
          <input
            id="edit-stage-color"
            type="color"
            className="h-7 w-7 rounded-full border-2 p-0 appearance-none cursor-pointer"
            value={color}
            onChange={e => setColor(e.target.value)}
          />
        </div>
      </div>

      <DialogFooter className="flex justify-end gap-2">
        <Button
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          <X /> Cancelar
        </Button>
        <Button
          onClick={() =>
            onConfirm({
              name:        name.trim(),
              description: description.trim(),
              color:       color.trim(),
            })
          }
          isLoading={isLoading}
          disabled={!name.trim() || !description.trim()}
        >
          {!isLoading && <RefreshCcw />}
          Actualizar
        </Button>
      </DialogFooter>
    </>
  )
})
