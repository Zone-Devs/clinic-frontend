import type { Metadata } from 'next'
import './globals.css'
import 'react-toastify/dist/ReactToastify.css'
import { ToastContainer } from 'react-toastify'

export const metadata: Metadata = {
  title: 'Sistema de veterinarias',
  description: 'Created by Zone-devs',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>
        {children}
        <ToastContainer
          position="top-center"
          autoClose={2500}
        />
      </body>
    </html>
  )
}
