'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import Stepper from 'react-stepper-horizontal'
import { Button } from '@/components/ui/button'
import {
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { Counter } from '@/app/components/Counter'
import { Save, Upload, X } from 'lucide-react'
import clsx from 'clsx'

interface Props {
  onConfirm: (data: {
    name: string
    description: string
    model: string
    quantity: number
  }) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
  createdItems?: { id: string; name: string }[]
}

export const CreateEquipmentForm = React.memo(function CreateEquipmentForm({
  onConfirm,
  onCancel,
  isLoading = false,
  createdItems = [],
}: Props) {
  const [step, setStep] = useState<1 | 2>(1)

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [model, setModel] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [individualUpload, setIndividualUpload] = useState(false)

  const handleSubmit = async () => {
    try {
      const created = await onConfirm({
        name: name.trim(),
        description: description.trim(),
        model: model.trim(),
        quantity,
      })

      if (created) {
        setStep(2) // Avanza solo si realmente se creó
      }
    } catch (err) {
      console.error('Error al crear equipo:', err)
    }
  }


  return (
    <>
      <DialogHeader className="mb-4">
        <Stepper
          steps={[{ title: 'Equipo' }, { title: 'Imagen' }]}
          activeStep={step - 1}
          activeColor="#0f3e44"
          completeColor="#10b981"
          defaultBarColor="#d1d5db"
          size={28}
          circleFontSize={14}
        />

        <DialogTitle className="mt-4">
          {step === 1 ? 'Crear nuevo equipo' : 'Subir imagen del equipo'}
        </DialogTitle>
        <DialogDescription>
          {step === 1
            ? 'Introduce un nombre y una descripción para tu equipo.'
            : 'Puedes subir una imagen general o individual para cada equipo creado.'}
        </DialogDescription>
      </DialogHeader>

      <motion.div
        key={step}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.2 }}
        className="py-2"
      >
        {step === 1 ? (
          <div className="grid gap-4">
            <label>
              <span className="text-sm font-medium">Nombre</span>
              <input
                type="text"
                required
                className="mt-1 block w-full rounded border px-3 py-2"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej. Bisturí"
              />
            </label>

            <label>
              <span className="text-sm font-medium">Modelo / Nº de serie</span>
              <input
                type="text"
                required
                className="mt-1 block w-full rounded border px-3 py-2"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="Escribe el modelo de tu equipo"
              />
            </label>

            <label>
              <span className="text-sm font-medium">Descripción</span>
              <textarea
                required
                className="mt-1 block w-full rounded border px-3 py-2"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Una breve descripción de tu equipo"
              />
            </label>

            <div className="flex justify-start">
              <Counter value={quantity} onChange={setQuantity} min={1} max={10} />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={individualUpload}
                onCheckedChange={(v) => setIndividualUpload(Boolean(v))}
              />
              <span>Subir imagen individual</span>
            </div>

            <div className="grid gap-3 max-h-[250px] overflow-y-auto pr-1">
              {createdItems.map((item, idx) => (
                <div
                  key={item.id ?? idx}
                  className="border rounded px-4 py-3 flex justify-between items-center"
                >
                  <span>{item.name}</span>
                  {individualUpload && (
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          // subirImagen(item.id, file)
                        }
                      }}
                    />
                  )}
                </div>
              ))}

              {!individualUpload && (
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        // subirImagenGlobal(file)
                      }
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </motion.div>

      <DialogFooter className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          <X className="mr-2" />
          Cancelar
        </Button>
        {step === 1 ? (
          <Button
            onClick={handleSubmit}
            disabled={!name.trim() || !description.trim()}
            isLoading={isLoading}
          >
            <Save className="mr-2" />
            Siguiente
          </Button>
        ) : (
          <Button onClick={onCancel}>
  <Upload className="mr-2" />
  Finalizar
</Button>

        )}
      </DialogFooter>
    </>
  )
})
