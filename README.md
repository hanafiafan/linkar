# LINKAR

Marketing site + lightweight custom CMS for RUN's ecosystem-enabler brand LINKAR.

## Layout

- `web/` — Astro 7 site, deployed to Vercel. Contains the public site, the
  `/admin` CMS dashboard, and its API routes (`web/src/pages/api/*`).
- `docs/` — design/redesign notes and planning docs (this plan included).


## Local development

```bash
cd web
npm install
npm run dev
```

## Deployment



## Content model

Site content lives in `web/src/content/seed.json` (live) and
`web/src/content/draft.json` (CMS draft). Edited via `/admin`, published
through the CMS which validates structure before writing.
