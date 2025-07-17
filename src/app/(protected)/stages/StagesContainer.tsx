// app/(protected)/stages/StageContainer.tsx
'use client'

import React, { useState, useEffect } from 'react'
import axiosClient from '@/utils/axiosClient'
import { toast } from 'react-toastify'

import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { SortableItem } from './SortableItem'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { SendToBack, X } from 'lucide-react'

interface Stage {
  id: string
  name: string
  description: string
  color: string
  orderNumber: number
  createdAt: string
  updatedAt: string
}

export default function StageContainer() {
  const [stages, setStages] = useState<Stage[]>([])
  const [originalStages, setOriginalStages] = useState<Stage[]>([])
  const [showDiscardDialog, setShowDiscardDialog] = useState(false)
  const [sortingEnabled, setSortingEnabled] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [stageToDelete, setStageToDelete] = useState<string | null>(null)
  const [stageToDeleteName, setStageToDeleteName] = useState<string>('')
  const [isDeleting, setIsDeleting] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor,   { activationConstraint: { distance: 5 } })
  )

  useEffect(() => {
    axiosClient
      .get<Stage[]>('/api/stages')
      .then((res) => {
        setStages(res.data.sort((a, b) => a.orderNumber - b.orderNumber))
      })
      .catch((err) => {
        console.error('Error fetching stages:', err)
        toast.error('No se pudieron cargar las etapas')
      })
  }, [])

  function handleDragEnd(event: DragEndEvent) {
    if (!sortingEnabled) return
    const { active, over } = event
    if (over && active.id !== over.id) {
      setStages((current) => {
        const oldIndex = current.findIndex((s) => s.id === active.id)
        const newIndex = current.findIndex((s) => s.id === over.id)
        const newOrder = arrayMove(current, oldIndex, newIndex)
        setHasChanges(true)
        return newOrder
      })
    }
  }

  async function handleSaveOrder() {
    const payload = stages.map((s, idx) => ({
      id: s.id,
      orderNumber: idx + 1,
    }))
    setIsSubmitting(true)
    try {
      await axiosClient.patch('/api/stages/reorder', payload)
      setHasChanges(false)
      toast.success('Flujo guardado con éxito')
    } catch (err) {
      console.error('Error guardando el flujo:', err)
      toast.error('Error al guardar el flujo')
    } finally {
      setIsSubmitting(false)
      setSortingEnabled((e) => !e)
    }
  }

  
 // 1) Inicia el flujo de eliminación (abre modal)
 function initiateDelete(id: string, name: string) {
   setStageToDelete(id)
   setStageToDeleteName(name)
   setShowDeleteModal(true)
 }

 // 2) Confirma la eliminación
 async function confirmDelete() {
   if (!stageToDelete) return
   setIsDeleting(true)
   try {
     await axiosClient.delete(`/api/stages/${stageToDelete}`)
     setStages((prev) => prev.filter((s) => s.id !== stageToDelete))
     toast.success('Etapa eliminada correctamente')
   } catch (err) {
     console.error('Error eliminando etapa:', err)
     toast.error('No se pudo eliminar la etapa')
   } finally {
     setIsDeleting(false)
     setShowDeleteModal(false)
     setStageToDelete(null)
   }
 }

  return (
    <>
      {/* Controles */}
      <div className="flex justify-end gap-2 mb-4">
        <Button
          onClick={() => {
            if (sortingEnabled && hasChanges) {
              setShowDiscardDialog(true)
              return
            }
            if (!sortingEnabled) {
              setOriginalStages(stages)
            }
            setSortingEnabled((e) => !e)
            setHasChanges(false)
          }}
          className={`
            px-3 py-2 rounded border border-gray-300 cursor-pointer
            ${sortingEnabled ? 'bg-red-500/100 text-primary-foreground hover:bg-red-400 hover:text-gray-100' : 'bg-primary text-primary-foreground hover:bg-gray-600 hover:text-gray-100'}
          `}
        >
          {sortingEnabled ? <><X />Cancelar</> : <><SendToBack />Reordenar</>}
        </Button>

        {/* Diálogo de confirmación de descarte */}
        <Dialog open={showDiscardDialog} onOpenChange={setShowDiscardDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Descartar cambios</DialogTitle>
            </DialogHeader>
            <DialogDescription>
              Tienes cambios sin guardar. ¿Seguro que deseas descartarlos?
            </DialogDescription>
            <DialogFooter className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  // cierra diálogo sin hacer nada
                  setShowDiscardDialog(false)
                }}
              >
                Continuar editando
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  // restaurar estado original y salir de modo reordenar
                  setStages(originalStages)
                  setSortingEnabled(false)
                  setHasChanges(false)
                  setShowDiscardDialog(false)
                }}
              >
                Descartar cambios
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

       {/* Modal de eliminar */}
       <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
         <DialogContent>
           <DialogHeader>
             <DialogTitle>Eliminar etapa: {stageToDeleteName}</DialogTitle>
           </DialogHeader>
           <DialogDescription>
             ¿Estás seguro de que deseas eliminar esta etapa? Esta acción no se puede deshacer.
           </DialogDescription>
           <DialogFooter className="flex justify-end gap-2">
             <Button
               variant="outline"
               onClick={() => setShowDeleteModal(false)}
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

        {/* Guardar sólo si hubo cambios */}
        {hasChanges && (
          <Button
            onClick={handleSaveOrder}
            className="px-3 py-2 rounded border border-gray-300 bg-primary text-primary-foreground cursor-pointer"
            isLoading={isSubmitting}
          >
            Guardar cambios
          </Button>
        )}
      </div>

      {/* Zona drag & drop */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div className="bg-gray-50 p-4 rounded-lg">
          <SortableContext
            items={stages.map((s) => s.id)}
            strategy={verticalListSortingStrategy}
          >
            {stages.map((stage, idx) => (
              <SortableItem
                key={stage.id}
                id={stage.id}
                disabled={!sortingEnabled}
                accentColor={stage.color}
                leftLabel={idx + 1}
                onDelete={() => initiateDelete(stage.id, stage.name)}
              >
                <div className="flex items-center gap-2">
                  <span
                    style={{
                      width: 12,
                      height: 12,
                      backgroundColor: stage.color,
                      borderRadius: '50%',
                    }}
                  />
                  <strong>{stage.name}</strong> — {stage.description}
                </div>
              </SortableItem>
            ))}
          </SortableContext>
        </div>
      </DndContext>
    </>
  )
}
