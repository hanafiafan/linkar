# LINKAR

Marketing site + lightweight custom CMS for RUN's ecosystem-enabler brand LINKAR.

## Layout

- `web/` — Astro 7 site, deployed to Vercel. Contains the public site, the
  `/admin` CMS dashboard, and its API routes (`web/src/pages/api/*`).
- `docs/` — design/redesign notes and planning docs (this plan included).
- `studio/` — **not currently used.** Historical Sanity Studio scaffold, kept
  only in git history after removal (see `docs/superpowers/plans/2026-07-13-repo-structure-cleanup.md`).

## Local development

```bash
cd web
npm install
npm run dev
```

## Deployment

Canonical Vercel project: **`linkar`** (org `hanafiafan20-3489s-projects`),
linked to this GitHub repo, root `vercel.json` at repo root controls the
build. Production alias: `https://linkar-run.vercel.app`.

Do **not** deploy from inside `web/` directly — the `linkar` project's
build command (`cd web && npm run build && ...`) assumes it runs from the
repo root, where `vercel.json` lives. Deploy with:

```bash
vercel --prod   # run from the repo ROOT, not from web/
```

There is a second, older Vercel project called `web` (manually deployed,
never Git-linked) — it should be retired from the Vercel dashboard once
`linkar` has been confirmed stable for a few days. It is not used by CI or
by any script in this repo.

Required production env vars (Vercel dashboard → `linkar` project →
Settings → Environment Variables), see `web/.env.example` for the full,
current list — `ADMIN_PASSWORD` is required for the CMS to unlock at all;
`GITHUB_TOKEN`/`GITHUB_REPO` are required for Save/Publish/Discard/Upload
to do anything at all in production (the filesystem is read-only there).

## Content model

Site content lives in `web/src/content/seed.json` (live) and
`web/src/content/draft.json` (CMS draft). Edited via `/admin`, published
through the CMS which validates structure before writing.
