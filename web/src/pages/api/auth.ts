import type { APIRoute } from 'astro';
import { issueSession } from '../../lib/adminAuth';

export const prerender = false;

// ponytail: limiter in-memory per-IP — cukup untuk satu instance dev/VPS,
// pindah ke store eksternal kalau kelak multi-instance
const attempts = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;

export const POST: APIRoute = async ({ request, cookies, clientAddress }) => {
  let ip = 'unknown';
  try { ip = clientAddress; } catch { /* clientAddress bisa throw saat prerender */ }

  const now = Date.now();
  const rec = attempts.get(ip);
  if (rec && now < rec.resetAt && rec.count >= MAX_ATTEMPTS) {
    const minutes = Math.ceil((rec.resetAt - now) / 60000);
    return new Response(JSON.stringify({ error: `Terlalu banyak percobaan. Coba lagi ${minutes} menit lagi.` }), { status: 429 });
  }

  try {
    const { password } = await request.json();
    const correctPassword = import.meta.env.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD;

    // Tanpa password terkonfigurasi = CMS terkunci, bukan terbuka dengan default
    if (!correctPassword) {
      return new Response(JSON.stringify({ error: 'ADMIN_PASSWORD belum dikonfigurasi di server' }), { status: 500 });
    }

    if (password === correctPassword) {
      attempts.delete(ip);
      issueSession(cookies);
      return new Response(JSON.stringify({ success: true }), { status: 200 });
    }

    // Catat percobaan gagal untuk rate limit
    const cur = attempts.get(ip);
    if (cur && now < cur.resetAt) cur.count += 1;
    else attempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });

    return new Response(JSON.stringify({ error: 'Password salah' }), { status: 401 });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Format request salah' }), { status: 400 });
  }
};
