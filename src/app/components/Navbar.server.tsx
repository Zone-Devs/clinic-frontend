// src/app/components/Navbar.server.tsx
import { cookies } from 'next/headers'
import NavbarClient from './NavbarClient'  // Client Component

export default async function Navbar() {
  const token = (await cookies()).get('token')?.value

  if (!token) return null

  return <NavbarClient />
}
