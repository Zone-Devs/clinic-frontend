import type { Metadata } from 'next'
import './globals.css'
import 'react-toastify/dist/ReactToastify.css'
import { UserProvider } from '@/context/UserContext'
import { ToastContainer } from 'react-toastify'

export const metadata: Metadata = {
  title: 'Sistema de trazabilidad',
  description: 'Created by Zone-Devs',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>
        <UserProvider>
          {children}
          <ToastContainer
            position="top-center"
            autoClose={1000}
          />
        </UserProvider>
      </body>
    </html>
  )
}
