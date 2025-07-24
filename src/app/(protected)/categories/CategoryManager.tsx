// src/app/(protected)/categories/CategoryManager.tsx
'use client'

import { useState } from 'react'
import { Category, CategoryTable } from './CategoryTable'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { CreateCategoryForm } from './CreateCategoryForm'
import { EditCategoryForm } from './EditCategoryForm'
import axiosClient from '@/utils/axiosClient'
import { toast } from 'react-toastify'
import { Plus } from 'lucide-react'

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

  // — Eliminar
  const [categoryToDelete, setCategoryToDelete] = useState<{
    id: string
    name: string
  } | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // ========== CREATE ==========
  async function handleCreate(payload: Omit<Category, 'id'>) {
    setIsCreating(true)
    try {
      const resp = await axiosClient.post<Category>('/api/categories', payload)
      const newCategory = resp.data
      if (!newCategory) {
        throw new Error('Error al crear categoría')
      }
      setCategories((prev) => [...prev, newCategory])
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
      const resp = await axiosClient.patch<Category>(`api/categories/${id}`, payload)
      const updatedCategory = resp.data
      setCategories(prev =>
        prev.map(c => (c.id === id ? updatedCategory : c))
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
  function initiateDelete(id: string, name: string) {
    setCategoryToDelete({ id, name })
    setShowDeleteDialog(true)
  }

  async function confirmDelete() {
    if (!categoryToDelete) return
    setIsDeleting(true)
    try {
      await axiosClient.delete(
        `/api/categories/${categoryToDelete.id}`
      )
      // actualizamos lista
      setCategories(prev =>
        prev.filter(c => c.id !== categoryToDelete.id)
      )
      toast.success(`Categoría "${categoryToDelete.name}" eliminada`)
    } catch {
      toast.error('Error al eliminar categoría')
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
      setCategoryToDelete(null)
    }
  }

  return (
    <div>
      {/* Toolbar */}
      <div className="flex justify-end mb-4">
        <Button size="sm" onClick={() => setCreating(true)}>
          <Plus />
          Crear categoría
        </Button>
      </div>

      {/* Tabla */}
      <CategoryTable
        data={categories}
        onEdit={cat => setEditing(cat)}
        onDelete={(id, name) => initiateDelete(id, name)}
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

      {/* ——— Diálogo de confirmación de borrado ——— */}
      <Dialog
        open={showDeleteDialog}
        onOpenChange={open => {
          if (!open) setCategoryToDelete(null)
          setShowDeleteDialog(open)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar categoría</DialogTitle>
            <DialogDescription>
              ¿Seguro que deseas eliminar la categoría{' '}
              <strong>{categoryToDelete?.name}</strong>? Esta acción no
              se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isDeleting}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              isLoading={isDeleting}
            >
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
