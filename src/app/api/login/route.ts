import { NextRequest, NextResponse } from 'next/server';
import { validateUser, signToken } from '@/utils/auth';

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();
  const user = validateUser(email, password);

  if (!user) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  const token = signToken({ id: user.id, email: user.email });
  const res = NextResponse.json({ ok: true });
  
  res.cookies.set('token', token, {
    httpOnly: true,
    path: '/',
    maxAge: 60 * 60,
  });
  return res;
}
