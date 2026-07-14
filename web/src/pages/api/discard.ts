import type { APIRoute } from 'astro';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { isAuthenticated } from '../../lib/adminAuth';
import { pushFileToGitHub } from '../../lib/github';

export const prerender = false;

const env = (k: string): string | undefined => (import.meta.env as any)?.[k] ?? process.env[k];

// Buang draf: salin kembali konten live (seed.json) ke draft.json
export const POST: APIRoute = async ({ cookies }) => {
  if (!isAuthenticated(cookies)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  try {
    const seedPath = path.resolve(process.cwd(), 'src/content/seed.json');
    if (!fs.existsSync(seedPath)) {
      return new Response(JSON.stringify({ error: 'Konten live tidak ditemukan' }), { status: 400 });
    }

    // Vercel Functions: filesystem read-only — reset draf lewat commit GitHub
    if (process.env.VERCEL) {
      const github = await pushFileToGitHub(
        env('GITHUB_DRAFT_PATH') || 'web/src/content/draft.json',
        fs.readFileSync(seedPath),
        'cms: discard draft'
      );
      if (!github) {
        return new Response(JSON.stringify({ error: 'GITHUB_TOKEN/GITHUB_REPO belum dikonfigurasi — draf tidak bisa dibuang di Vercel' }), { status: 500 });
      }
      return new Response(JSON.stringify({ success: true, github }), { status: 200 });
    }

    const draftPath = path.resolve(process.cwd(), 'src/content/draft.json');
    fs.copyFileSync(seedPath, draftPath);
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: `Gagal membuang draf: ${e.message}` }), { status: 500 });
  }
};
