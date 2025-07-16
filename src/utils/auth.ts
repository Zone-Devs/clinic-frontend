// utils/auth.ts
import { jwtDecode } from 'jwt-decode'

const COOKIE_NAME = 'token'

export function getToken(): string | null {
  const match = document.cookie.match(
    new RegExp('(?:^|; )' + COOKIE_NAME + '=([^;]*)')
  )
  return match ? decodeURIComponent(match[1]) : null
}

export function clearToken() {
  document.cookie = `${COOKIE_NAME}=; Path=/; Max-Age=0`
}

export function getTokenExpiry(): number | null {
  const token = getToken()
  if (!token) return null
  try {
    const { exp } = jwtDecode<{ exp: number }>(token)
    return exp * 1000
  } catch {
    return null
  }
}

export function isTokenExpired(): boolean {
  const expiry = getTokenExpiry()
  return !expiry || Date.now() >= expiry
}
