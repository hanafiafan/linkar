// Live migration: set homePage.hero.visualMode='logo3d' on the live document
// (project kmk75dg3, dataset from studio/.env) without touching any other field.
// Patch, not replace — safe to re-run, never clobbers editor changes elsewhere in hero.
import { createClient } from '@sanity/client';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// parse studio/.env manually — never log its contents
function loadEnv(file) {
  const env = {};
  for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
    const m = line.match(/^([A-Z_]+)=(.*)$/);
    if (m) env[m[1]] = m[2].trim();
  }
  return env;
}

const env = loadEnv(path.join(__dirname, '..', '.env'));
const projectId = env.SANITY_STUDIO_PROJECT_ID;
const dataset = env.SANITY_STUDIO_DATASET || 'production';
const token = env.SANITY_WRITE_TOKEN;

if (!projectId || !token) {
  console.error('Missing SANITY_STUDIO_PROJECT_ID or SANITY_WRITE_TOKEN in studio/.env');
  process.exit(1);
}

const client = createClient({ projectId, dataset, token, apiVersion: '2026-07-01', useCdn: false });

async function main() {
  const doc = await client.fetch(`*[_id=="homePage"][0]{_id, "visualMode": hero.visualMode}`);
  if (!doc) {
    console.error('homePage document not found — run studio/scripts/seed.mjs first.');
    process.exit(1);
  }

  if (doc.visualMode === 'logo3d') {
    console.log('homePage.hero.visualMode already "logo3d" — nothing to do.');
    return;
  }

  await client.patch('homePage').set({ 'hero.visualMode': 'logo3d' }).commit();
  console.log('Patched homePage.hero.visualMode -> "logo3d"');

  const verify = await client.fetch(`*[_id=="homePage"][0].hero.visualMode`);
  console.log('Verify:', verify);
  if (verify !== 'logo3d') {
    console.error('VERIFY FAILED: hero.visualMode is not "logo3d"');
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error('patch-hero-visual-mode failed:', err.message);
  process.exit(1);
});
