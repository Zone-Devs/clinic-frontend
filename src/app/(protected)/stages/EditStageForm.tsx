// app/(protected)/stages/EditStageForm.tsx
import React from 'react'
import { Button } from '@/components/ui/button'
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { RefreshCcw, X } from 'lucide-react';

interface Props {
  formValues: { name: string; description: string; color: string }
  setFormValues: React.Dispatch<React.SetStateAction<any>>
  onConfirm: () => void
  isLoading: boolean
  onCancel: () => void
  stageName: string
}

interface StageFormValues {
  name: string
  description: string
  color: string
}

export const EditStageForm = React.memo(function EditStageForm({
  formValues,
  setFormValues,
  onConfirm,
  isLoading,
  onCancel,
  stageName,
}: Props) {
  return (
    <>
      <DialogHeader>
        <DialogTitle>Editar etapa: {stageName}</DialogTitle>
        <DialogDescription>Edita la información deseada</DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-2">
        <label className="block">
          <span className="text-sm font-medium">Nombre</span>
          <input
            type="text"
            className="mt-1 block w-full rounded border px-3 py-2"
            value={formValues.name}
            onChange={e =>
              setFormValues((f: StageFormValues) => ({ ...f, name: e.target.value }))
            }
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium">Descripción</span>
          <textarea
            className="mt-1 block w-full rounded border px-3 py-2"
            rows={3}
            value={formValues.description}
            onChange={e =>
              setFormValues((f: StageFormValues) => ({ ...f, description: e.target.value }))
            }
          />
        </label>
        <div className="flex items-center gap-2">
          <label htmlFor="color-picker" className="text-sm font-medium">
            Color
          </label>
          <input
            id="color-picker"
            type="color"
            className="h-7 w-7 rounded-full border-4 p-0 appearance-none cursor-pointer"
            value={formValues.color}
            onChange={e =>
              setFormValues((f: StageFormValues) => ({ ...f, color: e.target.value }))
            }
          />
        </div>
      </div>
      <DialogFooter className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel} disabled={isLoading}>
          <X />
          Cancelar
        </Button>
        <Button onClick={onConfirm} isLoading={isLoading}>
          {!isLoading && <RefreshCcw />}
          Actualizar
        </Button>
      </DialogFooter>
    </>
  )
})
