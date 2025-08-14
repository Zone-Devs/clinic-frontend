'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Stepper from 'react-stepper-horizontal'
import { Button } from '@/components/ui/button'
import {
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Counter } from '@/app/components/Counter'
import { ArrowRight, Upload, X, QrCode, CheckCircle2 } from 'lucide-react'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { ImageUploadBox } from '@/app/components/ImageUploadBox'
import { ImageViewer } from '@/app/components/ImageViewer'
import axiosClient from '@/utils/axiosClient'
import { toast } from 'react-toastify'
import clsx from 'clsx'

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
  const [uploadedById, setUploadedById] = useState<Record<string, boolean>>({})
  const extensionsAccepted = "image/png,image/jpeg,image/webp"
  const [pendingFileById, setPendingFileById] = useState<Record<string, File | null>>({})
  const [pendingGlobalFile, setPendingGlobalFile] = useState<File | null>(null)
  const globalSelected = !!pendingGlobalFile
  const [isFinishing, setIsFinishing] = useState(false)
  // Confirmation for radiobutton
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pendingMode, setPendingMode] = useState<'individual' | 'single' | null>(null)

  const isAnyUploadingIndividual = React.useMemo(
    () => Object.values(uploadingById).some(Boolean),
    [uploadingById]
  )

  // dentro del componente
  const [viewerOpen, setViewerOpen] = useState(false)
  const [viewerIndex, setViewerIndex] = useState(0)
  // Uploader
  const [isUploadingAll, setIsUploadingAll] = useState(false)
  const [thumbById, setThumbById] = useState<Record<string, string | null>>({})
  // 1) Ref para tener siempre la versión actual de thumbById
  const thumbByIdRef = useRef<Record<string, string | null>>({})

  const confirmCancel = () => {
    setConfirmOpen(false)
    setPendingMode(null)
  }

  const confirmProceed = () => {
    if (!pendingMode) return
    clearPending() // ← tu helper para limpiar pendientes y revocar blobs
    setIndividualUpload(pendingMode === 'individual')
    setConfirmOpen(false)
    setPendingMode(null)
  }

  const hasPendingChanges = React.useMemo(
    () => !!pendingGlobalFile || Object.values(pendingFileById).some(Boolean),
    [pendingGlobalFile, pendingFileById]
  )

  const clearPending = React.useCallback(() => {
    setPendingGlobalFile(null)
    setPendingFileById({})
    // limpia thumbs (y revoca blobs)
    setThumbById(prev => {
      Object.values(prev).forEach((u) => {
        if (typeof u === 'string' && u.startsWith('blob:')) URL.revokeObjectURL(u)
      })
      return {}
    })
  }, [])

  const handleModeChange = (v: string) => {
    const nextIndividual = v === 'individual'
    if (nextIndividual === individualUpload) return

    if (hasPendingChanges) {
      setPendingMode(nextIndividual ? 'individual' : 'single')
      setConfirmOpen(true)
      return
    }
    setIndividualUpload(nextIndividual)
  }

  useEffect(() => {
    thumbByIdRef.current = thumbById
  }, [thumbById])

  useEffect(() => {
    return () => {
      Object.values(thumbByIdRef.current).forEach((url) => {
        if (typeof url === 'string' && url.startsWith('blob:')) {
          URL.revokeObjectURL(url)
        }
      })
    }
  }, [])

  const qrItems = React.useMemo(() => {
    return createdList.flatMap(eq =>
      (eq.qrs ?? []).map(q => ({
        src: `/api/proxy/files?src=${encodeURIComponent(q.qrImageURL)}`,
        title: `${eq.name} • Serial: ${eq.serial}`,
        __raw: q.qrImageURL,
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
    if (uploadingById[id]) return
    setTargetId(id)
    fileInputRef.current?.click()
  }

  const matchesAccept = (file: File, acceptStr: string) => {
    const tokens = acceptStr.split(',').map(t => t.trim().toLowerCase()).filter(Boolean)
    if (tokens.length === 0) return true
    const name = file.name.toLowerCase()
    const type = (file.type || '').toLowerCase()

    return tokens.some(tok => {
      if (tok.startsWith('.')) {
        return name.endsWith(tok)
      }
      if (tok.endsWith('/*')) {
        const prefix = tok.slice(0, -1)
        return type.startsWith(prefix)
      }
      return type === tok
    })
  }

  const handlePick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.currentTarget.value = ''
    if (!file || !targetId) return
    if (!matchesAccept(file, extensionsAccepted)) {
      toast.error('Formato no permitido.')
      return
    }
    // guarda preview local
    const url = URL.createObjectURL(file)
    setThumbById(prev => {
      const old = prev[targetId]
      if (old && old.startsWith('blob:')) URL.revokeObjectURL(old)
      return { ...prev, [targetId]: url }
    })
    // guarda archivo en memoria, marcado como pendiente
    setPendingFileById(prev => ({ ...prev, [targetId]: file }))
    setUploadedById(prev => ({ ...prev, [targetId]: false })) // aún no subido
    toast.info('Imagen seleccionada. Se subirá al finalizar.')
    // NO subimos nada aquí
    setTargetId(null)
  }

  const uploadGlobalImage = async (file: File) => {
    if (!createdList.length) {
      toast.info('No hay equipos para actualizar.')
      return
    }
    setPendingGlobalFile(file)
    toast.info(
      'Imagen seleccionada para todos.\nSe subirá al finalizar.',
      { style: { whiteSpace: 'pre-line' } }
    )
  }

  const finalizeUploads = async () => {
    try {
      setIsFinishing(true)

      if (individualUpload) {
        // Subidas individuales: solo para los equipos con archivo pendiente
        const entries = Object.entries(pendingFileById).filter(([, f]) => !!f) as [string, File][]

        if (entries.length === 0) {
          // nada que subir: simplemente cerrar
          onCancel()
          return
        }

        // marca como "subiendo" por equipo
        entries.forEach(([id]) => {
          setUploadingById(s => ({ ...s, [id]: true }))
        })

        const results = await Promise.allSettled(entries.map(async ([id, file]) => {
          const fd = new FormData()
          fd.append('file', file)
          await axiosClient.post(`/api/equipments/${id}/equipment/images`, fd, {
            headers: { 'Content-Type': 'multipart/form-data' }
          })
          return id
        }))

        // limpiar estados
        entries.forEach(([id]) => {
          setUploadingById(s => ({ ...s, [id]: false }))
        })

        let ok = 0, fail = 0
        results.forEach((r, idx) => {
          const id = entries[idx][0]
          if (r.status === 'fulfilled') {
            ok++
            setUploadedById(s => ({ ...s, [id]: true }))
          } else {
            fail++
            setUploadedById(s => ({ ...s, [id]: false }))
          }
        })

        // liberamos archivos en memoria y thumbs (los blobs ya se limpian en unmount; aquí limpiamos referencias)
        setPendingFileById({})
        // opcional: mantener thumbs como confirmación visual; si quieres limpiar:
        // setThumbById({})

        if (ok) toast.success(`Imagen subida a ${ok} equipo${ok > 1 ? 's' : ''}.`)
        if (fail) toast.error(`${fail} subida${fail > 1 ? 's' : ''} fallida${fail > 1 ? 's' : ''}.`)

        onCancel()
        return
      }

      // Modo global
      if (!pendingGlobalFile) {
        onCancel()
        return
      }

      setIsUploadingAll(true)

      const requests = createdList.map(eq => {
        const fd = new FormData()
        fd.append('file', pendingGlobalFile)
        return axiosClient.post(`/api/equipments/${eq.id}/equipment/images`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
      })

      const results = await Promise.allSettled(requests)
      const ok = results.filter(r => r.status === 'fulfilled').length
      const fail = results.length - ok

      if (ok)  toast.success(`Imagen subida a ${ok} equipo${ok > 1 ? 's' : ''}.`)
      if (fail) toast.error(`${fail} subida${fail > 1 ? 's' : ''} fallida${fail > 1 ? 's' : ''}.`)

      // marca como subidos los ok
      results.forEach((r, i) => {
        const id = createdList[i].id
        if (r.status === 'fulfilled') {
          setUploadedById(s => ({ ...s, [id]: true }))
        }
      })

      setPendingGlobalFile(null)
      setIsUploadingAll(false)
      onCancel()
    } catch {
      setIsUploadingAll(false)
      toast.error('Error al subir la imagen.')
    } finally {
      setIsFinishing(false)
    }
  }


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
              {createdList.length > 1 && 
              <RadioGroup
                value={individualUpload ? 'individual' : 'single'}
                onValueChange={handleModeChange}
                className="grid grid-cols-1 sm:grid-cols-2 gap-3"
              >
                <div className="flex items-center gap-2 border rounded px-3 py-2">
                  <RadioGroupItem id="mode-single" value="single" className="text-[#10B981] data-[state=checked]:border-[#10B981] cursor-pointer" />
                  <Label htmlFor="mode-single" className="text-sm cursor-pointer w-full h-full">Subir imagen global</Label>
                </div>
                <div className="flex items-center gap-2 border rounded px-3 py-2">
                  <RadioGroupItem id="mode-individual" value="individual" className="text-[#10B981] data-[state=checked]:border-[#10B981] cursor-pointer" />
                  <Label htmlFor="mode-individual" className="text-sm cursor-pointer w-full h-full">Subir imagen por equipo</Label>
                </div>
              </RadioGroup>
              }

              {!individualUpload && (
                <div className="flex items-center gap-2 cursor-pointer">
                  {/* donde usas <ImageUploadBox /> */}
                  <ImageUploadBox
                    onFile={(file) => uploadGlobalImage(file)}
                    text={globalSelected ? 'Imagen seleccionada (se subirá al finalizar)' : 'Sube una imagen para todos'}
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
              accept={extensionsAccepted}
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
                    const isLoadingItem = !!uploadingById[eq.id]
                    const isUploadedItem = !!uploadedById[eq.id]
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
                            disabled={!qrUrl}
                            title={qrUrl ? 'Ver QR' : 'QR no disponible'}
                            className="w-[112px] justify-center"
                          >
                            <QrCode className="h-4 w-4 mr-1" />
                            Ver QR
                          </Button>
                          {/* Boton de subida de imagen individual */}
                          {individualUpload && (
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant={isUploadedItem ? 'default' : 'outline'}
                                onClick={() => triggerPick(eq.id)}
                                isLoading={isLoadingItem}
                                className={clsx(
                                  'w-[150px] justify-center',
                                  isUploadedItem && 'border-emerald-500/60 bg-emerald-50 text-emerald-700 hover:bg-emerald-50'
                                )}
                                aria-label={`Subir imagen de ${eq.name}`}
                                title={
                                  thumbById[eq.id] && !isUploadedItem
                                    ? 'Imagen pendiente (se subirá al finalizar)'
                                    : isUploadedItem
                                    ? 'Imagen subida'
                                    : 'Subir imagen'
                                }
                              >
                                {isUploadedItem ? (
                                  <>
                                    {(() => {
                                      const t = thumbById[eq.id] || (eq as any).imageURL || null
                                      const thumb = t
                                        ? (t.startsWith('blob:') ? t : `/api/proxy/files?src=${encodeURIComponent(t)}`)
                                        : null
                                      return thumb ? (
                                        <span className="mr-2 inline-flex h-4 w-4 overflow-hidden rounded-[3px] border">
                                          <img src={thumb} alt="" className="h-full w-full object-cover" />
                                        </span>
                                      ) : (
                                        <CheckCircle2 className="h-4 w-4 mr-2 text-emerald-600" />
                                      )
                                    })()}
                                    <span className="truncate">Completado</span>
                                  </>
                                ) : (
                                  <>
                                    <Upload className="h-4 w-4 mr-2" />
                                    {thumbById[eq.id] ? 'Cambiar imagen' : 'Subir imagen'}
                                  </>
                                )}
                              </Button>

                              {/* Mini-preview de archivo EN MEMORIA (pendiente de subir) */}
                              {thumbById[eq.id] && !isUploadedItem && (
                                <span className="inline-flex h-10 w-10 rounded border overflow-hidden">
                                  <img
                                    src={thumbById[eq.id] as string}
                                    alt=""
                                    className="h-full w-full object-cover"
                                    aria-hidden="true"
                                  />
                                </span>
                              )}
                            </div>
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

      <AnimatePresence>
        {confirmOpen && (
          <motion.div
            key="mode-confirm"
            className="fixed inset-0 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/30" onClick={confirmCancel} />
            <div className="absolute inset-0 grid place-items-center p-4">
              <motion.div
                role="dialog"
                aria-modal="true"
                aria-labelledby="mode-confirm-title"
                className="w-full max-w-sm rounded-lg bg-white p-4 shadow-xl"
                initial={{ scale: 0.95, opacity: 0, y: 8 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.98, opacity: 0, y: 8 }}
                transition={{ type: 'spring', stiffness: 260, damping: 22 }}
              >
                <h3 id="mode-confirm-title" className="text-base font-semibold">
                  ¿Cambiar modo de subida?
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Tienes imágenes sin guardar. Si cambias de opción se perderán.
                </p>

                <div className="mt-4 flex justify-end gap-2">
                  <Button variant="outline" onClick={confirmCancel}>
                    Cancelar
                  </Button>
                  <Button onClick={confirmProceed}>
                    Continuar
                  </Button>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
          <Button
            onClick={finalizeUploads}
            disabled={isFinishing || isUploadingAll || isAnyUploadingIndividual}
            isLoading={isFinishing || isUploadingAll || isAnyUploadingIndividual}
          >
            <Upload className="mr-2" />
            Finalizar
          </Button>
        )}
      </DialogFooter>
    </>
  )
})
