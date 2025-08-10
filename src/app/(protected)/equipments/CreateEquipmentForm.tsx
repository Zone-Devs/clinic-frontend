'use client'

import React, { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import Stepper from 'react-stepper-horizontal'
import { Button } from '@/components/ui/button'
import {
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Counter } from '@/app/components/Counter'
import { ArrowRight, Upload, X, QrCode } from 'lucide-react'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { ImageUploadBox } from '@/app/components/ImageUploadBox'
import { ImageViewer } from '@/app/components/ImageViewer'
import axiosClient from '@/utils/axiosClient'
import { toast } from 'react-toastify'

export interface Equipment {
  id: string; serial: number; name: string; description: string; model: string;
  imageURL: null; isInProgress: boolean; stageID: null; qrs: Qr[];
  createdAt: Date; updatedAt: null; createdLocalTime: Date; updatedLocalTime: null;
}
export interface Qr {
  id: string; serial: number; equipmentID: string; qrImageURL: string;
  createdAt: Date; updatedAt: Date; createdLocalTime: Date; updatedLocalTime: Date;
}

interface Props {
  onConfirm: (payload: { name: string; description: string; model: string; quantity: number }) => Promise<Equipment[]>
  onCancel: () => void
  isLoading?: boolean
}

export const CreateEquipmentForm = React.memo(function CreateEquipmentForm({
  onConfirm,
  onCancel,
  isLoading = false,
}: Props) {
  const [step, setStep] = useState<1 | 2>(1)

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [model, setModel] = useState('')
  const [quantity, setQuantity] = useState(1)

  const [individualUpload, setIndividualUpload] = useState(false)
  const [createdList, setCreatedList] = useState<Equipment[]>([])

  // --- Input global reutilizable para uploads individuales ---
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [targetId, setTargetId] = useState<string | null>(null)
  const [uploadingById, setUploadingById] = useState<Record<string, boolean>>({})
  // dentro del componente
  const [viewerOpen, setViewerOpen] = useState(false)
  const [viewerIndex, setViewerIndex] = useState(0)
  // Uploader
  const [isUploadingAll, setIsUploadingAll] = useState(false)

  const qrItems = React.useMemo(() => {
    return createdList.flatMap(eq =>
      (eq.qrs ?? []).map(q => ({
        // usa el proxy para pasar el bearer
        src: `/api/proxy/qr?src=${encodeURIComponent(q.qrImageURL)}`,
        title: `${eq.name} • Serial: ${eq.serial}`,
        __raw: q.qrImageURL, // para encontrar índice
      }))
    )
  }, [createdList])

  const openViewerFor = (eq: Equipment) => {
    const first = eq.qrs?.[0]?.qrImageURL
    if (!first) return
    const idx = qrItems.findIndex(i => i.__raw === first)
    setViewerIndex(idx >= 0 ? idx : 0)
    setViewerOpen(true)
  }

  const triggerPick = (id: string) => {
    setTargetId(id)
    fileInputRef.current?.click()
  }

  const handlePick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.currentTarget.value = '' // permite seleccionar el mismo archivo de nuevo
    if (!file || !targetId) return
    try {
      setUploadingById((s) => ({ ...s, [targetId]: true }))
      // TODO: subirImagenIndividual(targetId, file)
      // const fd = new FormData()
      // fd.append('image', file)
      // await axiosClient.post(`/api/equipments/${targetId}/image`, fd, {
      //   headers: { 'Content-Type': 'multipart/form-data' }
      // })
    } finally {
      setUploadingById((s) => ({ ...s, [targetId!]: false }))
      setTargetId(null)
    }
  }

  const uploadGlobalImage = async (file: File) => {
    console.log('🚬 ===> uploadGlobalImage ===> createdList:', createdList);
    if (!createdList.length) {
      toast.info('No hay equipos para actualizar.')
      return
    }

    setIsUploadingAll(true)
    try {
      // misma imagen para todos los equipos creados
      const requests = createdList.map((eq) => {
        const fd = new FormData()
        fd.append('file', file)
        return axiosClient.post(`/api/equipments/${eq.id}/equipment/images`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
      })

      const results = await Promise.allSettled(requests)
      const ok = results.filter(r => r.status === 'fulfilled').length
      const fail = results.length - ok

      if (ok)  toast.success(`Imagen subida a ${ok} equipo${ok > 1 ? 's' : ''}.`)
      if (fail) toast.error(`${fail} subida${fail > 1 ? 's' : ''} fallida${fail > 1 ? 's' : ''}.`)
    } catch (e) {
      toast.error('Error al subir la imagen.')
    } finally {
      setIsUploadingAll(false)
    }
  }

  // -----------------------------------------------------------

  const handleSubmit = async () => {
    try {
      const created = await onConfirm({
        name: name.trim(),
        description: description.trim(),
        model: model.trim(),
        quantity,
      })
      if (Array.isArray(created) && created.length > 0) {
        setCreatedList(created)
        setStep(2)
      }
    } catch (err) {
      console.error('Error al crear equipo:', err)
    }
  }

  const getPrimaryQrUrl = (e: Equipment) => e.qrs?.[0]?.qrImageURL
  const handleViewQr = (e: Equipment) => {
    const url = getPrimaryQrUrl(e)
    if (!url) return
    const proxy = `/api/proxy/qr?src=${encodeURIComponent(url)}`
    window.open(proxy, '_blank', 'noopener,noreferrer')
  }

  return (
    <>
      <DialogHeader>
        <Stepper
          steps={[{ title: 'Equipo' }, { title: 'Imagen' }]}
          activeStep={step - 1}
          activeColor="#0f3e44"
          completeColor="#10b981"
          defaultBarColor="#d1d5db"
          size={38}
          circleFontSize={18}
        />
        <DialogTitle className="mt-4">
          {step === 1 ? 'Crear nuevo equipo' : 'Subir imagen del equipo'}
        </DialogTitle>
        <DialogDescription>
          {step === 1
            ? 'Introduce un nombre y una descripción para tu equipo.'
            : 'Primero revisa los equipos creados y visualiza sus QR. Luego puedes subir una imagen general o individual.'}
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
          <div className="space-y-5">
            <div className="space-y-3">
              <RadioGroup
                value={individualUpload ? 'individual' : 'single'}
                onValueChange={(v) => setIndividualUpload(v === 'individual')}
                className="grid grid-cols-1 sm:grid-cols-2 gap-3"
              >
                <div className="flex items-center gap-2 border rounded px-3 py-2">
                  <RadioGroupItem id="mode-single" value="single" className="text-[#10B981] data-[state=checked]:border-[#10B981] cursor-pointer" />
                  <Label htmlFor="mode-single" className="text-sm cursor-pointer w-full h-full">Subir una sola imagen</Label>
                </div>
                <div className="flex items-center gap-2 border rounded px-3 py-2">
                  <RadioGroupItem id="mode-individual" value="individual" className="text-[#10B981] data-[state=checked]:border-[#10B981] cursor-pointer" />
                  <Label htmlFor="mode-individual" className="text-sm cursor-pointer w-full h-full">Subir imagen individual</Label>
                </div>
              </RadioGroup>
              {!individualUpload && (
                <div className="flex items-center gap-2 cursor-pointer">
                  <ImageUploadBox
                    onFile={(file) => uploadGlobalImage(file)}
                    text={isUploadingAll ? 'Subiendo imagen…' : 'Sube una imagen para todos'}
                    subtext="PNG, JPG…"
                    className="w-full"
                  />
                </div>
              )}

            </div>

            {/* Input global oculto para subir imagen individual */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePick}
            />

            {/* Lista de equipos creados + acciones */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Equipos creados</h4>
              <div className="grid gap-3 max-h-[260px] overflow-y-auto pr-1">
                {createdList.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No se encontraron equipos creados en esta operación.
                  </p>
                ) : (
                  createdList.map((eq) => {
                    const qrUrl = getPrimaryQrUrl(eq)
                    return (
                      <div
                        key={eq.id}
                        className="border rounded px-4 py-3 flex items-center gap-3"
                      >
                        {/* Info izquierda */}
                        <div className="min-w-0 flex-1">
                          <p className="font-medium truncate">{eq.name}</p>
                          <p className="text-xs text-muted-foreground">Serial: {eq.serial}</p>
                        </div>

                        {/* Acciones derecha */}
                        <div className="flex items-center gap-2 shrink-0">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openViewerFor(eq)}
                            disabled={!getPrimaryQrUrl(eq)}
                            title={getPrimaryQrUrl(eq) ? 'Ver QR' : 'QR no disponible'}
                            className="w-[112px] justify-center"
                          >
                            <QrCode className="h-4 w-4 mr-1" />
                            Ver QR
                          </Button>
                          {individualUpload && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => triggerPick(eq.id)}
                              isLoading={!!uploadingById[eq.id]}
                              className="w-[130px] justify-center"
                              aria-label={`Subir imagen de ${eq.name}`}
                            >
                              <Upload className="h-4 w-4 mr-2" />
                              Subir imagen
                            </Button>
                          )}
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          </div>
        )}
      </motion.div>

      <ImageViewer
        items={qrItems}
        index={viewerIndex}
        open={viewerOpen}
        onOpenChange={setViewerOpen}
        onIndexChange={setViewerIndex}
      />

      <DialogFooter className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          <X className="mr-2" />
          Cancelar
        </Button>
        {step === 1 ? (
          <Button onClick={handleSubmit} disabled={!name.trim() || !description.trim()} isLoading={isLoading}>
            Siguiente
            <ArrowRight className="ml-2" />
          </Button>
        ) : (
          <Button onClick={onCancel} disabled={isUploadingAll}>
            <Upload className="mr-2" />
            Finalizar
          </Button>
        )}
      </DialogFooter>
    </>
  )
})
