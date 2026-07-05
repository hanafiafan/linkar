// Seed Sanity (project kmk75dg3) from web/src/content/seed.json.
// Idempotent: createOrReplace with deterministic _ids, safe to re-run.
import { createClient } from '@sanity/client';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..', '..');

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

const seed = JSON.parse(fs.readFileSync(path.join(repoRoot, 'web/src/content/seed.json'), 'utf8'));

async function uploadImage(relPath) {
  const abs = path.join(repoRoot, 'web/public', relPath);
  const asset = await client.assets.upload('image', fs.createReadStream(abs), {
    filename: path.basename(abs),
  });
  return asset._id;
}

function imageRef(assetId) {
  return { _type: 'image', asset: { _type: 'reference', _ref: assetId } };
}

async function main() {
  let assetsUploaded = 0;
  let docsWritten = 0;

  // siteSettings
  const logoColorAssetId = await uploadImage('images/brand/linkar-logo.png');
  const logoWhiteAssetId = await uploadImage('images/brand/linkar-logo-white.png');
  assetsUploaded += 2;
  await client.createOrReplace({
    _id: 'siteSettings',
    _type: 'siteSettings',
    ...seed.settings,
    logoColor: imageRef(logoColorAssetId),
    logoWhite: imageRef(logoWhiteAssetId),
  });
  docsWritten++;

  // homePage
  await client.createOrReplace({ _id: 'homePage', _type: 'homePage', ...seed.home });
  docsWritten++;

  // activationPhoto (uploaded first so entities can round-robin reuse the asset refs for heroImage)
  const photoAssetIds = [];
  for (let i = 0; i < seed.photos.length; i++) {
    const p = seed.photos[i];
    const assetId = await uploadImage(p.src.replace(/^\//, ''));
    assetsUploaded++;
    photoAssetIds.push(assetId);
    await client.createOrReplace({
      _id: `photo-${String(i + 1).padStart(2, '0')}`,
      _type: 'activationPhoto',
      image: imageRef(assetId),
      caption: p.alt,
      program: p.program,
      featured: p.featured,
      orderRank: i + 1,
    });
    docsWritten++;
  }

  // entities
  for (let i = 0; i < seed.entities.length; i++) {
    const e = seed.entities[i];
    const assetId = await uploadImage(e.logo.replace(/^\//, ''));
    assetsUploaded++;
    await client.createOrReplace({
      _id: `entity-${e.name.toLowerCase()}`,
      _type: 'entity',
      name: e.name,
      role: e.role,
      tagline: e.tagline,
      logo: imageRef(assetId),
      orderRank: i + 1,
      slug: { _type: 'slug', current: e.slug },
      hasProfile: true,
      description: e.description,
      body: e.body,
      heroImage: imageRef(photoAssetIds[i % photoAssetIds.length]),
    });
    docsWritten++;
  }

  console.log(`Seed complete: ${docsWritten} documents written, ${assetsUploaded} assets uploaded.`);

  // verify
  const counts = await client.fetch(
    `{ "entities": count(*[_type=="entity"]), "photos": count(*[_type=="activationPhoto"]), "heroTitle": *[_id=="homePage"][0].hero.title, "entitiesWithProfile": count(*[_type=="entity" && defined(slug.current) && defined(description)]), "logoColor": defined(*[_id=="siteSettings"][0].logoColor) }`
  );
  console.log('Verify:', JSON.stringify(counts));
  if (counts.entities !== 6 || counts.photos !== 10 || counts.entitiesWithProfile !== 6 || !counts.logoColor) {
    console.error('WARNING: expected 6 entities (all with slug+description), 10 photos, and siteSettings.logoColor set.');
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
