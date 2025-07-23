import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import LoginForm from './LoginForm'
import LoginAnimation from './LoginAnimation'

export default async function LoginPage() {
  const token = (await cookies()).get('token')?.value

  if (token) {
    redirect('/dashboard')
  }

  return (
    <main className="relative flex items-center justify-center h-screen">
      <LoginAnimation />
      <LoginForm />
    </main>
  )
}
