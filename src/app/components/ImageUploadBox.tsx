'use client'

import * as React from 'react'
import { UploadCloud, Loader2, CheckCircle2 } from 'lucide-react'
import clsx from 'clsx'

type Props = {
  onFile: (file: File) => void | Promise<void>
  accept?: string
  disabled?: boolean
  className?: string
  text?: string
  subtext?: string
}

export function ImageUploadBox({
  onFile,
  accept = 'image/png,image/jpeg,image/webp',
  disabled,
  className,
  text = 'Arrastra y suelta una imagen aquí',
  subtext = 'o haz clic para seleccionar',
}: Props) {
  const inputRef = React.useRef<HTMLInputElement | null>(null)
  const [dragging, setDragging] = React.useState(false)
  const [preview, setPreview] = React.useState<string | null>(null)
  const [fileName, setFileName] = React.useState<string>('')
  const [status, setStatus] = React.useState<'idle' | 'loading' | 'done'>('idle')
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview)
    }
  }, [preview])

  const friendlyAccept = React.useMemo(
    () => accept.split(',').map((t) => t.trim()).filter(Boolean).join(', '),
    [accept]
  )

  // ✅ Valida contra `accept` (mime exacto, comodín tipo `image/*` y extensiones `.png`)
  const matchesAccept = (file: File, acceptStr: string) => {
    const tokens = acceptStr.split(',').map(t => t.trim().toLowerCase()).filter(Boolean)
    if (tokens.length === 0) return true
    const name = file.name.toLowerCase()
    const type = (file.type || '').toLowerCase()

    return tokens.some(tok => {
      if (tok.startsWith('.')) {
        return name.endsWith(tok) // extensión
      }
      if (tok.endsWith('/*')) {
        const prefix = tok.slice(0, -1) // 'image/*' -> 'image/'
        return type.startsWith(prefix)
      }
      return type === tok // MIME exacto
    })
  }

  const pick = () => {
    if (disabled || status === 'loading') return
    inputRef.current?.click()
  }

  const handleFile = async (file: File) => {
    setFileName(file.name)
    const url = URL.createObjectURL(file)
    setPreview((old) => {
      if (old) URL.revokeObjectURL(old)
      return url
    })
    try {
      setStatus('loading')
      await Promise.resolve(onFile(file))
      setStatus('done')
      setError(null)
    } catch {
      setStatus('idle')
    }
  }

  const onChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.currentTarget.value = ''
    if (!file) return
    if (!matchesAccept(file, accept)) {
      setError(`Formato no permitido. Permitidos: ${friendlyAccept}`)
      setPreview(null)
      setFileName('')
      return
    }
    setError(null)
    await handleFile(file)
  }

  const onDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragging(false)
    if (disabled || status === 'loading') return
    const file = e.dataTransfer.files?.[0]
    if (!file) return
    if (!matchesAccept(file, accept)) {
      setError(`Formato no permitido. Permitidos: ${friendlyAccept}`)
      setPreview(null)
      setFileName('')
      return
    }
    setError(null)
    await handleFile(file)
  }

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    if (!disabled && status !== 'loading') setDragging(true)
  }
  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
  }

  return (
    <div className={clsx('w-full', className)}>
      <div
        role="button"
        tabIndex={0}
        aria-busy={status === 'loading'}
        onClick={pick}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && pick()}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        className={clsx(
          'flex items-center justify-between gap-4 rounded-lg border-2 border-dashed p-4 sm:p-5',
          'transition-colors',
          dragging ? 'border-primary/70 bg-primary/5' : 'border-muted-foreground/30 hover:border-primary/60',
          disabled && 'opacity-60 cursor-not-allowed',
          status === 'loading' && 'cursor-progress'
        )}
      >
        <div className="flex items-center gap-3">
          <UploadCloud className="h-5 w-5" />
          <div className="flex flex-col">
            <span className="text-sm">{text}</span>
            <span className={clsx('text-xs', error ? 'text-red-500' : 'text-muted-foreground')}>
              {error
                ? error
                : status === 'loading'
                ? 'Subiendo imagen…'
                : status === 'done'
                ? 'Carga completa'
                : subtext}
            </span>
            {fileName && !error && (
              <span className="text-xs mt-1 truncate max-w-[18rem]">{fileName}</span>
            )}
          </div>
        </div>

        {preview && !error && (
          <div className="relative h-12 w-12 shrink-0">
            <img
              src={preview}
              alt="preview"
              className="h-12 w-12 rounded object-cover border"
            />
            {status === 'loading' && (
              <div className="absolute inset-0 rounded bg-black/40 grid place-items-center">
                <Loader2 className="h-5 w-5 animate-spin text-white" />
              </div>
            )}
            {status === 'done' && (
              <div className="absolute -right-1 -top-1 bg-white rounded-full shadow p-0.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              </div>
            )}
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={accept} // respeta lo que pases; se valida también en JS
        className="hidden"
        disabled={disabled || status === 'loading'}
        onChange={onChange}
      />
    </div>
  )
}
