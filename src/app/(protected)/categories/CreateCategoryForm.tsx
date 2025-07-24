// src/app/(protected)/categories/CreateCategoryForm.tsx
'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Save, X } from 'lucide-react'

interface Props {
  onConfirm: (data: { name: string; description: string }) => void
  onCancel: () => void
  isLoading?: boolean
}

export const CreateCategoryForm = React.memo(function CreateCategoryForm({
  onConfirm,
  onCancel,
  isLoading = false,
}: Props) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  return (
    <>
      <DialogHeader>
        <DialogTitle>Crear nueva categoría</DialogTitle>
        <DialogDescription>
          Introduce un nombre y una descripción para tu categoría.
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-4 py-2">
        <label className="block">
          <span className="text-sm font-medium">Nombre</span>
          <input
            type="text"
            required
            className="mt-1 block w-full rounded border px-3 py-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej. Sutura"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium">Descripción</span>
          <textarea
            required
            className="mt-1 block w-full rounded border px-3 py-2"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Una breve descripción de la categoría"
          />
        </label>
      </div>

      <DialogFooter className="flex justify-end gap-2">
        <Button
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          <X />
          Cancelar
        </Button>
        <Button
          onClick={() => onConfirm({ name: name.trim(), description: description.trim() })}
          isLoading={isLoading}
          disabled={!name.trim() || !description.trim()}
        >
          {!isLoading && <Save />}
          Crear
        </Button>
      </DialogFooter>
    </>
  )
})
