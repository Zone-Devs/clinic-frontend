import { cookies }    from 'next/headers'
import { verifyToken } from '@/utils/auth'
import NavbarClient   from './NavbarClient'

export default async function Navbar() {
  const token = (await cookies()).get('token')?.value
  const user  = token ? verifyToken(token) : null
  if (!user) return null

  return <NavbarClient user={user} />
}
