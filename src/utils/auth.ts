// src/utils/auth.ts
import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'dev-secret';

// Mock data
const users = [
  { id: '1', email: 'user@ex.com', password: '1234', name: 'Usuario Ejemplo' },
];

export function validateUser(email: string, password: string) {
  return users.find(u => u.email === email && u.password === password) || null;
}

export function signToken(payload: { id: string; email: string }) {
  return jwt.sign(payload, SECRET, { expiresIn: '1h' });
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, SECRET) as { id: string; email: string; iat: number; exp: number };
  } catch {
    return null;
  }
}
