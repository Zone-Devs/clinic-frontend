'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import errorIllustration from '/public/images/500.webp'

interface ErrorFallbackProps {
  title?: string
  description?: string
  retryText?: string
}

export default function ErrorFallback({
  title = 'Algo salió mal…',
  description = 'Error interno en el servidor. Contacte a su administrador',
  retryText = 'Reintentar',
}: ErrorFallbackProps) {
  const router = useRouter()

  return (
    <div className="w-full text-center space-y-6 px-4">
      <div className="w-48 h-48 mx-auto">
        <Image
          src={errorIllustration}
          alt="Ilustración de error"
          width={192}
          height={192}
          priority
        />
      </div>
      <h2 className="text-2xl font-semibold text-gray-800">{title}</h2>
      <p className="text-sm text-gray-600">{description}</p>
      <Button variant="outline" onClick={() => router.refresh()}>
        {retryText}
      </Button>
    </div>
  )
}
