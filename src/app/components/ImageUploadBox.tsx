'use client'

import * as React from 'react'
import { UploadCloud } from 'lucide-react'
import clsx from 'clsx'

type Props = {
  onFile: (file: File) => void
  accept?: string
  disabled?: boolean
  className?: string
  text?: string
  subtext?: string
}

export function ImageUploadBox({
  onFile,
  accept = 'image/*',
  disabled,
  className,
  text = 'Arrastra y suelta una imagen aquí',
  subtext = 'o haz clic para seleccionar',
}: Props) {
  const inputRef = React.useRef<HTMLInputElement | null>(null)
  const [dragging, setDragging] = React.useState(false)
  const [preview, setPreview] = React.useState<string | null>(null)
  const [fileName, setFileName] = React.useState<string>('')

  React.useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview)
    }
  }, [preview])

  const pick = () => !disabled && inputRef.current?.click()

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setFileName(file.name)
    const url = URL.createObjectURL(file)
    setPreview((old) => {
      if (old) URL.revokeObjectURL(old)
      return url
    })
    onFile(file)
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragging(false)
    if (disabled) return
    const file = e.dataTransfer.files?.[0]
    if (!file) return
    setFileName(file.name)
    const url = URL.createObjectURL(file)
    setPreview((old) => {
      if (old) URL.revokeObjectURL(old)
      return url
    })
    onFile(file)
  }

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    if (!disabled) setDragging(true)
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
        )}
      >
        <div className="flex items-center gap-3">
          <UploadCloud className="h-5 w-5" />
          <div className="flex flex-col">
            <span className="text-sm">{text}</span>
            <span className="text-xs text-muted-foreground">{subtext}</span>
            {fileName && (
              <span className="text-xs mt-1 truncate max-w-[18rem]">{fileName}</span>
            )}
          </div>
        </div>

        {preview && (
          <img
            src={preview}
            alt="preview"
            className="h-12 w-12 rounded object-cover border"
          />
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        disabled={disabled}
        onChange={onChange}
      />
    </div>
  )
}
