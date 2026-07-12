import type { APIRoute } from 'astro';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { isAuthenticated } from '../../lib/adminAuth';
import { isSiteContent } from '../../lib/content';
import { pushFileToGitHub } from '../../lib/github';

export const prerender = false;

// Satu scope per section CMS — daftar path yang disalin dari draft ke published.
const SCOPE_PATHS: Record<string, string[]> = {
  umum: ['settings'],
  hero: ['home.hero', 'home.visibility.hero'],
  marquee: ['home.marquee', 'home.visibility.marquee'],
  about: ['home.about', 'home.visibility.about'],
  portfolio: ['home.portfolio', 'photos', 'home.visibility.portfolio'],
  services: ['home.services', 'home.visibility.services'],
  stats: ['home.linkarStats', 'home.visibility.linkarStats'],
  industry: ['home.industry', 'home.visibility.industry'],
  commitments: ['home.commitments', 'home.visibility.commitments'],
  cta: ['home.cta', 'home.visibility.cta'],
  entities: ['entities'],
  programs: ['programs'],
  posts: ['posts'],
  all: ['settings', 'home', 'entities', 'photos', 'programs', 'posts'],
};

const getPath = (obj: any, p: string) => p.split('.').reduce((a, k) => a?.[k], obj);
const setPath = (obj: any, p: string, v: unknown) => {
  const keys = p.split('.');
  const last = keys.pop()!;
  let d = obj;
  for (const k of keys) {
    if (typeof d[k] !== 'object' || d[k] === null) d[k] = {};
    d = d[k];
  }
  d[last] = v;
};

export const POST: APIRoute = async ({ request, cookies }) => {
  if (!isAuthenticated(cookies)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  try {
    const { scope, draft: draftFromClient } = await request.json();
    const paths = SCOPE_PATHS[scope];
    if (!paths) {
      return new Response(JSON.stringify({ error: `Scope "${scope}" tidak dikenal` }), { status: 400 });
    }

    const publishedPath = path.resolve(process.cwd(), 'src/content/seed.json');

    // Utamakan draf yang dikirim langsung dari klien: pada Vercel, draf yang
    // baru saja disimpan lewat /api/save tidak akan pernah muncul di disk
    // instance ini (baca stale sampai build berikutnya), jadi tidak bisa
    // diandalkan untuk publish saat itu juga.
    let draft: any = draftFromClient;
    if (!draft || !isSiteContent(draft)) {
      const draftPath = path.resolve(process.cwd(), 'src/content/draft.json');
      if (!fs.existsSync(draftPath)) {
        return new Response(JSON.stringify({ error: 'Tidak ada draf yang tersedia' }), { status: 400 });
      }
      draft = JSON.parse(fs.readFileSync(draftPath, 'utf-8'));
    }

    let published = {} as any;
    if (fs.existsSync(publishedPath)) {
      published = JSON.parse(fs.readFileSync(publishedPath, 'utf-8'));
    }

    for (const p of paths) {
      const v = getPath(draft, p);
      if (v !== undefined) setPath(published, p, v);
    }

    // Jangan pernah menerbitkan konten yang strukturnya rusak — bisa
    // menggagalkan build situs statis
    if (!isSiteContent(published)) {
      return new Response(JSON.stringify({ error: 'Hasil gabungan tidak valid strukturnya — publish dibatalkan' }), { status: 400 });
    }

    const json = JSON.stringify(published, null, 2);
    const env = (k: string) => (import.meta.env as any)?.[k] ?? process.env[k];

    // Vercel Functions: filesystem read-only — GitHub adalah satu-satunya
    // cara publish benar-benar berefek (memicu build ulang situs statis).
    if (process.env.VERCEL) {
      const github = await pushFileToGitHub(
        env('GITHUB_CONTENT_PATH') || 'web/src/content/seed.json',
        Buffer.from(json, 'utf-8'),
        `cms: publish ${scope}`
      );
      if (!github) {
        return new Response(JSON.stringify({ error: 'GITHUB_TOKEN/GITHUB_REPO belum dikonfigurasi — publish tidak berfungsi di Vercel tanpa itu' }), { status: 500 });
      }
      return new Response(JSON.stringify({ success: true, github }), { status: 200 });
    }

    fs.writeFileSync(publishedPath, json, 'utf-8');

    const github = await pushFileToGitHub(
      env('GITHUB_CONTENT_PATH') || 'web/src/content/seed.json',
      Buffer.from(json, 'utf-8'),
      `cms: publish ${scope}`
    );

    return new Response(JSON.stringify({ success: true, github }), { status: 200 });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: `Gagal mempublikasikan: ${e.message}` }), { status: 500 });
  }
};
