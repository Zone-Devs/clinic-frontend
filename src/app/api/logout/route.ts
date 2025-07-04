// src/app/api/logout/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  const url = new URL('/login', req.url);
  const res = NextResponse.redirect(url);
  res.cookies.set('token', '', {
    httpOnly: true,
    path: '/',
    maxAge: 0,
  });
  return res;
}