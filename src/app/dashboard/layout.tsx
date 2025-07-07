// src/app/dashboard/layout.tsx
import type { ReactNode } from 'react'
import { cookies } from 'next/headers'
import { verifyToken } from '@/utils/auth'
import ClientRootLayout from '@/app/components/ClientRootLayout'

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const token = (await cookies()).get('token')?.value
  const user = token ? verifyToken(token) : null

  // Si no hay sesión, podrías redirect('/login') aquí
  // pero asumimos que el middleware ya lo hizo.

  return (
    // Pasamos `user` al cliente
    <ClientRootLayout user={user}>{children}</ClientRootLayout>
  )
}
