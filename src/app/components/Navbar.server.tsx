import { cookies }    from 'next/headers'
import { isTokenExpired } from '@/utils/token'
import NavbarClient   from './NavbarClient'

export default async function Navbar() {
  const token = (await cookies()).get('token')?.value
  const user  = token ? isTokenExpired(token) : null
  if (!user) return null

  return <NavbarClient user={user} />
}
