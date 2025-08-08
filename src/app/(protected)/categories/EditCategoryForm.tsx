// app/(protected)/categories/EditCategoryForm.tsx
'use client'

import React, { useEffect } from 'react'
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
import type { Category } from './CategoryTable'

const schema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres').max(255, 'Máximo 255 caracteres'),
  description: z.string().min(3, 'La descripción debe tener al menos 3 caracteres').max(255, 'Máximo 255 caracteres'),
})
type FormValues = z.infer<typeof schema>

interface Props {
  category: Category
  onConfirm: (data: { name: string; description: string }) => void | Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

const baseInput = 'mt-1 block w-full rounded border px-3 py-2'

export const EditCategoryForm = React.memo(function EditCategoryForm({
  category,
  onConfirm,
  onCancel,
  isLoading = false,
}: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: {
      name: category.name,
      description: category.description,
    },
  })

  // Si cambia la categoría mientras el modal está abierto, sincroniza campos sin resetear todo
  useEffect(() => {
    setValue('name', category.name, { shouldValidate: true })
    setValue('description', category.description, { shouldValidate: true })
  }, [category, setValue])

  const submit = async (values: FormValues) => {
    await onConfirm(values)
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Editar categoría</DialogTitle>
        <DialogDescription>
          Modifica el nombre o la descripción de la categoría.
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
          />
        </FormField>

        <FormField label="Descripción" error={errors.description?.message}>
          <textarea
            {...register('description')}
            rows={3}
            placeholder="Una breve descripción de la categoría"
            className={`${baseInput} ${errors.description ? 'border-red-500' : ''}`}
            aria-invalid={!!errors.description}
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
            Guardar
          </Button>
        </DialogFooter>
      </form>
    </>
  )
})
