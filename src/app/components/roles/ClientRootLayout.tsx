'use client'
import { ReactNode, useState, useEffect } from 'react'
import Sidebar from '@/app/components/Sidebar'
import NavbarClient from '@/app/components/NavbarClient'

interface Props {
  children: ReactNode
}

export default function ClientRootLayout({ children }: Props) {
  const [open, setOpen] = useState(false)
  const [isDesktop, setIsDesktop] = useState(false)

  useEffect(() => {
    const mql = window.matchMedia('(min-width:768px)')
    // inicializa ambos estados
    setIsDesktop(mql.matches)
    setOpen(mql.matches)

    const onChange = (e: MediaQueryListEvent) => {
      setIsDesktop(e.matches)
      setOpen(e.matches)
    }
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [])

  // onClose solo cierra en mobile
  const handleClose = () => {
    if (!isDesktop) setOpen(false)
  }

  return (
    <div className="flex h-screen">
      <Sidebar open={open} onClose={handleClose} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <NavbarClient onMenuToggle={() => setOpen(o => !o)} />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  )
}
