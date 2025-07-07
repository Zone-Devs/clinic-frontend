import type { ReactNode } from 'react'
import ClientRootLayout from '@/app/components/ClientRootLayout'

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <ClientRootLayout>{children}</ClientRootLayout>
  )
}
