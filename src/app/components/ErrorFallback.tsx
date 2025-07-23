// app/components/ErrorFallback.tsx
'use client'

import { useRouter } from 'next/navigation'
import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ErrorFallbackProps {
  title?: string
  description?: string
  retryText?: string
}

export default function ErrorFallback({
  title = 'Algo salió mal',
  description = 'Error Interno en el servidor',
  retryText = 'Reintentar',
}: ErrorFallbackProps) {
  const router = useRouter()

  return (
    <div className="flex flex-col items-center justify-center p-6 space-y-4 text-center">
      <AlertCircle className="w-12 h-12 text-red-500" />
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="text-sm text-gray-600">{description}</p>
      <Button onClick={() => router.refresh()} variant="outline">
        {retryText}
      </Button>
    </div>
  )
}
