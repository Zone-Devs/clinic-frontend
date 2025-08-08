// app/(protected)/stages/CreateStageForm.tsx
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

const stageSchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres').max(255, 'Máximo 255 caracteres'),
  description: z.string().min(3, 'La descripción debe tener al menos 3 caracteres').max(255, 'Máximo 255 caracteres'),
  color: z.string().nonempty(),
})
type FormValues = z.infer<typeof stageSchema>

interface Props {
  onConfirm: (data: FormValues) => void
  isLoading: boolean
  onCancel: () => void
}

const baseInput = 'mt-1 block w-full rounded border px-3 py-2'

// const FormField: React.FC<{
//   label: string
//   error?: string
//   children: React.ReactNode
// }> = ({ label, error, children }) => (
//   <div>
//     <label className="block">
//       <span className="text-sm font-medium">{label}</span>
//       {children}
//     </label>
//     <FieldError message={error} />
//   </div>
// )

export const CreateStageForm = React.memo(function CreateStageForm({
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
    defaultValues: { name: '', description: '', color: '#000000' },
  })

  return (
    <>
      <DialogHeader>
        <DialogTitle>Añadir nueva etapa</DialogTitle>
        <DialogDescription>Completa los datos para crear una etapa.</DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit(onConfirm)} className="space-y-4">
        <FormField label="Nombre" error={errors.name?.message}>
          <input
            {...register('name')}
            type="text"
            className={`${baseInput} ${errors.name ? 'border-red-500' : ''}`}
            placeholder="Ej. Inicio"
          />
        </FormField>

        <FormField label="Descripción" error={errors.description?.message}>
          <textarea
            {...register('description')}
            rows={2}
            className={`${baseInput} ${errors.description ? 'border-red-500' : ''}`}
            placeholder="Una breve descripción de la etapa"
          />
        </FormField>

        <div className="flex items-center gap-2">
          <label htmlFor="color-picker" className="text-sm font-medium">
            Color
          </label>
          <input
            {...register('color')}
            id="color-picker"
            type="color"
            className="h-7 w-7 rounded-full border-2 p-0 appearance-none cursor-pointer"
          />
        </div>

        <DialogFooter className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            <X />
            Cancelar
          </Button>
          <Button type="submit" isLoading={isLoading} disabled={!isValid || isLoading}>
            {!isLoading && <Save />}
            Guardar
          </Button>
        </DialogFooter>
      </form>
    </>
  )
})
