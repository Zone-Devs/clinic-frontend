import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyToken } from '@/utils/auth'
import LoginForm from './LoginForm'

export default async function LoginPage() {
  const token = (await cookies()).get('token')?.value
  const user = token ? verifyToken(token) : null

  if (user) {
    redirect('/dashboard')
  }

  return (
    <main className="flex items-center justify-center h-screen">
      <LoginForm />
    </main>
  )
}
