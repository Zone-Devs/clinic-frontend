// src/app/layout.tsx  (Server Component)
import type { Metadata } from 'next'
import './globals.css'
import { cookies } from 'next/headers'
import { verifyToken } from '@/utils/auth'
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
  // const token = (await cookies()).get('token')?.value
  // const user = token ? verifyToken(token) : null

  return (
    <html lang="es">
      <body>
        {/* Pasamos user (o null) al cliente */}
        {children}
        <ToastContainer position="top-center" />
      </body>
    </html>
  )
}
