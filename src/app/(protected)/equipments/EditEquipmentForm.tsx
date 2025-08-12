'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { InitialEquipmentProps } from './EquipmentTable'
import { Save, X, Upload, ImageIcon, QrCode } from 'lucide-react'

interface Props {
  equipment: InitialEquipmentProps
  onConfirm: (data: { name: string; description: string }) => void
  onCancel: () => void
  isLoading?: boolean
}

export const EditEquipmentForm = React.memo(function EditEquipmentForm({
  equipment,
  onConfirm,
  onCancel,
  isLoading = false,
}: Props) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  // preview local si el usuario elige "Cambiar imagen"
  const [preview, setPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    setName(equipment.name)
    setDescription(equipment.description)
    // limpiamos cualquier blob anterior al cambiar de equipo
    setPreview((old) => {
      if (old?.startsWith('blob:')) URL.revokeObjectURL(old)
      return null
    })
  }, [equipment])

  useEffect(() => {
    return () => {
      // cleanup del blob en unmount
      setPreview((old) => {
        if (old?.startsWith('blob:')) URL.revokeObjectURL(old)
        return old
      })
    }
  }, [])

  const pickImage = () => fileInputRef.current?.click()
  const onPickImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.currentTarget.value = '' // permite reseleccionar el mismo archivo
    if (!file) return
    const url = URL.createObjectURL(file)
    setPreview((old) => {
      if (old?.startsWith('blob:')) URL.revokeObjectURL(old)
      return url
    })
    // Nota: Por ahora solo mostramos la vista previa.
    // La lógica de subida/guardado la agregamos después.
  }

  const imageSrc = preview ?? (equipment as any).imageURL ?? null
  const proxiedImg = imageSrc ? `/api/proxy/qr?src=${encodeURIComponent(imageSrc)}` : null
  const primaryQr = (equipment as any)?.qrs?.[0]?.qrImageURL ?? (equipment as any)?.qrImageURL ?? null
  const proxiedQr = primaryQr ? `/api/proxy/qr?src=${encodeURIComponent(primaryQr)}` : null

  return (
    <>
      <DialogHeader>
        <DialogTitle>Editar equipo</DialogTitle>
        <DialogDescription>
          Modifica el nombre o la descripción del equipo.
        </DialogDescription>
      </DialogHeader>

      {/* Layout: izquierda campos, derecha imagen + QR */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-2">
        {/* Columna izquierda: campos */}
          {/* Columna izquierda: campos */}
  <div className="flex-1 space-y-3">
    <label className="block">
      <span className="text-sm font-medium">Nombre</span>
      <input
        type="text"
        required
        className="mt-1 block w-full rounded border px-3 py-2"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Ej. Sutura"
      />
    </label>

    <label className="block">
      <span className="text-sm font-medium">Descripción</span>
      <textarea
        required
        className="mt-1 block w-full rounded border px-3 py-2"
        rows={3}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Una breve descripción de"
      />
    </label>
  </div>

        {/* Columna derecha: imagen + cambiar + QR */}
        <div className="space-y-4">
          {/* Imagen / Fallback */}
          <div className="border rounded-lg p-3">
            <div className="aspect-square w-full max-w-[260px] mx-auto rounded overflow-hidden border bg-muted/30 grid place-items-center">
              {proxiedImg ? (
                <img
                  src={proxiedImg}
                  alt="Imagen del equipo"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-muted-foreground">
                  <ImageIcon className="h-10 w-10 mb-2" />
                  <span className="text-sm">Sin imagen</span>
                </div>
              )}
            </div>

            <div className="mt-3 flex justify-center">
              <Button variant="outline" onClick={pickImage}>
                <Upload className="h-4 w-4 mr-2" />
                Cambiar imagen
              </Button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onPickImage}
            />
          </div>

          {/* QR */}
          <div className="border rounded-lg p-3">
            <div className="flex items-center mb-2">
              <QrCode className="h-4 w-4 mr-2" />
              <span className="text-sm font-medium">Código QR</span>
            </div>
            <div className="aspect-square w-full max-w-[220px] mx-auto rounded overflow-hidden border bg-white grid place-items-center">
              {proxiedQr ? (
                <img
                  src={proxiedQr}
                  alt="QR del equipo"
                  className="h-full w-full object-contain p-3"
                />
              ) : (
                <span className="text-xs text-muted-foreground">QR no disponible</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <DialogFooter className="flex justify-end gap-2">
        <Button
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          <X />
          Cancelar
        </Button>
        <Button
          onClick={() =>
            onConfirm({
              name: name.trim(),
              description: description.trim(),
            })
          }
          isLoading={isLoading}
          disabled={!name.trim() || !description.trim()}
        >
          {!isLoading && <Save />}
          Guardar
        </Button>
      </DialogFooter>
    </>
  )
})
