import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import LoginForm from './LoginForm'
import LoginAnimation from './LoginAnimation'

export default async function LoginPage() {
  const token = (await cookies()).get('token')?.value
  if (token) redirect('/dashboard')

  return (
    <main
      className="
        flex flex-col items-center justify-start 
        h-screen overflow-hidden bg-bg
        px-4 pt-26
      "
    >
      <LoginAnimation />
      <LoginForm />
    </main>
  )
}
