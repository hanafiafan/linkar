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
    const { scope } = await request.json();
    if (!scope) {
      return new Response(JSON.stringify({ error: 'Scope tidak ditentukan' }), { status: 400 });
    }

    const draftPath = path.resolve(process.cwd(), 'src/content/draft.json');
    const publishedPath = path.resolve(process.cwd(), 'src/content/seed.json');

    if (!fs.existsSync(draftPath)) {
      return new Response(JSON.stringify({ error: 'Tidak ada draf yang tersedia' }), { status: 400 });
    }

    // Read both draft and published
    const draft = JSON.parse(fs.readFileSync(draftPath, 'utf-8'));
    
    let published = {} as any;
    if (fs.existsSync(publishedPath)) {
      published = JSON.parse(fs.readFileSync(publishedPath, 'utf-8'));
    }

    // Ensure home object exists in published
    if (!published.home) published.home = {};

    // Selective copy based on scope
    if (scope === 'hero') {
      published.settings = draft.settings;
      published.home.hero = draft.home.hero;
      published.home.visibility = draft.home.visibility;
    } else if (scope === 'about') {
      published.home.about = draft.home.about;
      published.home.services = draft.home.services;
    } else if (scope === 'portfolio') {
      published.home.portfolio = draft.home.portfolio;
      published.photos = draft.photos;
    } else if (scope === 'entities') {
      published.entities = draft.entities;
    } else {
      return new Response(JSON.stringify({ error: `Scope "${scope}" tidak dikenal` }), { status: 400 });
    }

    // Write back to seed.json (publish)
    fs.writeFileSync(publishedPath, JSON.stringify(published, null, 2), 'utf-8');

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: `Gagal mempublikasikan: ${e.message}` }), { status: 500 });
  }
};
