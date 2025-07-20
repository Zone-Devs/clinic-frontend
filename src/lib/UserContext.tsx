'use client'
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react'

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  fullName: string
  role: string
  gender: string
  needUpdatePassword: boolean
  token: string
}

interface Context {
  user: User | null
  setUser: (u: User) => void
}

const UserContext = createContext<Context>({
  user: null,
  setUser: () => {},
})

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(null)

  useEffect(() => {
    const json = localStorage.getItem('user')
    if (json) setUserState(JSON.parse(json))
  }, [])

  const setUser = (u: User) => {
    localStorage.setItem('user', JSON.stringify(u))
    setUserState(u)
  }

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  return useContext(UserContext)
}
