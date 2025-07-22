// src/app/(protected)/categories/EditCategoryForm.tsx
'use client'

import { useState, FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Category } from './CategoryManager'

interface Props {
  category: Category
  onConfirm: (data: { name: string; description: string }) => void
  onCancel: () => void
}

export function EditCategoryForm({ category, onConfirm, onCancel }: Props) {
  const [name, setName] = useState(category.name)
  const [description, setDescription] = useState(category.description)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    onConfirm({ name, description })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium">Nombre</label>
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border px-2 py-1 rounded"
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Descripción</label>
        <textarea
          required
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border px-2 py-1 rounded"
        />
      </div>
      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">Guardar</Button>
      </div>
    </form>
  )
}
