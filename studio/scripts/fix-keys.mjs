// Live migration: add missing `_key` to object-array items in existing Sanity documents
// (project kmk75dg3, dataset from studio/.env). The seed script originally wrote array
// items without `_key`, which makes Sanity Studio show "Missing keys" warnings and
// blocks editing those lists. This script patches existing documents in place —
// it never uses createOrReplace, so it cannot clobber user edits made in Studio.
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

// 12-char alphanumeric key, matching Sanity's own _key format. Shared shape with seed.mjs's keyId().
function keyId() {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let out = '';
  for (let i = 0; i < 12; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

// Walk a document's fields recursively. For every array of OBJECTS found, record the
// field path (dot/bracket-free — we patch whole arrays via `set`) if any item is missing
// `_key`, after mutating a deep-cloned copy to fill in the missing keys.
// Arrays of primitives (strings, numbers, etc.) are left alone.
function findAndFixArrays(value, pathPrefix, fixes) {
  if (Array.isArray(value)) {
    const isObjectArray = value.some((item) => item && typeof item === 'object' && !Array.isArray(item));
    if (isObjectArray) {
      let changed = false;
      for (const item of value) {
        if (item && typeof item === 'object' && !Array.isArray(item)) {
          if (!item._key) {
            item._key = keyId();
            changed = true;
          }
          // recurse into nested arrays/objects within this item (e.g. body[].markDefs, nested objects)
          for (const [k, v] of Object.entries(item)) {
            findAndFixArrays(v, pathPrefix ? `${pathPrefix}.${k}` : k, fixes);
          }
        }
      }
      if (changed && pathPrefix) {
        fixes[pathPrefix] = value;
      }
    } else {
      // array of primitives or arrays of arrays — recurse just in case of nested arrays-of-objects
      value.forEach((item) => findAndFixArrays(item, pathPrefix, fixes));
    }
  } else if (value && typeof value === 'object') {
    for (const [k, v] of Object.entries(value)) {
      findAndFixArrays(v, pathPrefix ? `${pathPrefix}.${k}` : k, fixes);
    }
  }
}

// Given a doc, compute { fieldPath: fixedArray } for every top-level-reachable array
// that had at least one item missing `_key`. Mutates a working copy, not the original doc
// object reference passed to Sanity (we only ever read from `doc` and stage new arrays).
function computeFixes(doc) {
  const fixes = {};
  for (const [key, val] of Object.entries(doc)) {
    if (key.startsWith('_')) continue; // skip _id, _type, _rev, _createdAt, _updatedAt
    findAndFixArrays(val, key, fixes);
  }
  return fixes;
}

async function patchDoc(doc) {
  const fixes = computeFixes(doc);
  const fieldNames = Object.keys(fixes);
  if (fieldNames.length === 0) return { id: doc._id, fixed: 0, fields: [] };

  await client.patch(doc._id).set(fixes).commit({ autoGenerateArrayKeys: false });
  return { id: doc._id, fixed: fieldNames.length, fields: fieldNames };
}

async function main() {
  const docs = await client.fetch(
    `*[_type in ["homePage", "entity", "activationPhoto", "program", "post", "siteSettings"] || _id in ["homePage", "drafts.homePage", "siteSettings", "drafts.siteSettings"]]`
  );

  console.log(`Fetched ${docs.length} documents (published + drafts) to check.`);

  const results = [];
  for (const doc of docs) {
    const result = await patchDoc(doc);
    results.push(result);
  }

  console.log('\n--- Fix summary ---');
  let totalFixedDocs = 0;
  for (const r of results) {
    if (r.fixed > 0) {
      totalFixedDocs++;
      console.log(`${r.id}: fixed ${r.fixed} field(s) -> [${r.fields.join(', ')}]`);
    } else {
      console.log(`${r.id}: no missing keys`);
    }
  }
  console.log(`\nTotal documents patched: ${totalFixedDocs} / ${results.length}`);

  // verify: re-fetch homePage (published + draft) and confirm no object-array item lacks _key
  const verifyIds = ['homePage', 'drafts.homePage'];
  const verifyDocs = await client.fetch(`*[_id in $ids]`, { ids: verifyIds });
  let missingAny = false;
  for (const doc of verifyDocs) {
    const fixes = computeFixes(doc);
    if (Object.keys(fixes).length > 0) {
      missingAny = true;
      console.error(`VERIFY FAILED: ${doc._id} still missing _key in [${Object.keys(fixes).join(', ')}]`);
    }
  }
  if (!missingAny) {
    console.log(`\nVerify OK: no object-array item missing _key in ${verifyDocs.map((d) => d._id).join(', ') || '(no homePage docs found)'}.`);
  } else {
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error('fix-keys failed:', err.message);
  process.exit(1);
});
