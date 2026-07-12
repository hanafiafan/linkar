# Repo Structure Cleanup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the LINKAR repo read like a professional monorepo — clean root, no dead code, automated build checks on every push, and clear documentation of which Vercel project is canonical.

**Architecture:** Two real subprojects live at repo root: `web/` (Astro site + custom CMS, deployed to Vercel project `linkar`) and `studio/` (Sanity Studio — currently unused by `web/`, dead weight, gets removed). `Linkar/`, `assets/`, `_unpacked_pptx/`, `linkar.html` are already gitignored local scratch material — untouched by this plan since they never reach git or a clone of the repo. This plan only touches what actually ships in version control: root hygiene, dead-code removal, CI, and docs.

**Tech Stack:** Astro 7, Vercel adapter, GitHub Actions, npm.

## Global Constraints

- Do not touch `Linkar/`, `assets/`, `_unpacked_pptx/`, `linkar.html` — gitignored, out of scope, purely local reference material.
- Every task must end with `npm run build` and `npm test` (run from `web/`) passing — this repo's production site must never regress.
- Do not modify anything under `web/src/pages/api/*`, `web/src/lib/adminAuth.ts`, `web/src/lib/github.ts` — those are pending, already-edited CMS fixes from a separate piece of work and are out of scope here.
- Node version floor: `>=22.12.0` (from `web/package.json` engines) — CI must match.

---

### Task 1: Root git hygiene — untrack `.DS_Store`, dedupe `.gitignore`, relocate loose doc, add root README

**Files:**
- Modify: `.gitignore` (repo root)
- Delete (from git tracking only): `.DS_Store` (repo root)
- Move: `IGNITE_REDESIGN.md` → `docs/ignite-redesign.md`
- Create: `README.md` (repo root)

**Interfaces:**
- Consumes: nothing from other tasks.
- Produces: a root `README.md` that Task 4 will extend with a "Deployment" section — keep a `## Deployment` heading present (even if just a placeholder line) so Task 4 can find and replace it.

- [ ] **Step 1: Deduplicate `.gitignore`**

Replace the full contents of `.gitignore` (repo root) with:

```
/Linkar/
/assets/
/_unpacked_pptx/
node_modules/
.env
.env.*
dist/
.astro/
.superpowers/
studio/.sanity/
/linkar.html
.claude/
.vercel
.env*
!.env.example
.DS_Store
```

- [ ] **Step 2: Untrack `.DS_Store`**

Run: `git rm --cached .DS_Store`
Expected: `rm '.DS_Store'` — file stays on disk, only leaves the index.

- [ ] **Step 3: Move the redesign doc into `docs/`**

Run:
```bash
git mv IGNITE_REDESIGN.md docs/ignite-redesign.md
```
Expected: `git status` shows a rename, not a delete+add.

- [ ] **Step 4: Write the root README**

Create `README.md`:

```markdown
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

_placeholder — filled in by the deployment-docs task._

## Content model

Site content lives in `web/src/content/seed.json` (live) and
`web/src/content/draft.json` (CMS draft). Edited via `/admin`, published
through the CMS which validates structure before writing.
```

- [ ] **Step 5: Commit**

```bash
git add .gitignore .DS_Store README.md docs/ignite-redesign.md
git commit -m "chore: clean up root — untrack .DS_Store, dedupe gitignore, add README"
```

---

### Task 2: Remove the dead Sanity integration

**Context:** `web/src/lib/sanity.ts` defines `fetchFromSanity()`, but nothing in `web/src` imports it (verified: `grep -rln "lib/sanity" web/src` returns nothing). The site reads content from `web/src/content/seed.json`/`draft.json` via `getContent()` in `web/src/lib/content.ts` instead. The `studio/` folder (a full Sanity Studio project with schemas) exists only to author content for this unused path. This is confirmed dead code, not a guess.

**Files:**
- Delete: `web/src/lib/sanity.ts`
- Modify: `web/package.json` (remove `@sanity/client` dependency)
- Modify: `web/.env.example` (remove `SANITY_PROJECT_ID`/`SANITY_DATASET`)
- Delete: `studio/` (entire folder, git-tracked)

**Interfaces:**
- Consumes: nothing.
- Produces: nothing consumed by later tasks.

- [ ] **Step 1: Confirm zero usage one more time before deleting**

Run (from repo root): `grep -rn "lib/sanity\|fetchFromSanity" web/src`
Expected: no output. If this prints anything, STOP — do not proceed with this task, re-scope it.

- [ ] **Step 2: Delete the dead file and the unused dependency**

```bash
rm web/src/lib/sanity.ts
```

Edit `web/package.json`, remove this line from `dependencies`:
```json
    "@sanity/client": "^7.23.0",
```

- [ ] **Step 3: Remove Sanity env vars from the example file**

Edit `web/.env.example`, remove the first two lines:
```
SANITY_PROJECT_ID=
SANITY_DATASET=production
```
(File should now start directly with `PUBLIC_WEB3FORMS_KEY=`.)

- [ ] **Step 4: Regenerate the lockfile**

```bash
cd web
npm install
```
Expected: `package-lock.json` updates, `@sanity/client` and its transitive deps disappear from it, no errors.

- [ ] **Step 5: Verify the site still builds and tests still pass**

```bash
npm run build
npm test
```
Expected: both succeed exactly as before (this dependency was never on the runtime import path).

- [ ] **Step 6: Delete the studio subproject**

```bash
cd ..
git rm -r studio
```
Expected: all `studio/*` files staged for deletion. (Fully recoverable later via `git log -- studio` / `git revert` if this turns out to be wrong.)

- [ ] **Step 7: Commit**

```bash
git add web/package.json web/package-lock.json web/.env.example
git commit -m "chore: remove unused Sanity integration (dead code, zero imports)"
```

---

### Task 3: Add CI — build + test on every push and PR

**Context:** Deploys are currently manual (`vercel --prod` from a laptop). This session, a manual redeploy briefly took production fully down because nothing checked the build before it went live. A CI workflow catches that class of mistake before it reaches `vercel --prod`.

**Files:**
- Create: `.github/workflows/ci.yml`

**Interfaces:**
- Consumes: nothing.
- Produces: nothing consumed by later tasks (Task 4's README section references this workflow by name).

- [ ] **Step 1: Write the workflow**

Create `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: web
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22.12'
          cache: 'npm'
          cache-dependency-path: web/package-lock.json
      - run: npm ci
      - run: npm run build
      - run: npm test
```

- [ ] **Step 2: Validate the YAML locally**

Run: `python3 -c "import yaml,sys; yaml.safe_load(open('.github/workflows/ci.yml'))"`
Expected: no output, exit code 0. (If `python3`/`pyyaml` isn't available, skip — GitHub will validate on push instead.)

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/ci.yml
git commit -m "ci: build and test web/ on every push and pull request"
```

- [ ] **Step 4: Push and confirm the workflow runs**

```bash
git push
```
Then check: `gh run list --limit 1` (or the Actions tab on GitHub) — expect a run triggered on this push, ending in success.

---

### Task 4: Document the canonical Vercel project and deployment flow

**Context:** This session uncovered two Vercel projects for the same site: `web` (correct Astro adapter output, not Git-linked) and `linkar` (Git-linked, was misconfigured, now fixed via root `vercel.json`). `linkar` is canonical going forward — production is aliased at `https://linkar-run.vercel.app`. None of this was written down anywhere, which is exactly how the mixup happened. This task fixes that with plain documentation; it does not touch the Vercel dashboard (that's a manual, human action — see Step 3).

**Files:**
- Modify: `README.md` (repo root) — replace the `## Deployment` placeholder from Task 1

**Interfaces:**
- Consumes: the `## Deployment` heading created in Task 1, Step 4.
- Produces: nothing.

- [ ] **Step 1: Replace the Deployment section**

In `README.md`, replace:
```markdown
## Deployment

_placeholder — filled in by the deployment-docs task._
```
with:

```markdown
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
```

- [ ] **Step 2: Verify the file renders sensibly**

Run: `cat README.md` and read it top to bottom — confirm no leftover placeholder text, no broken markdown headings (`##` still present, no duplicate `## Deployment`).

- [ ] **Step 3: Commit**

```bash
git add README.md
git commit -m "docs: document canonical Vercel project and deployment flow"
```

- [ ] **Step 4: Manual follow-up (not automatable, do this yourself in the Vercel dashboard)**

- Retire the `web` Vercel project once `linkar` has been stable for a few days (Project Settings → Delete Project).
- Add `GITHUB_TOKEN` and `GITHUB_REPO` as Environment Variables on the `linkar` project in the Vercel dashboard, Production scope — without them, Save/Publish/Discard/Upload in the CMS return a clear error instead of a silent no-op (this was fixed in the earlier CMS session work, still pending its own commit).

---

## Self-Review

**Spec coverage:** root hygiene ✅ (Task 1), dead code removal ✅ (Task 2), CI ✅ (Task 3), Vercel/deployment documentation ✅ (Task 4). Nothing from the original ask ("suggestions for professional structure") is left unaddressed except the two purely dashboard-side actions in Task 4 Step 4, which cannot be scripted and are called out explicitly as manual.

**Placeholder scan:** the only literal "placeholder" text is the intentional one in Task 1 Step 4, which Task 4 Step 1 explicitly finds-and-replaces — not a plan gap.

**Type/name consistency:** `README.md`'s `## Deployment` heading is created in Task 1 and matched verbatim in Task 4; `.gitignore` final content in Task 1 Step 1 already includes `.DS_Store` so Task 1 Step 2's `git rm --cached` doesn't get re-added.
