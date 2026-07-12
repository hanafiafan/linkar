import type { APIRoute } from 'astro';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { isAuthenticated } from '../../lib/adminAuth';
import { isSiteContent } from '../../lib/content';
import { pushFileToGitHub } from '../../lib/github';

export const prerender = false;

const env = (k: string): string | undefined => (import.meta.env as any)?.[k] ?? process.env[k];

export const POST: APIRoute = async ({ request, cookies }) => {
  if (!isAuthenticated(cookies)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  try {
    const payload = await request.json();

    // Tolak struktur yang salah sebelum ditulis — draf korup bisa merusak
    // pratinjau dan (setelah publish) build situs
    if (!isSiteContent(payload)) {
      return new Response(JSON.stringify({ error: 'Struktur konten tidak valid — draf tidak disimpan' }), { status: 400 });
    }

    const json = JSON.stringify(payload, null, 2);

    // Vercel Functions: filesystem read-only (kecuali /tmp, tidak persisten
    // lintas instance) — draf disimpan lewat commit GitHub, bukan disk lokal.
    if (process.env.VERCEL) {
      const github = await pushFileToGitHub(
        env('GITHUB_DRAFT_PATH') || 'web/src/content/draft.json',
        Buffer.from(json, 'utf-8'),
        'cms: save draft'
      );
      if (!github) {
        return new Response(JSON.stringify({ error: 'GITHUB_TOKEN/GITHUB_REPO belum dikonfigurasi — draf tidak bisa disimpan di Vercel' }), { status: 500 });
      }
      return new Response(JSON.stringify({ success: true, github }), { status: 200 });
    }

    const filePath = path.resolve(process.cwd(), 'src/content/draft.json');
    fs.writeFileSync(filePath, json, 'utf-8');

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: `Gagal menyimpan data: ${e.message}` }), { status: 500 });
  }
};
