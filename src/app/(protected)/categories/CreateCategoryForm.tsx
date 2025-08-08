// app/(protected)/categories/CreateCategoryForm.tsx
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
import { Save, X } from 'lucide-react'
import { FormField } from '@/app/components/forms/FormField'

const schema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres').max(255, 'Máximo 255 caracteres'),
  description: z.string().min(3, 'La descripción debe tener al menos 3 caracteres').max(255, 'Máximo 255 caracteres'),
})

type FormValues = z.infer<typeof schema>

interface Props {
  onConfirm: (data: { name: string; description: string }) => void
  onCancel: () => void
  isLoading?: boolean
}

const baseInput = 'mt-1 block w-full rounded border px-3 py-2'

export const CreateCategoryForm = React.memo(function CreateCategoryForm({
  onConfirm,
  onCancel,
  isLoading = false,
}: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: { name: '', description: '' },
  })

  const submit = (values: FormValues) => onConfirm(values)

  return (
    <>
      <DialogHeader>
        <DialogTitle>Crear nueva categoría</DialogTitle>
        <DialogDescription>
          Introduce un nombre y una descripción para tu categoría.
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit(submit)} className="space-y-4">
        <FormField label="Nombre" error={errors.name?.message}>
          <input
            {...register('name')}
            type="text"
            placeholder="Ej. Sutura"
            className={`${baseInput} ${errors.name ? 'border-red-500' : ''}`}
            aria-invalid={!!errors.name}
            aria-describedby="category-name-error"
          />
        </FormField>

        <FormField label="Descripción" error={errors.description?.message}>
          <textarea
            {...register('description')}
            rows={3}
            placeholder="Una breve descripción de la categoría"
            className={`${baseInput} ${errors.description ? 'border-red-500' : ''}`}
            aria-invalid={!!errors.description}
            aria-describedby="category-desc-error"
          />
        </FormField>

        <DialogFooter className="flex justify-end gap-2">
          <Button
            variant="outline"
            type="button"
            onClick={onCancel}
            disabled={isLoading}
          >
            <X />
            Cancelar
          </Button>
          <Button
            type="submit"
            isLoading={isLoading}
            disabled={!isValid || isLoading}
          >
            {!isLoading && <Save />}
            Crear
          </Button>
        </DialogFooter>
      </form>
    </>
  )
})
