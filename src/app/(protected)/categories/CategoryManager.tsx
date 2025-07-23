// src/app/(protected)/categories/CategoryManager.tsx
'use client'

import { useState } from 'react'
import { Category, CategoryTable } from './CategoryTable'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { CreateCategoryForm } from './CreateCategoryForm'
import { EditCategoryForm } from './EditCategoryForm'
import axiosClient from '@/utils/axiosClient'
import { toast } from 'react-toastify'

interface CategoryManagerProps {
  initial: Category[]
}

export function CategoryManager({ initial }: CategoryManagerProps) {
  const [categories, setCategories] = useState<Category[]>(initial)
  // — Crear
  const [creating, setCreating] = useState(false)
  const [isCreating, setIsCreating] = useState(false)

  // — Editar
  const [editing, setEditing] = useState<Category | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)

  // ========== CREATE ==========
  async function handleCreate(payload: Omit<Category, 'id'>) {
    setIsCreating(true)
    try {
      const resp = await axiosClient.post<{ data: Category }>('/api/categories', payload)
      console.log('🚬 ===> :33 ===> handleCreate ===> resp:', resp);
      const nuevaCat = resp.data
      console.log('🚬 ===> :35 ===> handleCreate ===> nuevaCat:', nuevaCat);
      setCategories((prev) => [...prev, nuevaCat])
      toast.success('Categoría creada')
      setCreating(false)
    } catch {
      toast.error('Error al crear categoría')
    } finally {
      setIsCreating(false)
    }
  }

  // ========== UPDATE ==========
  async function handleEdit(id: string, payload: Omit<Category, 'id'>) {
    setIsUpdating(true)
    try {
      const resp = await axiosClient.patch<{ data: Category }>(`/categories/${id}`, payload)
      const updated = resp.data.data
      setCategories(prev =>
        prev.map(c => (c.id === id ? updated : c))
      )
      toast.success('Categoría actualizada')
      setEditing(null)
    } catch {
      toast.error('Error al actualizar categoría')
    } finally {
      setIsUpdating(false)
    }
  }

  // ========== DELETE ==========
  async function handleDelete(id: string) {
    if (!confirm('¿Seguro que deseas eliminar esta categoría?')) return
    try {
      await axiosClient.delete(`/categories/${id}`)
      setCategories(prev => prev.filter(c => c.id !== id))
      toast.success('Categoría eliminada')
    } catch {
      toast.error('Error al eliminar categoría')
    }
  }

  return (
    <div>
      {/* Toolbar */}
      <div className="flex justify-end mb-4">
        <Button size="sm" onClick={() => setCreating(true)}>
          Crear categoría
        </Button>
      </div>

      {/* Tabla */}
      <CategoryTable
        data={categories}
        onEdit={cat => setEditing(cat)}
        onDelete={handleDelete}
      />

      {/* ——— Crear categoría ——— */}
      <Dialog open={creating} onOpenChange={setCreating}>
        <DialogContent>
          <CreateCategoryForm
            onConfirm={handleCreate}
            onCancel={() => setCreating(false)}
            isLoading={isCreating}
          />
        </DialogContent>
      </Dialog>

      {/* ——— Editar categoría ——— */}
      {editing && (
        <Dialog open={!!editing} onOpenChange={() => setEditing(null)}>
          <DialogContent>
            <EditCategoryForm
              category={editing}
              onConfirm={data => handleEdit(editing.id, data)}
              onCancel={() => setEditing(null)}
              isLoading={isUpdating}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
