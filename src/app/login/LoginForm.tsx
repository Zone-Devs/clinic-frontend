'use client'
import { FormEvent, useState, useRef } from 'react'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [emailError, setEmailError] = useState('')
  const emailRef = useRef<HTMLInputElement>(null)

  // Regex básica para email
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  function validateEmail(value: string) {
    if (!value) {
      return 'El email es obligatorio'
    }
    if (!emailPattern.test(value)) {
      return 'Formato de email no válido'
    }
    return ''
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')

    const emailErr = validateEmail(email)
    if (emailErr) {
      setEmailError(emailErr)
      emailRef.current?.focus()
      return
    }
    setEmailError('')

    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    if (res.ok) {
      window.location.href = '/dashboard'
    } else {
      const { error } = await res.json()
      setError(error)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="p-6 border rounded-md w-full max-w-sm">
      <h1 className="text-2xl mb-4">Iniciar sesión</h1>

      {/* Email */}
      <label className="block mb-2">
        Email
        <input
          ref={emailRef}
          type="email"
          required
          value={email}
          onChange={e => {
            setEmail(e.target.value)
            if (emailError) {
              setEmailError(validateEmail(e.target.value))
            }
          }}
          className={`block w-full border p-1 ${emailError ? 'border-red-500' : ''}`}
          placeholder="usuario@ejemplo.com"
        />
      </label>
      {emailError && <p className="text-red-500 mb-2 text-sm">{emailError}</p>}

      {/* Contraseña */}
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

      {/* Error global */}
      {error && <p className="text-red-500 mb-2">{error}</p>}

      <button
        type="submit"
        className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
      >
        Entrar
      </button>
    </form>
  )
}
