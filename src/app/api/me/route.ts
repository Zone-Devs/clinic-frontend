import { NextResponse } from 'next/server';
import { verifyToken } from '@/utils/auth';
import type { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  const token = req.cookies.get('token')?.value;
  if (!token) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }
  const user = verifyToken(token);
  if (!user) {
    return NextResponse.json({ error: 'Token inválido o expirado' }, { status: 401 });
  }

  return NextResponse.json({ id: user.id, email: user.email });
}
