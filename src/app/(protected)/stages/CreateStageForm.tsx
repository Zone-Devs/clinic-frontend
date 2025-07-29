// app/(protected)/stages/CreateStageForm.tsx
'use client'

import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { AnimatePresence, motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Save, X } from 'lucide-react'

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
        <DialogDescription>
          Completa los datos para crear una etapa.
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit(onConfirm)} className="space-y-4">
        {/* Nombre */}
        <div>
          <label className="block">
            <span className="text-sm font-medium">Nombre</span>
            <input
              {...register('name')}
              type="text"
              className={`mt-1 block w-full rounded border px-3 py-2 ${
                errors.name ? 'border-red-500' : ''
              }`}
              placeholder="Ej. Inicio"
            />
          </label>
          <AnimatePresence initial={false} mode="wait">
            {errors.name && (
              <motion.p
                layout
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{
                  opacity: {
                    duration: 0.3,
                    ease: [0.4, 0.0, 0.2, 1],
                  },
                  height: {
                    duration: 0.5,
                    ease: [0.4, 0.0, 0.2, 1],
                  },
                  layout: {
                    type: 'spring',
                    stiffness: 300,
                    damping: 30,
                  },
                }}
                className="mt-1 text-sm text-red-600 overflow-hidden"
              >
                {errors.name.message}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Descripción */}
        <div>
          <label className="block">
            <span className="text-sm font-medium">Descripción</span>
            <textarea
              {...register('description')}
              rows={2}
              className={`mt-1 block w-full rounded border px-3 py-2 ${
                errors.description ? 'border-red-500' : ''
              }`}
              placeholder="Una breve descripción de la etapa"
            />
          </label>
          <AnimatePresence initial={false} mode="wait">
            {errors.description && (
              <motion.p
                layout
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{
                  opacity: {
                    duration: 0.3,
                    ease: [0.4, 0.0, 0.2, 1],
                  },
                  height: {
                    duration: 0.5,
                    ease: [0.4, 0.0, 0.2, 1],
                  },
                  layout: {
                    type: 'spring',
                    stiffness: 300,
                    damping: 30,
                  },
                }}
                className="mt-1 text-sm text-red-600 overflow-hidden"
              >
                {errors.description.message}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Color */}
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
          <Button variant="outline" onClick={onCancel} disabled={isLoading}>
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
