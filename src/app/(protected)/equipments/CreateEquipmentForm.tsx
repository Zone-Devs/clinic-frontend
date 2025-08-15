'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import Stepper from 'react-stepper-horizontal'
import { Button } from '@/components/ui/button'
import {
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog'
import { Counter } from '@/app/components/Counter'
import { ArrowRight, Upload, X, QrCode, Maximize2, Trash2, Repeat, CornerDownLeft, LogOut, Check } from 'lucide-react'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { ImageUploadBox } from '@/app/components/ImageUploadBox'
import { ImageViewer } from '@/app/components/ImageViewer'
import type { QrItem } from '@/app/components/ImageViewer'
import axiosClient from '@/utils/axiosClient'
import { toast } from 'react-toastify'
import * as z from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { FormField } from '@/app/components/forms/FormField'
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

const stageSchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres').max(255, 'Máximo 255 caracteres'),
  model: z.string().min(3, 'El modelo debe tener al menos 3 caracteres').max(255, 'Máximo 255 caracteres'),
  description: z.string().min(3, 'La descripción debe tener al menos 3 caracteres').max(255, 'Máximo 255 caracteres'),
})

type FormValues = z.infer<typeof stageSchema>

interface Props {
  initial: FormValues
  onConfirm: (payload: { name: string; description: string; model: string; quantity: number }) => Promise<Equipment[]>
  onCancel: () => void
  isLoading?: boolean
}

const baseInput = 'mt-1 block w-full rounded border px-3 py-2'

export const CreateEquipmentForm = React.memo(function CreateEquipmentForm({
  initial,
  onConfirm,
  onCancel,
  isLoading = false,
}: Props) {
  /* BEGIN: consts and states */
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(stageSchema),
    mode: 'onChange',
    defaultValues: initial, // <- viene por props
  })
  const [step, setStep] = useState<1 | 2>(1)
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
  const [viewerItems, setViewerItems] = useState<QrItem[]>([])
  const proxy = (u: string) => `/api/proxy/files?src=${encodeURIComponent(u)}`
  const [missingDlgOpen, setMissingDlgOpen] = useState(false)
  const [missingDlgText, setMissingDlgText] = useState<{ title: string; description: string }>({
    title: '',
    description: '',
  })
  const [unsavedDlgOpen, setUnsavedDlgOpen] = useState(false)
  const [unsavedDlgText, setUnsavedDlgText] = useState<{ title: string; description: string }>({
    title: '',
    description: '',
  })
  const missingDlgResolveRef = useRef<(value: boolean) => void | null>(null)
  const unsavedDlgResolveRef = useRef<((value: boolean) => void) | null>(null)
  const proceedRef = useRef(false)
  /* END: consts and states */

  /* Handlers */
  const confirmCancel = () => {
    setConfirmOpen(false)
    setPendingMode(null)
  }

  const confirmProceed = () => {
    if (!pendingMode) return
    clearPending()
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

    const qrItems = React.useMemo<QrItem[]>(() => {
    return createdList.flatMap(eq =>
      (eq.qrs ?? []).map(q => ({
        src: proxy(q.qrImageURL),
        title: `${eq.name} • Serial: ${eq.serial}`,
      }))
    )
  }, [createdList])

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
      if (!individualUpload) {
        // Global: no hay imagen seleccionada
        if (!pendingGlobalFile) {
          const ok = await confirmMissingImagesDialog()
          if (!ok) return
        }
      } else {
        // Individual: faltan imágenes por seleccionar
        const total = createdList.length
        const selected = Object.values(pendingFileById).filter(Boolean).length
        if (selected < total) {
          const ok = await confirmMissingImagesDialog()
          if (!ok) return
        }
      }
      try {
      setIsFinishing(true)

      if (individualUpload) {
        // Subidas individuales: solo para los equipos con archivo pendiente
        const entries = Object.entries(pendingFileById).filter(([, f]) => !!f) as [string, File][]

        if (entries.length === 0) {
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

  const onSubmitStep1 = handleSubmit(async (values) => {
    try {
      const created = await onConfirm({
        name: values.name.trim(),
        description: values.description.trim(),
        model: values.model.trim(),
        quantity,
      })
      if (Array.isArray(created) && created.length > 0) {
        setCreatedList(created)
        setStep(2)
      }
    } catch (err) {
      console.error('Error al crear equipo:', err)
    }
  })

  const getPrimaryQrUrl = (e: Equipment) => e.qrs?.[0]?.qrImageURL

  // Abre el viewer con la miniatura pendiente (blob) del equipo
  const openViewerForThumb = (id: string) => {
    const t = thumbById[id]
    if (!t) return
    const src = t.startsWith('blob:') ? t : proxy(t)
    setViewerItems([{ src, title: 'Imagen pendiente' }])
    setViewerIndex(0)
    setViewerOpen(true)
  }

  // ver QR del equipo
  const openViewerForQr = (eq: Equipment) => {
    const first = eq.qrs?.[0]?.qrImageURL
    const items = qrItems
    if (!items.length || !first) return
    const firstSrc = proxy(first)
    const idx = Math.max(0, items.findIndex(i => i.src === firstSrc))
    setViewerItems(items)
    setViewerIndex(idx)
    setViewerOpen(true)
  }

  // Elimina la imagen pendiente en memoria para un equipo
  const removePendingFor = (id: string) => {
    setPendingFileById(prev => {
      const next = { ...prev }
      delete next[id]
      return next
    })
    setThumbById(prev => {
      const url = prev[id]
      if (url?.startsWith('blob:')) URL.revokeObjectURL(url)
      const next = { ...prev }
      delete next[id]
      return next
    })
    setUploadedById(s => ({ ...s, [id]: false }))
  }

  // Toast de confirmación para imágenes faltantes en paso 2
  const confirmMissingImagesDialog = () =>
    new Promise<boolean>((resolve) => {
      const total = createdList.length
      const selected = Object.values(pendingFileById).filter(Boolean).length
      const missing = Math.max(0, total - selected)
      const isGlobal = !individualUpload

      setMissingDlgText({
        title: isGlobal
          ? 'No seleccionaste una imagen global'
          : `Faltan ${missing} de ${total} imágenes por seleccionar`,
        description: isGlobal
          ? 'Si continúas sin imagen global, no se subirá ninguna imagen. ¿Deseas Salir?'
          : 'Si continúas, solo se subirán las imágenes seleccionadas. ¿Deseas continuar?',
      })

      missingDlgResolveRef.current = resolve
      setMissingDlgOpen(true)
    })

  const confirmUnsavedImagesDialog = () =>
    new Promise<boolean>((resolve) => {
      const isGlobal = !individualUpload
      const total = createdList.length
      const selected = isGlobal
        ? (pendingGlobalFile ? 1 : 0)
        : Object.values(pendingFileById).filter(Boolean).length

      setUnsavedDlgText({
        title: 'Hay cambios sin guardar',
        description: isGlobal
          ? 'Seleccionaste una imagen global que aún no se subió. Si sales ahora, se perderá.'
          : `Seleccionaste ${selected} imagen${selected === 1 ? '' : 'es'} de ${total}. Si sales ahora, se perderán.`,
      })
      unsavedDlgResolveRef.current = resolve
      setUnsavedDlgOpen(true)
    })

  const handleCancelClick = async () => {
    if (step !== 2) { onCancel(); return }

    const isGlobal = !individualUpload
    const hasUnsaved = isGlobal
      ? !!pendingGlobalFile
      : Object.values(pendingFileById).some(Boolean)

    // 1) Si hay imágenes seleccionadas en memoria, preguntar por pérdida de cambios
    if (hasUnsaved) {
      const ok = await confirmUnsavedImagesDialog()
      if (!ok) return
      onCancel()
      return
    }

    // 2) Si NO hay imágenes (global) o faltan (individual), usa tu diálogo existente de "faltan imágenes"
    const total = createdList.length
    const selected = Object.values(pendingFileById).filter(Boolean).length
    const needsMissingConfirm = isGlobal ? !pendingGlobalFile : selected < total

    if (needsMissingConfirm) {
      const ok = await confirmMissingImagesDialog() // <-- el que ya creaste
      if (!ok) return
    }

    onCancel()
  }

  useEffect(() => { reset(initial) }, [initial, reset])

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
          <div className="space-y-4">
            <FormField label="Nombre" error={errors.name?.message}>
              <input
                {...register('name')}
                type="text"
                className={`${baseInput} ${errors.name ? 'border-red-500' : ''}`}
                placeholder="Ej. Bisturí"
                aria-invalid={!!errors.name}
              />
            </FormField>

            <FormField label="Modelo / Nº de serie" error={errors.model?.message}>
              <input
                {...register('model')}
                type="text"
                className={`${baseInput} ${errors.model ? 'border-red-500' : ''}`}
                placeholder="Escribe el modelo de tu equipo"
                aria-invalid={!!errors.model}
              />
            </FormField>

            <FormField label="Descripción" error={errors.description?.message}>
              <textarea
                {...register('description')}
                rows={3}
                className={`${baseInput} ${errors.description ? 'border-red-500' : ''}`}
                placeholder="Una breve descripción de tu equipo"
                aria-invalid={!!errors.description}
              />
            </FormField>

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
                            onClick={() => openViewerForQr(eq)}
                            disabled={!getPrimaryQrUrl(eq)}
                            title={getPrimaryQrUrl(eq) ? 'Ver QR' : 'QR no disponible'}
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
                                variant={thumbById[eq.id] ? 'outline' : 'default'}
                                onClick={() => triggerPick(eq.id)}
                                isLoading={isLoadingItem}
                                disabled={isLoadingItem}
                                title={!thumbById[eq.id] ? 'Subir nueva imagen' : 'Reemplazar imagen'}
                                className={clsx(
                                  'justify-center',
                                  !thumbById[eq.id] && 'w-[140px]'
                                )}
                                aria-label={`Subir imagen de ${eq.name}`}
                              >
                                {!isLoadingItem && (thumbById[eq.id] ? <Repeat className="h-4 w-4" /> : <Upload className="h-4 w-4 mr-2" />)}
                                {!thumbById[eq.id] && 'Subir imagen'}
                              </Button>
                              {/* Miniatura pendiente con acciones (ver grande / eliminar a la derecha) */}
                              {thumbById[eq.id] && !isUploadedItem && (
                                <div className="inline-flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => openViewerForThumb(eq.id)}
                                    className="group relative h-10 w-10 rounded border overflow-hidden shrink-0 cursor-pointer"
                                    title="Ver imagen pendiente"
                                  >
                                    <img
                                      src={thumbById[eq.id] as string}
                                      alt=""
                                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                                    />
                                    {/* Icono de ampliar al hover */}
                                    <span className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-gray-900/40 transition-opacity">
                                      <Maximize2 className="h-4 w-4 text-white drop-shadow" />
                                    </span>
                                  </button>

                                  {/* Botón eliminar a la derecha */}
                                  <button
                                    type="button"
                                    onClick={() => removePendingFor(eq.id)}
                                    className="h-8 w-8 rounded-md border flex items-center justify-center hover:bg-red-50 cursor-pointer"
                                    title="Remover"
                                  >
                                    <Trash2 className="h-4 w-4 text-red-600" />
                                  </button>
                                </div>
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
        items={viewerItems}
        index={viewerIndex}
        open={viewerOpen}
        onOpenChange={setViewerOpen}
        onIndexChange={setViewerIndex}
      />
      {/* Dialog change radiobutton with changes */}
      <AlertDialog
        open={confirmOpen}
        onOpenChange={(open) => {
          if (!open && confirmOpen) {
            if (proceedRef.current) {
              proceedRef.current = false
            } else {
              confirmCancel()
            }
          }
          setConfirmOpen?.(open)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{"¿Cambiar modo de subida?"}</AlertDialogTitle>
            <AlertDialogDescription>
              Tienes imágenes sin guardar. Si cambias de opción se perderán.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel onClick={confirmCancel}>
              <X />
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                proceedRef.current = true
                confirmProceed()
              }}
            >
              <Check />
              Continuar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {/* Dialog confirmation on cancel */}
      <AlertDialog
        open={missingDlgOpen}
          onOpenChange={(open) => {
            if (!open && missingDlgOpen) {
              missingDlgResolveRef.current?.(false)
              missingDlgResolveRef.current = null
            }
            setMissingDlgOpen(open)
          }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{missingDlgText.title}</AlertDialogTitle>
            <AlertDialogDescription>{missingDlgText.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setMissingDlgOpen(false)
                missingDlgResolveRef.current?.(false)
                missingDlgResolveRef.current = null
              }}
            >
              <CornerDownLeft className='mr-2' />
              Retroceder
            </AlertDialogCancel>

            <AlertDialogAction
              onClick={() => {
                setMissingDlgOpen(false)
                missingDlgResolveRef.current?.(true)
                missingDlgResolveRef.current = null
              }}
            >
              <LogOut/>
              Continuar de todos modos
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {/* Dialod confirmation cancel with loaded images */}
      <AlertDialog
        open={unsavedDlgOpen}
        onOpenChange={(open) => {
          if (!open && unsavedDlgOpen) {
            unsavedDlgResolveRef.current?.(false)
            unsavedDlgResolveRef.current = null
          }
          setUnsavedDlgOpen(open)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{unsavedDlgText.title}</AlertDialogTitle>
            <AlertDialogDescription>{unsavedDlgText.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setUnsavedDlgOpen(false)
                unsavedDlgResolveRef.current?.(false)
                unsavedDlgResolveRef.current = null
              }}
            >
              <CornerDownLeft className='mr-2' />
              Retroceder
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setUnsavedDlgOpen(false)
                unsavedDlgResolveRef.current?.(true)
                unsavedDlgResolveRef.current = null
              }}
            >
              <LogOut/>
              Continuar de todos modos
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <DialogFooter className="flex justify-end gap-2">
        <Button variant="outline" onClick={handleCancelClick}>
          <X className="mr-2" />
          Cancelar
        </Button>
        {step === 1 ? (
          <Button
            onClick={onSubmitStep1}
            disabled={!isValid || isLoading}
            isLoading={isLoading}
          >
            Siguiente
            {!isLoading && <ArrowRight className="ml-2" />}
          </Button>
        ) : (
          <Button
            onClick={finalizeUploads}
            disabled={isFinishing || isUploadingAll || isAnyUploadingIndividual}
            isLoading={isFinishing || isUploadingAll || isAnyUploadingIndividual}
          >
            {!isFinishing && !isUploadingAll && !isAnyUploadingIndividual && <Upload className="mr-2" />}
            Finalizar
          </Button>
        )}
      </DialogFooter>
    </>
  )
})
