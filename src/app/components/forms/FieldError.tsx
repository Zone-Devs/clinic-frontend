// components/forms/FieldError.tsx
'use client'
import React from 'react'
import { AnimatePresence, motion } from 'framer-motion'

export type FieldErrorProps = {
  message?: React.ReactNode
  id?: string
  className?: string
}

export function FieldError({ message, id, className }: FieldErrorProps) {
  const show = Boolean(message)

  return (
    <motion.div
      initial="collapsed"
      animate={show ? 'open' : 'collapsed'}
      variants={{
        open: {
          gridTemplateRows: '1fr',
          opacity: 1,
          transition: { when: 'beforeChildren', duration: 0.18, ease: [0.4, 0, 0.2, 1] },
        },
        collapsed: {
          gridTemplateRows: '0fr',
          opacity: 0,
          transition: { when: 'afterChildren', duration: 0.18, ease: [0.4, 0, 0.2, 1] },
        },
      }}
      className={`grid overflow-hidden ${className ?? ''}`}
      aria-live="polite"
    >
      <div className="min-h-0">
        <AnimatePresence initial={false}>
          {show && (
            <motion.p
              key="field-error"
              initial={{ opacity: 0, y: -2 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -2 }}
              transition={{ duration: 0.14 }}
              id={id}
              role="alert"
              className="mt-1 text-sm text-red-600"
            >
              {message}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
