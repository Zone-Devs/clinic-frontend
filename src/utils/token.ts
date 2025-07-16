// src/utils/token.ts
import { jwtDecode } from 'jwt-decode'

const COOKIE_NAME = 'token'

interface JwtPayload {
  exp: number  // timestamp en segundos
  iat: number
}

/**
 * Lee el JWT directamente de document.cookie (si lo guardas ahí).
 */
export function getToken(): string | null {
  const match = document.cookie.match(
    new RegExp('(?:^|; )' + COOKIE_NAME + '=([^;]*)')
  )
  return match ? decodeURIComponent(match[1]) : null
}

/** Borra la cookie-token en el cliente (no httpOnly). */
export function clearToken() {
  document.cookie = `${COOKIE_NAME}=; Path=/; Max-Age=0`
}

/** Devuelve true si el token ha expirado o es inválido */
export function isTokenExpired(token: string): boolean {
  try {
    const { exp } = jwtDecode<JwtPayload>(token)
    return Date.now() >= exp * 1000
  } catch {
    return true
  }
}

/**
 * Opcional: devuelve el timestamp (ms) de expiración,
 * para programar un setTimeout de auto-logout.
 */
export function getTokenExpiry(): number | null {
  const token = getToken()
  if (!token) return null
  try {
    const { exp } = jwtDecode<JwtPayload>(token)
    return exp * 1000
  } catch {
    return null
  }
}
