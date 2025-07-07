'use client'
import { FormEvent, useState, useRef } from 'react'
import { toast } from 'react-toastify'
import { useRouter } from 'next/navigation'
import axiosClient from '@/utils/axiosClient'

const toastCustomProps = { autoClose: 1500 }

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [emailError, setEmailError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const emailRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  function validateEmail(value: string) {
    if (!value) return 'El email es obligatorio'
    if (!emailPattern.test(value)) return 'Formato de email no válido'
    return ''
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const emailErr = validateEmail(email)
    if (emailErr) {
      setEmailError(emailErr)
      emailRef.current?.focus()
      return
    }
    setEmailError('')
    setIsLoading(true)

    try {
      await axiosClient.post('/api/login', { email, password })
      router.replace('/dashboard')
    } catch (err: any) {
      if (err.response) {
        const status = err.response.status
        if (status === 400 || status === 401) {
          toast.error('Credenciales incorrectas', toastCustomProps)
        } else if (status >= 500) {
          toast.error('Error del servidor, inténtalo más tarde', toastCustomProps)
        } else {
          toast.error('Error desconocido', toastCustomProps)
        }
      } else if (err.request) {
        toast.error('Error de red, verifica tu conexión', toastCustomProps)
      } else {
        toast.error('Ha ocurrido un error', toastCustomProps)
      }

      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="p-6 border rounded-md w-full max-w-sm">
      <h1 className="text-2xl mb-4">Iniciar sesión</h1>
      <label className="block mb-2">
        Email
        <input
          ref={emailRef}
          type="email"
          required
          value={email}
          onChange={e => {
            setEmail(e.target.value)
            if (emailError) setEmailError(validateEmail(e.target.value))
          }}
          className={`block w-full border p-1 ${emailError ? 'border-red-500' : ''}`}
          placeholder="usuario@ejemplo.com"
        />
      </label>
      {emailError && <p className="text-red-500 mb-2 text-sm">{emailError}</p>}

      <label className="block mb-4">
        Contraseña
        <input
          type="password"
          required
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="block w-full border p-1"
        />
      </label>

      <button
        type="submit"
        disabled={isLoading}
        className={`w-full relative bg-blue-600 text-white p-2 rounded hover:bg-blue-700
          ${isLoading ? 'btn-progress' : ''}`}
      >
        {isLoading ? '' : 'Entrar'}
      </button>
    </form>
  )
}
