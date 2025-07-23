'use client'

import { PlusCircle } from 'lucide-react'

interface NoDataFallback {
  type: string
  needsCreateLabel?: boolean
}

export default function NoDataFallback({ type, needsCreateLabel=false }: NoDataFallback) {
  return (
    <div className="
    flex flex-col items-center justify-center 
    p-8 space-y-4 
    bg-gray-50 border border-gray-200 
    rounded-lg shadow-sm
    ">
    <PlusCircle className="w-12 h-12 text-gray-400" />
    <h3 className="text-xl font-semibold text-gray-700">
        No se encontraron {type}s
    </h3>
    <p className="text-center text-gray-500">
        Agrega tu primera {type} haciendo click en el botón{' '}
        <strong>+ {needsCreateLabel ? "Crear" : "Añadir"} {type}</strong> que está arriba.
    </p>
    </div>
  )
}
