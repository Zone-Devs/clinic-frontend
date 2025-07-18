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
import { Blocks, SendToBack, X } from 'lucide-react'
import { CreateStageForm } from './CreateStageForm'
import { EditStageForm } from './EditStageForm'

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
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  /* Delete */
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [stageToDelete, setStageToDelete] = useState<string | null>(null)
  const [stageToDeleteName, setStageToDeleteName] = useState<string>('')
  const [isDeleting, setIsDeleting] = useState(false)
  /* Edit */
  const [showEditModal, setShowEditModal] = useState(false)
  const [stageToEdit, setStageToEdit] = useState<Stage | null>(null)
  const [formValues, setFormValues] = useState({
    name: '',
    description: '',
    color: '',
  })
  const [isUpdating, setIsUpdating] = useState(false)

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
    }));
    setIsSubmitting(true);
    try {
      await axiosClient.patch('/api/stages/reorder', payload);

      setStages(current =>
        current.map((s, idx) => ({ ...s, orderNumber: idx + 1 }))
      );

      setHasChanges(false);
      toast.success('Flujo guardado con éxito');
    } catch (err) {
      console.error('Error guardando el flujo:', err);
      toast.error('Error al guardar el flujo');
    } finally {
      setIsSubmitting(false);
      setSortingEnabled(e => !e);
    }
  }
    /* Creacion de stage */
  async function confirmCreate() {
    setIsCreating(true)
    try {
      const { data: newStage } = await axiosClient.post<Stage>(
        '/api/stages',
        {
          name:        formValues.name,
          description: formValues.description,
          color:       formValues.color || "#000000",
        }
      )
      setStages((prev) =>
        [...prev, newStage]
      )
      toast.success('Etapa creada con éxito')
      setShowCreateModal(false)
    } catch (err) {
      console.error('Error creando etapa:', err)
      toast.error('No se pudo crear la etapa')
    } finally {
      setIsCreating(false)
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

  function initiateEdit(stage: Stage) {
    setStageToEdit(stage)
    setFormValues({
      name: stage.name,
      description: stage.description,
      color: stage.color,
    })
    setShowEditModal(true)
  }

  async function confirmEdit() {
    if (!stageToEdit) return
    setIsUpdating(true)

    try {
      const { data: updatedStage } = await axiosClient.patch<Stage>(
        `/api/stages/${stageToEdit.id}`,
        {
          name: formValues.name,
          description: formValues.description,
          color: formValues.color,
        }
      )
      // actualizamos la lista con el objeto devuelto
      setStages((prev) =>
        prev.map((s) => (s.id === updatedStage.id ? updatedStage : s))
      )
      toast.success('Etapa actualizada')
      setShowEditModal(false)
    } catch (err) {
      console.error('Error actualizando etapa:', err)
      toast.error('No se pudo actualizar')
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <>
      {/* Controles */}
      <div className="flex justify-end gap-2 mb-4">
        {!sortingEnabled && <Button
          onClick={() => {
            setFormValues({ name: '', description: '', color: '' })
            setShowCreateModal(true)
          }}
          className='bg-primary text-primary-foreground hover:bg-gray-700 hover:text-gray-100'
        >
          <Blocks />
          Añadir etapa
        </Button>}
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
            cursor-pointer
            ${sortingEnabled ? 'bg-red-500/100 text-primary-foreground hover:bg-red-400 hover:text-gray-100' : 'bg-primary text-primary-foreground hover:bg-gray-700 hover:text-gray-100'}
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

        {/* Dialogo de creacion de stage */}
        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogContent>
            <CreateStageForm
              formValues={formValues}
              setFormValues={setFormValues}
              onConfirm={confirmCreate}
              isLoading={isCreating}
              onCancel={() => setShowCreateModal(false)}
            />
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

        {/* Modal de editar */}
        <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
          <DialogContent>
             {/* onOpenAutoFocus={event => event.preventDefault()} */}
            <EditStageForm
              stageName={stageToEdit?.name || ''}
              formValues={formValues}
              setFormValues={setFormValues}
              onConfirm={confirmEdit}
              isLoading={isUpdating}
              onCancel={() => setShowEditModal(false)}
            />
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
                onEdit={() => initiateEdit(stage)}
              >
              <div className="flex flex-col gap-1 flex-1 min-w-0 overflow-hidden">
                <strong className="w-full truncate">{stage.name}</strong>
                <p className="text-sm text-gray-600 w-full truncate">
                  {stage.description}
                </p>
              </div>
              </SortableItem>
            ))}
          </SortableContext>
        </div>
      </DndContext>
    </>
  )
}
