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
import { Plus, Search, Trash, X, XIcon } from 'lucide-react'
import debounce from 'lodash.debounce'
import { ClassicPagination } from '@/app/components/Pagination'
import Spinner from '@/app/components/Spinner'


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

  // Busqueda
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(false)
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [limit, setLimit] = useState(10)

  async function loadCategories(newPage = page, currentSearch = debouncedSearch) {
    setLoading(true)
    try {
      const res = await axiosClient.get('/api/categories', {
        params: { search: currentSearch, page: newPage, limit }
      })
      const json = res.data

      const resultData = Array.isArray(json) ? json : json.data
      setCategories(resultData)

      // Actualiza totalPages correctamente
      if (json.totalPages) {
        setTotalPages(json.totalPages)
      } else {
        const totalItems = json.total || resultData.length
        setTotalPages(Math.ceil(totalItems / limit))
      }
    } catch {
      toast.error('Error al cargar categorías')
    } finally {
      setLoading(false)
    }
  }

  const debouncer = useMemo(() => debounce((value: string) => {
    setDebouncedSearch(value)
    setPage(1)
  }, 600), [])

  useEffect(() => {
    debouncer(search)
    return () => debouncer.cancel()
  }, [search])

  useEffect(() => {
    loadCategories()
  }, [debouncedSearch, page, limit])

  // ========== CREATE ==========
  async function handleCreate(payload: Omit<Category, 'id'>) {
    setIsCreating(true)
    try {
      const resp = await axiosClient.post<Category>('/api/categories', payload)
      const newCategory = resp.data
      if (!newCategory) {
        throw new Error('Error al crear categoría')
      }
      toast.success('Categoría creada')
      setCreating(false)
      setPage(1)
      await loadCategories()
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
      toast.success(`Categoría "${categoryToDelete.name}" eliminada`)
      const nextPage = categories.length === 1 && page > 1 ? page - 1 : page
      setPage(nextPage)
      await loadCategories(nextPage)
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4">
        {/* Filtro e input */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <input
              type="text"
              placeholder="Buscar categoría"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border px-3 py-1.5 pl-9 pr-9 rounded-md text-sm"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 cursor-pointer"
              >
                <XIcon className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 text-sm">
            <label htmlFor="limit">Mostrar</label>
            <select
              id="limit"
              className="border rounded-md px-2 py-1"
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value))
                setPage(1)
              }}
            >
              {[5, 10, 20, 50].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
            <span>registros</span>
          </div>
        </div>

        {/* Botón */}
        <Button size="sm" onClick={() => setCreating(true)} className="w-full sm:w-auto justify-center">
          <Plus className="mr-1 h-4 w-4" />
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
      {/* Seccion de paginacion */}
      <ClassicPagination
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        loading={loading}
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
              <X />
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              isLoading={isDeleting}
            >
              {!isDeleting && <Trash />}
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
