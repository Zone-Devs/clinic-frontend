import type { ReactNode } from 'react'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import ClientRootLayout from '@/app/components/roles/ClientRootLayout'

export default async function ProtectedLayout({
  children,
}: {
  children: ReactNode
}) {
  // Protege: si no hay cookie, al login
  const token = (await cookies()).get('token')?.value
  if (!token) redirect('/login')

  return (
    <ClientRootLayout>
      {children}
      </ClientRootLayout>
  )
}
