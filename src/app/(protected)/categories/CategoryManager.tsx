'use client'

import { useState } from 'react'
import { Category, CategoryTable } from './CategoryTable'
import { Button } from '@/components/ui/button'
import { Dialog, DialogTrigger, DialogContent } from '@/components/ui/dialog'
import { CreateCategoryForm } from './CreateCategoryForm'
import { EditCategoryForm } from './EditCategoryForm'
import axios from '@/utils/axiosClient'
import { toast } from 'react-toastify'

interface CategoryManagerProps {
  initial: Category[]
}

export function CategoryManager({ initial }: CategoryManagerProps) {
  const [categories, setCategories] = useState<Category[]>(initial)
  const [editing, setEditing] = useState<Category | null>(null)
  const [creating, setCreating] = useState(false)

  // CREATE
  async function handleCreate(data: Omit<Category, 'id'>) {
    try {
      const { data: res } = await axios.post<{ data: Category }>('/categories', data)
      setCategories((prev) => [...prev, res.data])
      toast.success('Categoría creada')
      setCreating(false)
    } catch {
      toast.error('Error al crear categoría')
    }
  }

  // UPDATE
  async function handleEdit(id: string, data: Omit<Category, 'id'>) {
    try {
      const { data: res } = await axios.patch<{ data: Category }>(`/categories/${id}`, data)
      setCategories((prev) =>
        prev.map((c) => (c.id === id ? res.data : c))
      )
      toast.success('Categoría actualizada')
      setEditing(null)
    } catch {
      toast.error('Error al actualizar')
    }
  }

  // DELETE
  async function handleDelete(id: string) {
    if (!confirm('¿Seguro que deseas eliminar esta categoría?')) return
    try {
      await axios.delete(`/categories/${id}`)
      setCategories((prev) => prev.filter((c) => c.id !== id))
      toast.success('Categoría eliminada')
    } catch {
      toast.error('Error al eliminar')
    }
  }

  return (
    <div>
      {/* Toolbar */}
      <div className="flex justify-end mb-4">
        <Button onClick={() => setCreating(true)} size="sm">
          Crear categoría
        </Button>
      </div>

      {/* Tabla */}
      <CategoryTable
        data={categories}
        onEdit={(cat) => setEditing(cat)}
        onDelete={handleDelete}
      />

      {/* Modal Crear */}
      <Dialog open={creating} onOpenChange={setCreating}>
        <DialogContent>
          <CreateCategoryForm
            onConfirm={handleCreate}
            onCancel={() => setCreating(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Modal Editar */}
      {editing && (
        <Dialog open={!!editing} onOpenChange={() => setEditing(null)}>
          <DialogContent>
            <EditCategoryForm
              category={editing}
              onConfirm={(data) => handleEdit(editing.id, data)}
              onCancel={() => setEditing(null)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
