// src/app/page.tsx
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyToken } from '@/utils/auth'

export default async function HomePage() {
  const token = (await cookies()).get('token')?.value
  const user = token ? verifyToken(token) : null

  if (user) {
    redirect('/dashboard')
  } else {
    redirect('/login')
  }
}
