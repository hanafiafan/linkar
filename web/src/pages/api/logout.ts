import type { APIRoute } from 'astro';
import { revokeSession } from '../../lib/adminAuth';

export const prerender = false;

export const POST: APIRoute = async ({ cookies }) => {
  revokeSession(cookies);
  return new Response(JSON.stringify({ success: true }), { status: 200 });
};
