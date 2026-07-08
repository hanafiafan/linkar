import type { APIRoute } from 'astro';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const { password } = await request.json();
    const correctPassword = import.meta.env.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD || 'admin123';

    if (password === correctPassword) {
      cookies.set('linkar_admin_session', 'authenticated', {
        path: '/',
        httpOnly: true,
        secure: import.meta.env.PROD,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7 // 1 week
      });
      return new Response(JSON.stringify({ success: true }), { status: 200 });
    }

    return new Response(JSON.stringify({ error: 'Password salah' }), { status: 401 });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Format request salah' }), { status: 400 });
  }
};
