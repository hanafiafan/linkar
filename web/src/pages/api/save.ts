import type { APIRoute } from 'astro';
import * as fs from 'node:fs';
import * as path from 'node:path';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  // Validate session
  const session = cookies.get('linkar_admin_session')?.value;
  if (session !== 'authenticated') {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  try {
    const payload = await request.json();

    if (!payload.settings || !payload.home) {
      return new Response(JSON.stringify({ error: 'Payload tidak valid' }), { status: 400 });
    }

    const filePath = path.resolve(process.cwd(), 'src/content/draft.json');

    // Write file back to draft.json with pretty-printing (2-space indent)
    fs.writeFileSync(filePath, JSON.stringify(payload, null, 2), 'utf-8');

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: `Gagal menyimpan data: ${e.message}` }), { status: 500 });
  }
};
