// app/(protected)/stages/EditStageForm.tsx
'use client'

import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { RefreshCcw, X } from 'lucide-react'

import { FormField } from '@/app/components/forms/FormField'

const stageSchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres').max(255, 'Máximo 255 caracteres'),
  description: z.string().min(3, 'La descripción debe tener al menos 3 caracteres').max(255, 'Máximo 255 caracteres'),
  color: z.string().nonempty(),
})
type FormValues = z.infer<typeof stageSchema>

interface Props {
  initial: FormValues
  onConfirm: (data: FormValues) => void
  isLoading: boolean
  onCancel: () => void
}

const baseInput = 'mt-1 block w-full rounded border px-3 py-2'

export const EditStageForm = React.memo(function EditStageForm({
  initial,
  onConfirm,
  isLoading,
  onCancel,
}: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<FormValues>({
    resolver: zodResolver(stageSchema),
    mode: 'onChange',
    defaultValues: initial,
  })

  return (
    <>
      <DialogHeader>
        <DialogTitle>Editar etapa</DialogTitle>
        <DialogDescription>Edita la información deseada.</DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit(onConfirm)} className="space-y-4">
        <FormField label="Nombre" error={errors.name?.message}>
          <input
            {...register('name')}
            type="text"
            className={`${baseInput} ${errors.name ? 'border-red-500' : ''}`}
            placeholder="Ej. Inicio"
            aria-invalid={!!errors.name}
            aria-describedby="name-error"
          />
        </FormField>

        <FormField label="Descripción" error={errors.description?.message}>
          <textarea
            {...register('description')}
            rows={3}
            className={`${baseInput} ${errors.description ? 'border-red-500' : ''}`}
            placeholder="Una breve descripción de la etapa"
            aria-invalid={!!errors.description}
            aria-describedby="desc-error"
          />
        </FormField>

        <FormField label="Color">
          <div className="flex items-center gap-2">
            <input
              {...register('color')}
              id="color-picker"
              type="color"
              className="h-7 w-7 rounded-full border-2 p-0 appearance-none cursor-pointer"
            />
          </div>
        </FormField>

        <DialogFooter className="flex justify-end gap-2">
          <Button variant="outline" type="button" onClick={onCancel} disabled={isLoading}>
            <X /> Cancelar
          </Button>
          <Button type="submit" isLoading={isLoading} disabled={!isValid || isLoading}>
            {!isLoading && <RefreshCcw />}
            Actualizar
          </Button>
        </DialogFooter>
      </form>
    </>
  )
})
