import { createHmac, timingSafeEqual } from 'node:crypto';
import type { AstroCookies } from 'astro';

// Sesi stateless (HMAC-signed cookie) — bukan in-memory Set, karena Vercel
// Functions bisa jalan di banyak instance paralel/cold start yang tidak
// berbagi memory; token yang diterbitkan di satu instance harus tetap valid
// saat diverifikasi di instance lain.
const COOKIE = 'linkar_admin_session';
const MAX_AGE_SEC = 60 * 60 * 24 * 7; // 1 minggu

function secret(): string {
  return import.meta.env.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD || '';
}

function sign(payload: string): string {
  return createHmac('sha256', secret()).update(payload).digest('hex');
}

export function issueSession(cookies: AstroCookies): void {
  const expiresAt = String(Date.now() + MAX_AGE_SEC * 1000);
  const token = `${expiresAt}.${sign(expiresAt)}`;
  cookies.set(COOKIE, token, {
    path: '/',
    httpOnly: true,
    secure: import.meta.env.PROD,
    sameSite: 'lax',
    maxAge: MAX_AGE_SEC,
  });
}

export function isAuthenticated(cookies: AstroCookies): boolean {
  const token = cookies.get(COOKIE)?.value;
  if (!token) return false;

  const dot = token.lastIndexOf('.');
  if (dot < 0) return false;
  const expiresAt = token.slice(0, dot);
  const sig = token.slice(dot + 1);

  const expected = sign(expiresAt);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false;

  return Date.now() < Number(expiresAt);
}

export function revokeSession(cookies: AstroCookies): void {
  cookies.delete(COOKIE, { path: '/' });
}
