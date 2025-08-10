import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog'
import { X, ChevronLeft, ChevronRight, Download, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'
import React from 'react'
import { DialogTitle } from '@radix-ui/react-dialog'

type QrItem = { src: string; title: string }

export function ImageViewer({
  items,
  index,
  open,
  onOpenChange,
  onIndexChange,
}: {
  items: QrItem[]
  index: number
  open: boolean
  onOpenChange: (v: boolean) => void
  onIndexChange: (i: number) => void
}) {
  const [scale, setScale] = React.useState(1)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    setScale(1)
    setLoading(true)
    setError(null)
  }, [index, open, items[index]?.src])

  const prev = () => onIndexChange((index - 1 + items.length) % items.length)
  const next = () => onIndexChange((index + 1) % items.length)

  const current = items[index]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <DialogTitle className='sr-only'>Visualizar Imagen</DialogTitle>
      </DialogHeader>
      <DialogContent
        className="sm:max-w-3xl w-full p-0 overflow-hidden"
        onPointerDownOutside={(e)=>e.preventDefault()}
        onEscapeKeyDown={(e)=>e.preventDefault()}
      >
        {/* Toolbar */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div className="text-sm font-medium truncate">{current?.title ?? 'QR'}</div>
          <div className="flex items-center gap-2">
            {items.length > 1 && (
              <>
                <button className="p-2 rounded hover:bg-muted cursor-pointer" onClick={prev} aria-label="Anterior">
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button className="p-2 rounded hover:bg-muted cursor-pointer" onClick={next} aria-label="Siguiente">
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}
            <a className="p-2 rounded hover:bg-muted" href={current?.src} download aria-label="Descargar">
              <Download className="h-5 w-5" />
            </a>
            <button className="p-2 rounded hover:bg-muted" onClick={()=>onOpenChange(false)} aria-label="Cerrar">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="relative h-[70vh] bg-background flex items-center justify-center">
          {/* Spinner centrado */}
          {loading && !error && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          )}

          {/* Error simple */}
          {error ? (
            <p className="text-sm text-muted-foreground">No se pudo cargar la imagen.</p>
          ) : current ? (
            <motion.img
              key={current.src}
              src={current.src}
              alt="QR"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: loading ? 0 : 1, scale: 1 }}
              transition={{ duration: 0.15 }}
              className={`max-h-full max-w-full object-contain ${loading ? 'opacity-0' : ''}`}
              style={{ transform: `scale(${scale})` }}
              onLoad={() => setLoading(false)}
              onError={() => { setLoading(false); setError('error') }}
            />
          ) : null}
        </div>

      </DialogContent>
    </Dialog>
  )
}
