'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useRouter } from 'next/navigation'
import { toast } from 'react-toastify'
import axiosClient from '@/utils/axiosClient'
import { useUser } from '@/context/UserContext'

import {
  Form, FormField, FormItem, FormLabel, FormControl, FormMessage
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Eye, EyeOff, Mail, Lock } from 'lucide-react'

// 1) esquema
const loginSchema = z.object({
  email:    z.string().email({ message: 'Email no válido' }),
  password: z.string().min(6,  { message: 'Mínimo 6 caracteres' }),
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function LoginForm() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { setUser } = useUser();

  const form = useForm<LoginFormValues>({
    resolver:    zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

async function onSubmit(values: LoginFormValues) {
  try {
    setIsSubmitting(true)
    const res = await axiosClient.post(
      '/api/login',
      { email: values.email, password: values.password },
      { validateStatus: status => true }
    )

    if (res.status === 401) {
      toast.error('Credenciales incorrectas')
      return
    }
    if (res.status !== 200) {
      toast.error(`Error interno en el servidor`)
      return
    }
    const { data } = res;
    
    setUser({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email
    })

    router.replace('/dashboard')

  } finally {
    setIsSubmitting(false)
  }
}


  return (
    <div className="min-h-screen flex items-center justify-center bg-bg px-4">
      <div className="w-full max-w-md bg-surface p-8 rounded-xl shadow-lg">
        <h2 className="text-center text-3xl font-bold text-primary mb-6">
          Bienvenido
        </h2>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {/* Email */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-text-light" size={16}/>
                      <Input {...field} type="email"
                             placeholder="usuario@ejemplo.com"
                             className="pl-10"/>
                    </div>
                  </FormControl>
                  <FormMessage/>
                </FormItem>
              )}
            />

            {/* Password */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contraseña</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-text-light" size={16}/>
                      <Input {...field}
                             type={showPassword ? 'text' : 'password'}
                             placeholder="••••••••"
                             className="pl-10 pr-10"/>
                      <button type="button"
                              onClick={() => setShowPassword(v => !v)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-light">
                        {showPassword ? <EyeOff size={16}/> : <Eye size={16}/>}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage/>
                </FormItem>
              )}
            />

            <Button type="submit"
                    className="w-full"
                    isLoading={isSubmitting}>
              Entrar
            </Button>
          </form>
        </Form>
      </div>
    </div>
  )
}
