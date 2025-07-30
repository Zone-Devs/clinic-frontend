// src/app/(protected)/categories/CategoryManager.tsx
'use client'

import { useEffect, useMemo, useState } from 'react'
import { Category, CategoryTable } from './CategoryTable'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { CreateCategoryForm } from './CreateCategoryForm'
import { EditCategoryForm } from './EditCategoryForm'
import axiosClient from '@/utils/axiosClient'
import { toast } from 'react-toastify'
import { Plus, Trash, X, XIcon } from 'lucide-react'
import debounce from 'lodash.debounce'
import { motion } from 'framer-motion'


interface CategoryManagerProps {
  initial: Category[]
}

const Spinner = () => (
    <div className="flex flex-col items-center justify-center h-[300px] w-full space-y-4">
      <motion.div
        className="w-10 h-10 border-4 border-muted border-t-transparent rounded-full"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 0.9, ease: 'linear' }}
      />
      <motion.p
        className="text-sm text-muted-foreground"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        Cargando...
      </motion.p>
    </div>
)


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

  // Busqueda
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const limit = 10

  const debouncer = useMemo(() => debounce((value: string) => {
    setDebouncedSearch(value)
    setPage(1)
  }, 600), [])

  useEffect(() => {
    debouncer(search)
    return () => debouncer.cancel()
  }, [search])

  useEffect(() => {
  async function fetchCategories() {
    setLoading(true)
    try {
      const res = await axiosClient.get('/api/categories', {
        params: { search: debouncedSearch, page, limit }
      })
      const json = res.data
      setCategories(Array.isArray(json) ? json : json.data)
    } catch {
      toast.error('Error al cargar categorías')
    } finally {
      setLoading(false)
    }
  }

  fetchCategories()
}, [debouncedSearch, page])

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
      <div className="flex items-center justify-between mb-4 gap-2">
        {/* Input a la izquierda */}
        <div className="relative w-full max-w-xs">
          <input
            type="text"
            placeholder="Buscar categoría"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border px-3 py-1.5 pr-9 rounded-md text-sm"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 cursor-pointer"
            >
              <XIcon />
            </button>
          )}
        </div>

        {/* Botón a la derecha */}
        <Button size="sm" onClick={() => setCreating(true)}>
          <Plus />
          Crear categoría
        </Button>
      </div>


      {/* Tabla */}
      {loading ? (
        <Spinner />
      ) : (
        <CategoryTable
          data={categories}
          onEdit={cat => setEditing(cat)}
          onDelete={(id, name) => initiateDelete(id, name)}
        />
      )}
      <div className="flex justify-end mt-4 gap-2">
        <Button size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1 || loading}>
          Anterior
        </Button>
        <Button size="sm" onClick={() => setPage(p => p + 1)} disabled={categories.length < limit || loading}>
          Siguiente
        </Button>
      </div>

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
              <X />
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              isLoading={isDeleting}
            >
              <Trash />
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
