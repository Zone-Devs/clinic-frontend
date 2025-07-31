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
import { Counter } from '@/app/components/Counter'

interface Props {
  onConfirm: (data: {
    name: string;
    description: string;
    model: string;
    quantity: number;
  }) => void
  onCancel: () => void
  isLoading?: boolean
}

export const CreateEquipmentForm = React.memo(function CreateEquipmentForm({
  onConfirm,
  onCancel,
  isLoading = false,
}: Props) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [model, setModel] = useState('')
  const [quantity, setQuantity] = useState(1)

  return (
    <>
      <DialogHeader>
        <DialogTitle>Crear nuevo equipo</DialogTitle>
        <DialogDescription>
          Introduce un nombre y una descripción para tu equipo.
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
            placeholder="Ej. Bisturí"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium">Modelo / Nº de serie</span>
          <input
            required
            className="mt-1 block w-full rounded border px-3 py-2"
            type='text'
            value={model}
            onChange={(e) => setModel(e.target.value)}
            placeholder="Escribe el modelo de tu equipo"
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
            placeholder="Una breve descripción de tu equipo"
          />
        </label>
        {/* Counter */}
        <Counter value={quantity} onChange={setQuantity} min={1} max={10} />
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
          onClick={() => onConfirm({
            name: name.trim(),
            description: description.trim(),
            model: model.trim(),
            quantity: quantity
          })}
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
