// src/utils/token.ts
import { jwtDecode } from 'jwt-decode'

interface JwtPayload {
  exp: number // timestamp en segundos
  iat: number
  // otros campos si los incluyes
}

/** Devuelve true si el token ha expirado o es inválido */
export function isTokenExpired(token: string): boolean {
  try {
    const { exp } = jwtDecode<JwtPayload>(token)
    // Date.now() en milisegundos, exp en segundos
    return Date.now() >= exp * 1000
  } catch {
    // Si no se puede decodificar, lo tratamos como expirado
    return true
  }
}