import type { ReactNode } from 'react'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import ClientRootLayout from '@/app/components/roles/ClientRootLayout'
import { isJwtExpired } from '@/utils/serverToken'

export default async function ProtectedLayout({
  children,
}: {
  children: ReactNode
}) {
  // Protege: si no hay cookie, al login
  const token = (await cookies()).get('token')?.value
  if (!token) redirect('/login')
  if (isJwtExpired(token)) redirect('/login')

  return (
    <ClientRootLayout>
      {children}
      </ClientRootLayout>
  )
}
