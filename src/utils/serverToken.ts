export function isJwtExpired(token: string): boolean {
  try {
    const [, b64Payload] = token.split('.')
    const payload = b64Payload.replace(/-/g, '+').replace(/_/g, '/')
    const json = Buffer.from(payload, 'base64').toString('utf8')
    const data = JSON.parse(json) as { exp?: number }
    if (!data.exp) return true
    return Date.now() >= data.exp * 1000
  } catch {
    return true
  }
}
