'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'

interface QuantityCounterProps {
  value: number
  onChange: (newValue: number) => void
  min?: number
  max?: number
}

export const Counter = ({
  value,
  onChange,
  min = 1,
  max = 99,
}: QuantityCounterProps) => {
  const [direction, setDirection] = useState<"up" | "down">("up")

  const handleChange = (delta: number) => {
    setDirection(delta > 0 ? "up" : "down")
    const next = value + delta
    if (next < min) return onChange(min)
    if (next > max) return onChange(max)
    onChange(next)
  }

  return (
    <div className="flex flex-col gap-1">
      <span className="text-sm font-medium">Cantidad</span>
      <div className="flex items-center justify-center bg-[#0e0e0e] px-4 py-2 rounded-full space-x-4">
        <button
          onClick={() => handleChange(-1)}
          disabled={value <= min}
          className="w-8 h-8 rounded-full bg-[#0f3e44] hover:bg-[#14555e] text-white text-lg transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          −
        </button>

        <div className="w-6 text-white text-lg relative h-6 overflow-hidden">
          <AnimatePresence initial={false}>
            <motion.span
              key={value}
              initial={{ y: direction === "up" ? 12 : -12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: direction === "up" ? -12 : 12, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 flex justify-center items-center"
            >
              {value}
            </motion.span>
          </AnimatePresence>
        </div>

        <button
          onClick={() => handleChange(1)}
          disabled={value >= max}
          className="w-8 h-8 rounded-full bg-[#0f3e44] hover:bg-[#14555e] text-white text-lg transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          +
        </button>
      </div>
    </div>
  )
}
