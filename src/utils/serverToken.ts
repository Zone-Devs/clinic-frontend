export function isJwtExpired(token: string): boolean {
  try {
    // 1) Partimos el token en sus 3 trozos
    const [, b64Payload] = token.split('.')
    // 2) Reconstruimos Base64Url → Base64
    const payload = b64Payload.replace(/-/g, '+').replace(/_/g, '/')
    const json = Buffer.from(payload, 'base64').toString('utf8')
    const data = JSON.parse(json) as { exp?: number }
    if (!data.exp) return true
    // 3) exp va en segundos
    return Date.now() >= data.exp * 1000
  } catch {
    return true
  }
}
