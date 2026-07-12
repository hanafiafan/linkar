# LINKAR Landing Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and deploy the LINKAR landing page (Astro + Sanity + Vercel) with Scalient-style GSAP animations, per approved spec `docs/superpowers/specs/2026-07-04-linkar-landing-design.md`.

**Architecture:** Static Astro site in `web/` reads all content through a single data layer (`src/lib/content.ts`) that serves seed JSON until Sanity credentials exist, then GROQ queries. Separate Sanity Studio in `studio/`. GSAP animation engine driven by declarative `data-*` attributes. Program/Blog page templates built now, nav links auto-hide while their collections are empty.

**Tech Stack:** Astro 5 (static), GSAP ≥3.13 (ScrollTrigger + SplitText, free), Sanity v4 + @sanity/client + @sanity/image-url, Web3Forms, Vitest (+jsdom), @fontsource Plus Jakarta Sans, sharp (asset pipeline only), Vercel.

## Global Constraints

- Working dir: repo root is `D:\RUN PROJECT\LINKAR` (git initialized, branch `main`). Site code in `web/`, CMS in `studio/`.
- Palette (spec §3): base navy `#0a1128`, panel navy `#111a3d`, logo navy `#1F2B5B`, accent orange `#F26A21` (single accent), light band `#fafafa`, text on dark `#eef1f8`, muted `#9aa3bd`.
- Light sections: ONLY #4 Portofolio and #8 Komitmen use `#fafafa`; all others dark navy.
- Font: Plus Jakarta Sans only. `lang="id"`.
- Copy: use seed.json content VERBATIM (it encodes spec §5 approved copywriting). Do not rephrase.
- All animations gated behind `prefers-reduced-motion: no-preference`.
- No React/Vue on the site. Vanilla JS + GSAP only. Studio may use React (Sanity requires it).
- Node ≥ 20 required. Package manager: npm. Shell: PowerShell-compatible commands.
- Site must build with zero Sanity env vars (seed fallback) — CI-safe.
- Commit after every task (messages given per task). Never commit `.env`.
- Logo file from user is PENDING: navbar/footer use text wordmark `LINK**AR**` + orange ring dot (like prototype) until `assets/brand/` has the real file. Do not block on it.

---

### Task 1: Scaffold Astro project, design tokens, base layout

**Files:**
- Modify: `.gitignore` (repo root)
- Create: `web/` (Astro scaffold), `web/src/styles/global.css`, `web/src/layouts/Base.astro`, `web/src/pages/index.astro` (placeholder), `web/.env.example`

**Interfaces:**
- Produces: CSS custom properties `--navy`, `--navy-panel`, `--navy-logo`, `--orange`, `--light`, `--text`, `--muted`, `--radius`, `--maxw`; utility classes `.wrap`, `.kicker`, `.btn`, `.btn-primary`, `.btn-ghost`, `.section`, `.section--light`; layout `Base.astro` with slots and props `{ title: string, description?: string }`.

- [ ] **Step 1: Verify node ≥ 20** — Run `node -v`. If missing/old: `winget install OpenJS.NodeJS.LTS` and reopen shell.

- [ ] **Step 2: Fix root .gitignore** so it only ignores root-level source-material folders (current patterns would swallow `web/src/assets`):

```gitignore
/Linkar/
/assets/
/_unpacked_pptx/
node_modules/
.env
.env.*
!.env.example
dist/
.astro/
```

- [ ] **Step 3: Scaffold Astro** — from repo root:

```powershell
npm create astro@latest web -- --template minimal --no-git --install --yes
cd web; npm i gsap @fontsource/plus-jakarta-sans; npm i -D vitest jsdom sharp
```

- [ ] **Step 4: Create `web/src/styles/global.css`** — tokens + reset + utilities:

```css
@import "@fontsource/plus-jakarta-sans/400.css";
@import "@fontsource/plus-jakarta-sans/500.css";
@import "@fontsource/plus-jakarta-sans/600.css";
@import "@fontsource/plus-jakarta-sans/700.css";
@import "@fontsource/plus-jakarta-sans/800.css";

:root{
  --navy:#0a1128; --navy-panel:#111a3d; --navy-logo:#1F2B5B;
  --orange:#F26A21; --light:#fafafa; --text:#eef1f8; --muted:#9aa3bd;
  --ink:#13182b; --ink-muted:#5a617a;           /* text colors for light bands */
  --radius:16px; --radius-s:12px; --maxw:1180px;
}
*{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}
body{font-family:'Plus Jakarta Sans',system-ui,sans-serif;background:var(--navy);color:var(--text);line-height:1.65;-webkit-font-smoothing:antialiased}
img{display:block;max-width:100%}
a{color:inherit;text-decoration:none}
.wrap{max-width:var(--maxw);margin:0 auto;padding:0 24px}
.section{padding:96px 0}
.section--light{background:var(--light);color:var(--ink)}
.section--light .kicker{color:var(--orange)}
.kicker{display:inline-flex;align-items:center;gap:8px;padding:8px 16px;border-radius:99px;background:rgba(255,255,255,.06);color:var(--orange);font-weight:700;letter-spacing:2.5px;text-transform:uppercase;font-size:.75rem}
h1,h2,h3{font-weight:800;letter-spacing:-.02em;line-height:1.12}
.btn{display:inline-block;font-weight:700;padding:14px 28px;border-radius:12px;cursor:pointer;border:0;transition:transform .2s,background .2s;font-size:1rem}
.btn-primary{background:var(--orange);color:#1c0d02}
.btn-primary:hover{transform:translateY(-2px)}
.btn-ghost{border:1.5px solid rgba(255,255,255,.35);color:var(--text)}
.btn-ghost:hover{background:rgba(255,255,255,.08)}
@media (prefers-reduced-motion: reduce){ html{scroll-behavior:auto} }
```

- [ ] **Step 5: Create `web/src/layouts/Base.astro`**:

```astro
---
import '../styles/global.css';
interface Props { title: string; description?: string }
const { title, description = 'LINKAR — Ecosystem Enabler oleh CV Rantai Usaha Nusantara. Merancang, mengeksekusi, dan mengukur program berdampak di Yogyakarta, Jawa Tengah, dan Jawa Timur.' } = Astro.props;
---
<!doctype html>
<html lang="id">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>{title}</title>
  <meta name="description" content={description} />
  <slot name="head" />
</head>
<body>
  <slot />
  <script src="../scripts/animations.js"></script>
</body>
</html>
```

(`animations.js` arrives in Task 4 — create an empty file `web/src/scripts/animations.js` now so builds pass.)

- [ ] **Step 6: Placeholder `web/src/pages/index.astro`** rendering Base with an `<h1>LINKAR</h1>`, then verify: `npm run build` → exit 0.

- [ ] **Step 7: Create `web/.env.example`**:

```
SANITY_PROJECT_ID=
SANITY_DATASET=production
PUBLIC_WEB3FORMS_KEY=
```

- [ ] **Step 8: Commit** — `git add -A; git commit -m "feat: scaffold Astro site with LINKAR design tokens"`

---

### Task 2: Seed content + data layer

**Files:**
- Create: `web/src/content/seed.json`, `web/src/lib/content.ts`, `web/tests/content.test.ts`, `web/vitest.config.ts`

**Interfaces:**
- Produces (all later tasks consume this — exact contract):

```ts
export interface Stat { value: string; label: string; note?: string }   // value e.g. "6", "1.400", "15–20" (rendered as odometer; non-digits static)
export interface Entity { name: string; role: string; tagline: string; logo: string /* /images path or Sanity URL */ }
export interface Photo { src: string; alt: string; program: string; featured: boolean }
export interface ProgramDoc { slug: string; title: string; partner: string; period: string; location: string; summary: string; body: unknown /* string (seed) or Portable Text blocks (Sanity); templates branch on typeof === 'string' */; cover: string; impact: Stat[] }
export interface PostDoc { slug: string; title: string; excerpt: string; cover: string; body: unknown /* same as ProgramDoc.body */; author: string; date: string }
export interface SiteContent {
  settings: { formEmail: string; footerTagline: string; ctaLabel: string };
  home: {
    hero: { badge: string; title: string; highlight: string; subEn: string; subId: string; primaryCta: string; secondaryCta: string; miniStats: Stat[] };
    marquee: { kicker: string; title: string };
    about: { kicker: string; title: string; paragraphs: string[] };
    portfolio: { titlePart1: string; titlePart2: string; intro: string };
    services: { kicker: string; title: string; cards: { no: string; title: string; who: string; body: string; target: string }[]; differentiator: string };
    linkarStats: { kicker: string; items: Stat[] };
    industry: { kicker: string; title: string; items: Stat[]; closing: string };
    commitments: { title: string; cards: { title: string; body: string }[] };
    cta: { title: string; subEn: string; subId: string; submitLabel: string };
  };
  entities: Entity[]; photos: Photo[]; programs: ProgramDoc[]; posts: PostDoc[];
}
export async function getContent(): Promise<SiteContent>
```

- [ ] **Step 1: Write `web/src/content/seed.json`** — the approved copy, verbatim. Full content:

```json
{
  "settings": { "formEmail": "admin@neuverseacademy.com", "footerTagline": "Everyone can be everyone's gateway", "ctaLabel": "Ajak Kolaborasi" },
  "home": {
    "hero": {
      "badge": "ECOSYSTEM ENABLER · CV RANTAI USAHA NUSANTARA",
      "title": "Menghubungkan komunitas, korporat, dan pemerintah dalam satu lingkar dampak.",
      "highlight": "lingkar",
      "subEn": "We enable ecosystems, not just events.",
      "subId": "LINKAR merancang, mengeksekusi, dan mengukur program berdampak bagi UMKM, talenta muda, dan komunitas. Berakar di Yogyakarta, melayani Jawa Tengah & Jawa Timur.",
      "primaryCta": "Ajak Kolaborasi →", "secondaryCta": "Lihat Portofolio",
      "miniStats": [
        { "value": "6", "label": "Entitas terkoordinasi" },
        { "value": "4", "label": "Komunitas aktif" },
        { "value": "3", "label": "Provinsi inti" } ]
    },
    "marquee": { "kicker": "OUR ECOSYSTEM", "title": "Satu lingkar, enam kekuatan" },
    "about": {
      "kicker": "TENTANG KAMI · WHO WE ARE",
      "title": "Kami percaya pada kolaborasi ekosistem, bukan sekadar eksekusi acara.",
      "paragraphs": [
        "Di bawah umbrella CV Rantai Usaha Nusantara, LINKAR menyatukan enam entitas yang beroperasi mandiri namun terkoordinasi — pendekatan multi-segmen dengan fleksibilitas eksekusi yang jarang dimiliki pemain tunggal.",
        "Kami mengisi celah yang dilewatkan pemain berbasis Jakarta: membangun ekosistem inovasi langsung dari komunitas — dengan dukungan ruang, pendanaan, mentorship, dan akses ke korporasi." ]
    },
    "portfolio": { "titlePart1": "JEJAK AKTI", "titlePart2": "VASI", "intro": "Cuplikan program, pelatihan, dan aktivasi komunitas yang telah kami jalankan bersama mitra." },
    "services": {
      "kicker": "CARA KAMI BEKERJA · OUR MODEL", "title": "Tiga lini yang saling menguatkan.",
      "cards": [
        { "no": "01", "title": "Advisory & Consulting", "who": "RUN", "body": "Dari perancangan program, pemetaan pemangku kepentingan, hingga monitoring & evaluasi dampak.", "target": "Untuk: Corporate CSR · BUMN · Pemda" },
        { "no": "02", "title": "Program & Event Execution", "who": "Selara · Neuverse · Gumregah", "body": "Eksekusi lapangan: pelatihan, event, kompetisi, inkubasi, dan aktivasi komunitas — multi-entitas, multi-segmen.", "target": "Untuk: Kemenparekraf · Komdigi · Pertamina" },
        { "no": "03", "title": "Community Platform", "who": "Digital Skill · UMKM · Mitra Tani · NGO", "body": "Komunitas aktif sebagai bukti jangkauan dan kepercayaan — dari digital skill, UMKM, hingga mitra tani.", "target": "Aset: diferensiasi & kredibilitas" } ],
      "differentiator": "Kami bermain di luar Jakarta. LINKAR menjadi anchor ekosistem di Yogyakarta, Jawa Tengah, dan Jawa Timur — celah yang dilewatkan pemain ibu kota."
    },
    "linkarStats": { "kicker": "LINKAR DALAM ANGKA", "items": [
      { "value": "6", "label": "Entitas dalam satu ekosistem" },
      { "value": "4", "label": "Komunitas aktif dibina" },
      { "value": "3", "label": "Provinsi wilayah kerja" },
      { "value": "20+", "label": "Aktivasi terlaksana" } ] },
    "industry": {
      "kicker": "KENAPA SEKARANG · THE OPPORTUNITY", "title": "Pasar yang besar, eksekutor yang masih langka.",
      "items": [
        { "value": "1.400", "label": "Ekonomi kreatif per tahun", "note": "IDR triliun · ±7–8% PDB · #3 dunia" },
        { "value": "15–20", "label": "Anggaran CSR korporat", "note": "IDR triliun · Pertamina, BRI, Mandiri, GoTo" },
        { "value": "64", "label": "UMKM menanti pendampingan", "note": "juta unit · kontribusi 60% PDB" } ],
      "closing": "Kebutuhan eksekusi program tersebar lintas kementerian, BUMN, dan CSR korporat — dan belum ada pemain dominan di luar Jakarta."
    },
    "commitments": { "title": "Komitmen Kami", "cards": [
      { "title": "Meningkatkan kualitas SDM", "body": "Melalui program dan jaringan kami, kami menambah jumlah anak muda dan dewasa yang memiliki keterampilan relevan — teknis maupun vokasional — untuk pekerjaan layak dan kewirausahaan." },
      { "title": "Mendampingi UMKM & wirausaha", "body": "Kami menjalankan program berorientasi pengembangan yang mendukung aktivitas produktif dan membantu wirausaha — termasuk anak muda dan kelompok rentan — mencapai pekerjaan yang produktif." },
      { "title": "Kolaborasi lintas pemangku kepentingan", "body": "Bersama universitas, industri, dan komunitas, kami mendorong inovasi dan meningkatkan kapabilitas teknologi sektor-sektor produktif di daerah." },
      { "title": "Kemitraan publik–swasta", "body": "Kami mendorong kemitraan publik, publik-swasta, dan masyarakat sipil yang efektif — membangun pengalaman dan strategi kolaborasi sebagaimana di Provinsi Jawa Tengah." } ] },
    "cta": { "title": "Mari membangun ekosistem dampak bersama.", "subEn": "Everyone can be everyone's gateway.", "subId": "Punya program CSR, pelatihan, atau inisiatif komunitas yang butuh eksekusi terukur? Ceritakan kebutuhan Anda.", "submitLabel": "Kirim Pesan →" }
  },
  "entities": [
    { "name": "RUN", "role": "Advisory & Consulting", "tagline": "Consulting · B2B/B2G", "logo": "/images/entities/run.png" },
    { "name": "Neuverse", "role": "Academy & Training", "tagline": "Education · Digital", "logo": "/images/entities/neuverse.png" },
    { "name": "Selara", "role": "Events & Program Execution", "tagline": "Execution · Creative", "logo": "/images/entities/selara.png" },
    { "name": "Gumregah", "role": "Community & UMKM", "tagline": "Community · Impact", "logo": "/images/entities/gumregah.png" },
    { "name": "HAN", "role": "Trade & Distribution", "tagline": "Komersial · Retail", "logo": "/images/entities/han.png" },
    { "name": "Artha", "role": "Finance & Capital", "tagline": "Pendanaan · Investasi", "logo": "/images/entities/artha.png" } ],
  "photos": [], "programs": [], "posts": []
}
```

(`photos` stays empty until Task 6 fills it after curation.)

- [ ] **Step 2: Write failing test `web/tests/content.test.ts`**:

```ts
import { describe, it, expect } from 'vitest';
import { getContent } from '../src/lib/content';

describe('content layer (seed fallback)', () => {
  it('returns approved hero copy from seed when no Sanity env', async () => {
    const c = await getContent();
    expect(c.home.hero.title).toBe('Menghubungkan komunitas, korporat, dan pemerintah dalam satu lingkar dampak.');
    expect(c.entities).toHaveLength(6);
    expect(c.programs).toHaveLength(0);
  });
});
```

`web/vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config';
export default defineConfig({ test: { environment: 'jsdom' } });
```

Add to `web/package.json` scripts: `"test": "vitest run"`. Run `npm test` → FAIL (content.ts missing).

- [ ] **Step 3: Implement `web/src/lib/content.ts`** — types from the Interfaces block above, plus:

```ts
import seed from '../content/seed.json';

export async function getContent(): Promise<SiteContent> {
  const projectId = import.meta.env?.SANITY_PROJECT_ID ?? process.env.SANITY_PROJECT_ID;
  if (projectId) {
    const { fetchFromSanity } = await import('./sanity');   // Task 13 implements; dynamic import keeps seed mode dependency-free
    return fetchFromSanity();
  }
  return seed as unknown as SiteContent;
}
```

Create stub `web/src/lib/sanity.ts` exporting `fetchFromSanity(): Promise<SiteContent>` that throws `new Error('Sanity not configured — implemented in Task 13')`.

- [ ] **Step 4: Run `npm test`** → PASS. **Step 5: Commit** — `git commit -am "feat: seed content and data layer with Sanity fallback"`

---

### Task 3: Navbar + Footer with auto-hide nav

**Files:**
- Create: `web/src/components/Navbar.astro`, `web/src/components/Footer.astro`, `web/tests/nav.test.ts`, `web/src/lib/nav.ts`
- Modify: `web/src/pages/index.astro`

**Interfaces:**
- Consumes: `getContent()` from Task 2.
- Produces: `buildNavLinks(programCount: number, postCount: number): {href:string,label:string}[]` in `web/src/lib/nav.ts`; `<Navbar content={SiteContent} />`, `<Footer content={SiteContent} />`.

- [ ] **Step 1: Failing test `web/tests/nav.test.ts`**:

```ts
import { describe, it, expect } from 'vitest';
import { buildNavLinks } from '../src/lib/nav';

describe('auto-hide nav', () => {
  it('hides Program & Blog when collections are empty', () => {
    const labels = buildNavLinks(0, 0).map(l => l.label);
    expect(labels).toEqual(['Tentang', 'Layanan', 'Portofolio', 'Ekosistem', 'Kontak']);
  });
  it('shows them when content exists', () => {
    const labels = buildNavLinks(2, 1).map(l => l.label);
    expect(labels).toContain('Program'); expect(labels).toContain('Blog');
  });
});
```

Run → FAIL.

- [ ] **Step 2: Implement `web/src/lib/nav.ts`**:

```ts
export function buildNavLinks(programCount: number, postCount: number) {
  const links = [
    { href: '/#about', label: 'Tentang' },
    { href: '/#services', label: 'Layanan' },
    { href: '/#portfolio', label: 'Portofolio' },
    { href: '/#ecosystem', label: 'Ekosistem' },
  ];
  if (programCount > 0) links.push({ href: '/program', label: 'Program' });
  if (postCount > 0) links.push({ href: '/blog', label: 'Blog' });
  links.push({ href: '/#contact', label: 'Kontak' });
  return links;
}
```

Run `npm test` → PASS.

- [ ] **Step 3: Build `Navbar.astro`** — sticky header: text wordmark `LINK<b class="accent">AR</b>` + orange ring dot (logo pending), links from `buildNavLinks(content.programs.length, content.posts.length)`, orange CTA button (`content.settings.ctaLabel`) → `#contact`, hamburger under 900px (checkbox toggle, no JS dependency). Shrinks on scroll via `.is-scrolled` class (added in animations.js later; style now: `header{transition:padding .3s}`).

- [ ] **Step 4: Build `Footer.astro`** — big italic tagline (`settings.footerTagline`), 4 columns (Navigasi = same buildNavLinks; Layanan = 3 service card titles; Entitas = `content.entities` names+roles; Kontak = formEmail), copyright line `© 2026 CV Rantai Usaha Nusantara · LINKAR — Ecosystem Enabler`. Background `#070c1d`.

- [ ] **Step 5: Wire into `index.astro`** (fetch content once, pass down), `npm run build` → exit 0. Start preview (`npm run dev`) and screenshot-check navbar/footer render.

- [ ] **Step 6: Commit** — `git commit -am "feat: navbar with auto-hide Program/Blog links, footer"`

---

### Task 4: GSAP animation engine + Hero section

**Files:**
- Create: `web/src/scripts/animations.js` (replace empty stub), `web/src/components/Hero.astro`
- Modify: `web/src/pages/index.astro`

**Interfaces:**
- Produces (declarative animation API used by ALL later sections):
  - `data-reveal` — fade+rise 26px. Optional `data-reveal="pop"` (scale 0→1), `data-reveal="line"` (scaleY 0→1, transform-origin top).
  - `data-stagger` on a parent — children reveal sequentially (0.12s apart).
  - `data-split` — SplitText words, masked rise.
  - `data-odometer data-value="1.400" data-suffix="+"` — hooked in Task 10 (engine exposes `window.__linkarOdometer` registration point; Task 10 fills it).
  - `.marquee > .marquee-track` — infinite loop (Task 5 uses it).

- [ ] **Step 1: Implement `web/src/scripts/animations.js`**:

```js
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

const motionOK = window.matchMedia('(prefers-reduced-motion: no-preference)').matches;

if (motionOK) {
  gsap.registerPlugin(ScrollTrigger, SplitText);

  // reveals
  document.querySelectorAll('[data-reveal]').forEach(el => {
    const kind = el.getAttribute('data-reveal');
    const from = kind === 'pop' ? { scale: 0, opacity: 0 }
               : kind === 'line' ? { scaleY: 0, transformOrigin: 'top', opacity: 1 }
               : { y: 26, opacity: 0 };
    gsap.from(el, { ...from, duration: .8, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 85%' } });
  });

  // staggered children
  document.querySelectorAll('[data-stagger]').forEach(parent => {
    gsap.from(parent.children, { y: 30, opacity: 0, duration: .7, ease: 'power3.out', stagger: .12,
      scrollTrigger: { trigger: parent, start: 'top 82%' } });
  });

  // split-text headings
  document.querySelectorAll('[data-split]').forEach(el => {
    const split = new SplitText(el, { type: 'words', mask: 'words' });
    gsap.from(split.words, { yPercent: 110, duration: .9, ease: 'power4.out', stagger: .06,
      scrollTrigger: { trigger: el, start: 'top 85%' } });
  });

  // marquee loops
  document.querySelectorAll('.marquee .marquee-track').forEach(track => {
    const tween = gsap.to(track, { xPercent: -50, ease: 'none', duration: 28, repeat: -1 });
    track.closest('.marquee').addEventListener('mouseenter', () => tween.pause());
    track.closest('.marquee').addEventListener('mouseleave', () => tween.play());
  });

  // navbar shrink
  const header = document.querySelector('header');
  if (header) ScrollTrigger.create({ start: 60, onEnter: () => header.classList.add('is-scrolled'), onLeaveBack: () => header.classList.remove('is-scrolled') });

  // odometers register later (Task 10)
  if (window.__linkarOdometer) window.__linkarOdometer(gsap, ScrollTrigger);
}
```

- [ ] **Step 2: Build `Hero.astro`** — full-viewport dark section: kicker badge (`data-reveal="pop"`), `<h1 data-split>` with `highlight` word wrapped `<span class="accent">` (orange), sub (EN italic orange + ID muted, `data-reveal`), two buttons, mini-stats row (`data-stagger`). Background: navy with a subtle radial orange glow (`background:radial-gradient(60% 50% at 80% 10%, rgba(242,106,33,.15), transparent)` layered on `--navy`). Spec §4 requires a duotone hero photo — the photos only exist after Task 6, so build the hero now with an empty `.hero-photo` panel (right side ≥1000px, hidden below; duotone CSS pattern from Task 7) and fill its `src` in Task 6.

- [ ] **Step 3: Verify** — `npm run build` → exit 0; preview: hero words rise in sequence, badge pops, reduced-motion (emulate via preview device settings) shows content instantly with no motion.

- [ ] **Step 4: Commit** — `git commit -am "feat: GSAP animation engine and hero section"`

---

### Task 5: Entity logo assets + ecosystem marquee

**Files:**
- Create: `web/public/images/entities/{run,neuverse,selara,gumregah,han,artha}.png`, `web/src/components/EntityMarquee.astro`, `web/scripts/prep-logos.mjs`
- Modify: `web/src/pages/index.astro`

**Interfaces:**
- Consumes: `content.entities` (Task 2), `.marquee` engine (Task 4).

- [ ] **Step 1: Extract logos from the zip** — source `D:\RUN PROJECT\LINKAR\Linkar\Logo - Company RBL-20260704T075121Z-3-001.zip`, entries:
  - RUN: `Logo - Company RBL/RUN/RUN_Logo.png`
  - Neuverse: `Logo - Company RBL/NEUverse/NEUverse_Logo2.png`
  - Selara: `Logo - Company RBL/Selara/IMG_5523.PNG`
  - Gumregah: `Logo - Company RBL/Gumregah/GUMREGAHAgri_Logo (ICON).png`
  - HAN: `Logo - Company RBL/Exsiting Brand/HAN/IMG_5786.PNG` (inspect all IMG_578x.PNG, pick the cleanest logo-on-transparent/white)
  - Artha: `Logo - Company RBL/Multi Agency/Artha id/Arthaid_Logo (LANDSCAPE).png`

  Extract with PowerShell `System.IO.Compression`, save originals to `D:\RUN PROJECT\LINKAR\assets\entities\`, then run `web/scripts/prep-logos.mjs` (sharp): trim whitespace, resize to max 480px wide, output PNG into `web/public/images/entities/` with the seed.json filenames. View each output image to confirm it is the right logo and not clipped.

- [ ] **Step 2: Build `EntityMarquee.astro`** — kicker + title (`data-split`), then:

```html
<div class="marquee" aria-label="Entitas ekosistem LINKAR">
  <div class="marquee-track">
    {[...entities, ...entities].map(e => (
      <figure class="chip" title={e.role}>
        <img src={e.logo} alt={`Logo ${e.name}`} loading="lazy" />
        <figcaption><b>{e.name}</b><span>{e.role}</span></figcaption>
      </figure>
    ))}
  </div>
</div>
```

CSS: `.marquee{overflow:hidden;mask-image:linear-gradient(90deg,transparent,#000 8%,#000 92%,transparent)}` `.marquee-track{display:flex;gap:18px;width:max-content}` `.chip{display:flex;align-items:center;gap:14px;background:#fff;border-radius:14px;padding:14px 22px;min-width:220px}` (white chips = original-color logos stay legible on navy; caption dark ink). Duplicated array + `xPercent:-50` loop = seamless.

- [ ] **Step 3: Verify** — build + preview: marquee scrolls continuously, pauses on hover, all 6 logos visible & crisp. **Step 4: Commit** — `git commit -am "feat: entity ecosystem marquee with prepared logos"`

---

### Task 6: Portfolio photo curation + compression

**Files:**
- Create: `web/scripts/prep-photos.mjs`, `web/public/images/portfolio/*.jpg` (10 curated), update `web/src/content/seed.json` `photos` array

**Interfaces:**
- Produces: `content.photos: Photo[]` with 10 items, ≥5 `featured:true` (expandable gallery pulls featured; heading strip uses first 4 featured).

- [ ] **Step 1: Extract all 22 JPEGs** from `D:\RUN PROJECT\LINKAR\Linkar\Portofolio Arc-20260704T075126Z-3-001.zip` to `D:\RUN PROJECT\LINKAR\assets\portfolio\` (skip the 6 .mp4 — out of scope per spec §11).

- [ ] **Step 2: View every photo and curate 10** — selection criteria: (a) shows group activity/training/event over solo shots, (b) sharp & well-lit, (c) variety of settings (indoor meeting, event stage, community). Name outputs descriptively: `aktivasi-01.jpg` … `aktivasi-10.jpg`. Record a caption (program name guess from visual context — e.g. "Rapat koordinasi ekosistem", "Buka bersama manajemen RUN & HAN") for each; captions are editable in CMS later.

- [ ] **Step 3: `web/scripts/prep-photos.mjs`** — sharp: auto-rotate (EXIF), resize width 1600 (fit inside), JPEG q75 progressive, strip metadata → `web/public/images/portfolio/`. Verify each output < 350KB (`Get-ChildItem web/public/images/portfolio | Sort Length`).

- [ ] **Step 4: Fill `seed.json` `photos`** — 10 entries `{ "src": "/images/portfolio/aktivasi-01.jpg", "alt": "<caption>", "program": "<caption>", "featured": true|false }` (exactly 5 featured). `npm test` still PASS (content contract unchanged).

- [ ] **Step 5: Fill hero photo** — set the Task 4 `.hero-photo` panel `src` to the strongest curated photo (group activity, landscape orientation), duotone treatment, `data-reveal`. Verify in preview.

- [ ] **Step 6: Commit** — `git commit -am "feat: curated and compressed portfolio photos, hero photo"`

---

### Task 7: About section + expandable gallery

**Files:**
- Create: `web/src/components/About.astro`, `web/src/components/ExpandableGallery.astro`, `web/src/scripts/gallery.js`
- Modify: `web/src/pages/index.astro`, `web/src/layouts/Base.astro` (load gallery.js)

**Interfaces:**
- Consumes: `content.home.about`, `content.photos.filter(p => p.featured)` (5 photos).

- [ ] **Step 1: `ExpandableGallery.astro`** markup + CSS (the duotone + flex-expand mechanic, complete):

```html
<div class="xgallery" data-reveal>
  {photos.map((p, i) => (
    <button class="xitem" aria-expanded={i === 0 ? 'true' : 'false'} aria-label={p.program}>
      <img src={p.src} alt={p.alt} loading="lazy" />
      <span class="duo" aria-hidden="true"></span>
      <span class="cap">{p.program}</span>
    </button>
  ))}
</div>
```

```css
.xgallery{display:flex;gap:10px;height:380px;margin-top:40px}
.xitem{position:relative;flex:1;border:0;padding:0;border-radius:var(--radius);overflow:hidden;cursor:pointer;background:var(--navy-panel);transition:flex .5s cubic-bezier(.4,0,.2,1)}
.xitem img{width:100%;height:100%;object-fit:cover;filter:grayscale(1) contrast(1.05) brightness(.9);transition:filter .5s}
.xitem .duo{position:absolute;inset:0;background:var(--navy-logo);mix-blend-mode:color;transition:opacity .5s}
.xitem .cap{position:absolute;left:14px;right:14px;bottom:12px;color:#fff;font-weight:600;font-size:.85rem;opacity:0;transform:translateY(8px);transition:opacity .35s .15s,transform .35s .15s;text-shadow:0 1px 8px rgba(0,0,0,.6)}
.xitem[aria-expanded="true"],.xitem:hover,.xitem:focus-visible{flex:3}
.xitem[aria-expanded="true"] img,.xitem:hover img,.xitem:focus-visible img{filter:none}
.xitem[aria-expanded="true"] .duo,.xitem:hover .duo,.xitem:focus-visible .duo{opacity:0}
.xitem[aria-expanded="true"] .cap,.xitem:hover .cap,.xitem:focus-visible .cap{opacity:1;transform:none}
@media (max-width:700px){.xgallery{flex-direction:column;height:auto}.xitem{height:64px;flex:none;transition:height .5s}.xitem[aria-expanded="true"]{height:300px}}
@media (prefers-reduced-motion: reduce){.xitem,.xitem img,.xitem .duo,.xitem .cap{transition:none}}
```

- [ ] **Step 2: `web/src/scripts/gallery.js`** — tap-to-expand for touch + keyboard (one expanded at a time):

```js
document.querySelectorAll('.xgallery').forEach(g => {
  const items = [...g.querySelectorAll('.xitem')];
  const expand = target => items.forEach(el => el.setAttribute('aria-expanded', String(el === target)));
  items.forEach(el => {
    el.addEventListener('click', () => expand(el));
    el.addEventListener('focus', () => expand(el));
  });
});
```

- [ ] **Step 3: `About.astro`** — two-column ≥900px (text left: kicker, `<h2 data-split>`, paragraphs each `data-reveal`; full-width gallery below spanning both columns). Wire into index. Section id `about`.

- [ ] **Step 4: Verify** — preview: hover expands with color reveal + caption; tab key walks items; mobile viewport (preview resize 375px) stacks vertically with tap-expand. **Step 5: Commit** — `git commit -am "feat: about section with expandable duotone gallery"`

---

### Task 8: Portfolio section — split giant heading + grid + lightbox

**Files:**
- Create: `web/src/components/PortfolioSection.astro`, `web/src/scripts/lightbox.js`
- Modify: `web/src/pages/index.astro`, `web/src/layouts/Base.astro` (load lightbox.js)

**Interfaces:**
- Consumes: `content.home.portfolio` (titlePart1/titlePart2/intro), all `content.photos`.

- [ ] **Step 1: Giant split heading** — light section (`.section--light`, id `portfolio`):

```html
<h2 class="giant" aria-label={`${p.titlePart1}${p.titlePart2}`}>
  <span data-split aria-hidden="true">{p.titlePart1}</span>
  <span class="strip" aria-hidden="true">
    {featured.slice(0,4).map((ph, i) => <img src={ph.src} alt="" class={`s${i}`} />)}
  </span>
  <span data-split aria-hidden="true">{p.titlePart2}</span>
</h2>
```

CSS: `.giant{display:flex;align-items:center;justify-content:center;gap:.05em;font-size:clamp(3rem,11vw,9rem);color:var(--ink);text-transform:uppercase;letter-spacing:-.03em}` `.strip{width:1.6em;height:.72em;border-radius:.18em;overflow:hidden;position:relative;flex:none}` `.strip img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}`. Image cycling (GSAP, add to animations.js): every 1.6s crossfade to next img (`gsap.timeline({repeat:-1})` fading `.strip img` opacity in sequence).

- [ ] **Step 2: Grid** — CSS masonry-ish `columns: 4 240px; column-gap:14px` with `.gitem{break-inside:avoid;margin-bottom:14px;border-radius:12px;overflow:hidden;cursor:zoom-in}`, duotone treatment (same filter pattern as Task 7, hover reveals color), `data-stagger` on grid parent. Each `.gitem` is `<button data-lb-index={i}>` wrapping img + caption overlay.

- [ ] **Step 3: `web/src/scripts/lightbox.js`** — single `<dialog id="lb">` appended to body: shows photo `photos[i]` (reads from `data-lb-src`/`data-lb-cap` attributes on buttons), prev/next buttons + ArrowLeft/ArrowRight + Escape, counter "3 / 10", click-outside closes. Native `<dialog>` gives focus trap free. Complete implementation (~50 lines vanilla).

- [ ] **Step 4: Verify** — preview: heading strip cycles photos, grid staggers in, lightbox opens/navigates/closes with keyboard. Light-band contrast: ink text on `#fafafa`. **Step 5: Commit** — `git commit -am "feat: portfolio section with split heading and lightbox"`

---

### Task 9: Services + Commitments sections

**Files:**
- Create: `web/src/components/Services.astro`, `web/src/components/Commitments.astro`
- Modify: `web/src/pages/index.astro`

**Interfaces:**
- Consumes: `content.home.services`, `content.home.commitments`.

- [ ] **Step 1: `Services.astro`** (dark, id `services`) — kicker + `<h2 data-split>`; 3 cards in grid (`data-stagger`): orange number chip `.no`, title, `.who` (orange, small caps), body, `.target` pill (panel navy). Card: `background:var(--navy-panel);border:1px solid rgba(255,255,255,.07);border-radius:var(--radius);padding:32px`, hover lift `translateY(-5px)` + orange border-glow. Left edge accent: `.no` chip only (no full-height stripe — avoid template-y edge bars). Differentiator: full-width panel below with `data-reveal="line"` vertical orange rule + bold first sentence.

- [ ] **Step 2: `Commitments.astro`** (light `.section--light`, id `commitment`) — "Komitmen Kami" + 2×2 grid (`data-stagger`) of cards: big ghost number `01–04` (`color:rgba(19,24,43,.12);font-size:2.2rem;font-weight:800`), title, body. 1 column <900px.

- [ ] **Step 3: Verify** build + preview (cards stagger, differentiator line grows). **Step 4: Commit** — `git commit -am "feat: services and commitments sections"`

---

### Task 10: Odometer engine + both stats sections

**Files:**
- Create: `web/src/components/Odometer.astro`, `web/src/components/StatsLinkar.astro`, `web/src/components/IndustryStats.astro`, `web/src/scripts/odometer.js`, `web/tests/odometer.test.ts`
- Modify: `web/src/pages/index.astro`, `web/src/layouts/Base.astro` (load odometer.js before animations.js)

**Interfaces:**
- Consumes: `content.home.linkarStats`, `content.home.industry`; engine hook `window.__linkarOdometer` (Task 4).
- Produces: `buildOdometer(el: HTMLElement): void` — reads `el.dataset.value`, replaces content with per-character columns; exported for tests.

- [ ] **Step 1: Failing test `web/tests/odometer.test.ts`**:

```ts
import { describe, it, expect } from 'vitest';
import { buildOdometer } from '../src/scripts/odometer';

describe('odometer builder', () => {
  it('builds a digit column per numeral and static spans for others', () => {
    const el = document.createElement('div');
    el.dataset.value = '1.400';
    buildOdometer(el);
    expect(el.querySelectorAll('.od-col')).toHaveLength(4);      // 1,4,0,0
    expect(el.querySelectorAll('.od-static')).toHaveLength(1);   // "."
    const firstCol = el.querySelector('.od-col')!;
    expect(firstCol.querySelectorAll('.od-digit')).toHaveLength(10);
    expect(firstCol.getAttribute('data-target')).toBe('1');
  });
  it('keeps suffix like + static', () => {
    const el = document.createElement('div');
    el.dataset.value = '20+';
    buildOdometer(el);
    expect(el.querySelectorAll('.od-col')).toHaveLength(2);
    expect(el.querySelector('.od-static')!.textContent).toBe('+');
  });
});
```

Run → FAIL.

- [ ] **Step 2: Implement `web/src/scripts/odometer.js`**:

```js
export function buildOdometer(el) {
  const value = el.dataset.value ?? '';
  el.setAttribute('aria-label', value + (el.dataset.suffix ?? ''));
  el.innerHTML = '';
  for (const ch of value) {
    if (/\d/.test(ch)) {
      const col = document.createElement('span');
      col.className = 'od-col'; col.dataset.target = ch; col.setAttribute('aria-hidden', 'true');
      for (let d = 0; d <= 9; d++) {
        const s = document.createElement('span');
        s.className = 'od-digit'; s.textContent = String(d); col.appendChild(s);
      }
      el.appendChild(col);
    } else {
      const s = document.createElement('span');
      s.className = 'od-static'; s.textContent = ch; s.setAttribute('aria-hidden', 'true');
      el.appendChild(s);
    }
  }
  if (el.dataset.suffix) {
    const s = document.createElement('span');
    s.className = 'od-static'; s.textContent = el.dataset.suffix; s.setAttribute('aria-hidden', 'true');
    el.appendChild(s);
  }
}

// browser wiring: build all + register scroll animation with the engine
if (typeof window !== 'undefined') {
  const els = [...document.querySelectorAll('[data-odometer]')];
  els.forEach(buildOdometer);
  window.__linkarOdometer = (gsap, ScrollTrigger) => {
    els.forEach(el => {
      el.querySelectorAll('.od-col').forEach((col, i) => {
        gsap.fromTo(col, { yPercent: -900 }, {                      // start showing "9", roll down to target
          yPercent: -100 * Number(col.dataset.target),
          duration: 1.6, delay: i * .08, ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 85%' } });
      });
    });
  };
}
```

CSS (global.css): `.od-col{display:inline-flex;flex-direction:column;height:1em;overflow:hidden;line-height:1} .od-col{overflow:hidden} [data-odometer]{display:inline-flex;overflow:hidden;height:1em;line-height:1} .od-digit{height:1em}`. Reduced-motion: engine never calls the hook, so columns need a no-JS-safe resting state — set initial `transform: translateY(calc(-1em * var(--t)))` via inline style in `buildOdometer` (`col.style.transform = \`translateY(${-Number(ch)}em)\``) so the correct digit shows even without animation; GSAP overrides from -900%.

Run `npm test` → PASS.

- [ ] **Step 3: `Odometer.astro`** — `<span class="big" data-odometer data-value={stat.value}>{stat.value}</span>` (server renders plain value as fallback; script rebuilds). Suffixes like `+` are embedded in `stat.value` ("20+") and rendered static by the builder; the separate `data-suffix` attribute stays an engine capability but is unused by seed data. `StatsLinkar.astro` (dark, id `stats`): kicker + 4 stats row, orange `.big` numbers `font-size:clamp(2.6rem,6vw,4rem)`. `IndustryStats.astro` (dark, id `opportunity`): kicker, `<h2 data-split>`, 3 large stat blocks with `note` small text, closing paragraph `data-reveal` italic.

- [ ] **Step 4: Verify** — preview: digits roll on scroll into view, correct final values (6, 4, 3, 20+, 1.400, 15–20, 64); with reduced-motion emulation values are correct and static. **Step 5: Commit** — `git commit -am "feat: odometer stats sections"`

---

### Task 11: Contact CTA + Web3Forms

**Files:**
- Create: `web/src/components/ContactCta.astro`, `web/src/scripts/form.js`, `web/tests/form.test.ts`
- Modify: `web/src/pages/index.astro`, `web/src/layouts/Base.astro` (load form.js)

**Interfaces:**
- Consumes: `content.home.cta`, `content.settings.formEmail`; env `PUBLIC_WEB3FORMS_KEY`.
- Produces: `validateForm(data: {name:string,org:string,email:string,wa:string,need:string}): string[]` (list of error field names) in form.js, exported for tests.

- [ ] **Step 1: Failing test `web/tests/form.test.ts`**:

```ts
import { describe, it, expect } from 'vitest';
import { validateForm } from '../src/scripts/form';

describe('contact form validation', () => {
  it('flags empty required fields and bad email', () => {
    expect(validateForm({ name: '', org: 'X', email: 'not-email', wa: '08', need: '' }))
      .toEqual(['name', 'email', 'need']);
  });
  it('passes a valid submission', () => {
    expect(validateForm({ name: 'Budi', org: 'Pemda DIY', email: 'budi@jogja.go.id', wa: '0812345', need: 'Pelatihan UMKM' })).toEqual([]);
  });
});
```

Run → FAIL.

- [ ] **Step 2: Implement `web/src/scripts/form.js`**:

```js
export function validateForm(d) {
  const errors = [];
  if (!d.name?.trim()) errors.push('name');
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(d.email ?? '')) errors.push('email');
  if (!d.need?.trim()) errors.push('need');
  return errors;   // org & wa optional
}

if (typeof window !== 'undefined') {
  const form = document.getElementById('contact-form');
  form?.addEventListener('submit', async e => {
    e.preventDefault();
    const fd = new FormData(form);
    if (fd.get('botcheck')) return;                       // honeypot
    const data = Object.fromEntries(fd.entries());
    const errors = validateForm(data);
    form.querySelectorAll('.err').forEach(el => el.classList.remove('err'));
    if (errors.length) { errors.forEach(n => form.querySelector(`[name=${n}]`)?.classList.add('err')); return; }
    const status = form.querySelector('.form-status');
    status.textContent = 'Mengirim…';
    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ access_key: form.dataset.key, subject: 'Kolaborasi baru dari situs LINKAR', ...data })
      });
      status.textContent = res.ok ? 'Terima kasih! Pesan Anda sudah kami terima — tim LINKAR akan segera menghubungi Anda.' : 'Maaf, terjadi kendala. Silakan coba lagi.';
      if (res.ok) form.reset();
    } catch { status.textContent = 'Maaf, terjadi kendala jaringan. Silakan coba lagi.'; }
  });
}
```

`npm test` → PASS.

- [ ] **Step 3: `ContactCta.astro`** (dark, id `contact`) — title `data-split`, EN accent line orange italic, sub; form: fields Nama*, Instansi/Perusahaan, Email*, No. WhatsApp, Kebutuhan* (textarea) + hidden `botcheck` input (`style="display:none"` with `tabindex="-1" autocomplete="off"`), `data-key={import.meta.env.PUBLIC_WEB3FORMS_KEY ?? ''}`, submit `.btn-primary` = `cta.submitLabel`, `<p class="form-status" role="status" aria-live="polite">`. Inputs: panel navy background, 1px `rgba(255,255,255,.12)` border, orange focus ring; `.err{border-color:#ff5d2b}`.

- [ ] **Step 4: Verify** — build + preview: empty submit marks fields red without network call; with a temporary test key in `.env` (skip if none — verify request fires in preview network log and is well-formed). **Step 5: Commit** — `git commit -am "feat: contact CTA with Web3Forms integration"`

---

### Task 12: SEO, OG image, favicon, sitemap + full-page audit

**Files:**
- Create: `web/public/favicon.svg`, `web/public/og.png`, `web/astro.config.mjs` (modify), `web/src/layouts/Base.astro` (modify)

- [ ] **Step 1: Favicon** — `web/public/favicon.svg`: orange ring on navy rounded square (temporary mark; swap when logo file arrives):

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#0a1128"/><circle cx="32" cy="32" r="14" fill="none" stroke="#F26A21" stroke-width="8"/></svg>
```

- [ ] **Step 2: OG image** — build a 1200×630 HTML card (navy bg, orange ring mark, "LINKAR — Ecosystem Enabler", tagline, "Yogyakarta · Jawa Tengah · Jawa Timur"), screenshot it via the preview tool at exactly 1200×630, save `web/public/og.png`.

- [ ] **Step 3: Meta** — in `Base.astro` head: canonical, `og:title/description/image/type/locale(id_ID)`, `twitter:card=summary_large_image`, favicon link. Install `@astrojs/sitemap`, set `site` in astro.config (env `PUBLIC_SITE_URL`, default `https://linkar.vercel.app` — update after deploy).

- [ ] **Step 4: Full-page audit** — preview at 1440/768/375 widths. Section rhythm must be exactly: Hero(dark) → Marquee(dark) → About(dark) → **Portfolio(light)** → Services(dark) → StatsLinkar(dark) → Industry(dark) → **Commitments(light)** → CTA(dark) → Footer(darkest). Check: no horizontal scroll at any width, nav anchors land correctly with sticky-header offset (`scroll-margin-top:90px` on sections), all images have alt, single h1 with correct h2 hierarchy.
- [ ] **Step 5: Run `npm run build && npm test`** → both pass. **Step 6: Commit** — `git commit -am "feat: SEO meta, OG image, sitemap, favicon"`

---

### Task 13: Sanity Studio schemas

**Files:**
- Create: `studio/package.json`, `studio/sanity.config.ts`, `studio/sanity.cli.ts`, `studio/schemaTypes/{index,siteSettings,homePage,entity,activationPhoto,program,post}.ts`

**Interfaces:**
- Produces: schema type names `siteSettings`, `homePage`, `entity`, `activationPhoto`, `program`, `post` — GROQ queries in Task 14 depend on these exact names and field names below.

- [ ] **Step 1: Scaffold studio** — `npm create sanity@latest -- --template clean --typescript --output-path studio --project-plan free` requires login; INSTEAD create files manually (no login needed to write code): `studio/package.json` with `sanity@^4`, `react`, `react-dom`, `styled-components`; `sanity.config.ts` reading `SANITY_STUDIO_PROJECT_ID` env; `npm install` in `studio/`.

- [ ] **Step 2: Write schemas** — field names MUST match the `SiteContent` contract (Task 2). Key rules:
  - `homePage` & `siteSettings`: singletons (use `__experimental_actions`/document lists pinned by ID `homePage`/`siteSettings` in structure config).
  - Every text field: `validation: Rule => Rule.max(N)` + Indonesian `description` guidance. Limits: hero.title 90, hero.subId 220, about.title 90, paragraphs 300 each, portfolio.titlePart1/titlePart2 12 each, services.card.body 200, differentiator 220, cta.title 60, stat.label 40, stat.value 8.
  - `entity`: name, logo (image), role, tagline, `orderRank` (drag-order via `orderings`).
  - `activationPhoto`: image with `options:{hotspot:true}`, caption (=alt), program, featured (boolean), orderRank.
  - `program`: title, slug (from title), partner, period, location, summary (300), body (array of blocks + image), cover (hotspot), gallery (array of image), impact (array of {value,label}), entities (array of reference→entity).
  - `post`: title, slug, excerpt (200), cover, body (blocks+image), author, date (datetime), tags (array of string).

- [ ] **Step 3: Typecheck** — `cd studio; npx tsc --noEmit` → 0 errors (studio can't run without project ID; that's Task 14). **Step 4: Commit** — `git commit -am "feat: Sanity studio schemas with content guardrails"`

---

### Task 14: 🧑 USER CHECKPOINT — Sanity project + wiring + seeding

**Files:**
- Modify: `web/src/lib/sanity.ts` (real implementation), `web/.env` (user), `studio/.env` (user)
- Create: `studio/scripts/seed.mjs`

**Interfaces:**
- Consumes: schema names (Task 13), `SiteContent` contract (Task 2), seed.json + `web/public/images/*`.
- Produces: `fetchFromSanity(): Promise<SiteContent>` fully working; Sanity dataset populated to parity with seed.json.

- [ ] **Step 1: USER ACTION (pause and ask)** — user must: (1) create free account at sanity.io, (2) create project "LINKAR" + dataset `production` at sanity.io/manage, (3) provide Project ID, (4) create API token with Editor rights (Manage → API → Tokens) and provide it. Set `web/.env` (`SANITY_PROJECT_ID`, `SANITY_DATASET=production`), `studio/.env` (`SANITY_STUDIO_PROJECT_ID`), and `SANITY_WRITE_TOKEN` for the seed script only (never committed).

- [ ] **Step 2: Implement `web/src/lib/sanity.ts`** — `@sanity/client` (add dep to web) + `@sanity/image-url`; one GROQ round-trip:

```groq
{
  "settings": *[_id=="siteSettings"][0]{formEmail, footerTagline, ctaLabel},
  "home": *[_id=="homePage"][0]{...},
  "entities": *[_type=="entity"]|order(orderRank){name, role, tagline, "logo": logo.asset->url},
  "photos": *[_type=="activationPhoto"]|order(orderRank){"src": image.asset->url + "?w=1600&q=75&auto=format", "alt": caption, program, featured},
  "programs": *[_type=="program" && defined(slug.current)]{"slug": slug.current, title, partner, period, location, summary, body, "cover": cover.asset->url, impact, ...},
  "posts": *[_type=="post" && defined(slug.current)]|order(date desc){"slug": slug.current, title, excerpt, "cover": cover.asset->url, body, author, date}
}
```

Map result into `SiteContent` (portable-text body → HTML via `@portabletext/to-html` in the page templates, keep `body` as portable text array in the interface — ADJUST interface: `body: unknown` acceptable for both seed string and portable text; templates branch on type).

- [ ] **Step 3: `studio/scripts/seed.mjs`** — reads `web/src/content/seed.json`, uploads `web/public/images/entities/*` + `web/public/images/portfolio/*` as assets, creates `siteSettings`, `homePage`, 6 `entity`, 10 `activationPhoto` docs (idempotent: `createOrReplace` with deterministic `_id`s like `entity-run`). Run: `node studio/scripts/seed.mjs` with env vars. Verify in Studio (`cd studio; npm run dev`) all content appears.

- [ ] **Step 4: Verify parity** — `cd web; npm run build` (now hits Sanity); spot-check built HTML contains hero title and 6 entity names; `npm test` still PASS (tests run without env → seed path still covered).

- [ ] **Step 5: Deploy studio** — `cd studio; npx sanity deploy` (user picks hostname e.g. `linkar.sanity.studio`). Add CORS origin for the studio + localhost in sanity.io/manage.

- [ ] **Step 6: Commit** — `git commit -am "feat: Sanity client wiring and content seeding"`

---

### Task 15: Program & Blog page templates (hidden until content)

**Files:**
- Create: `web/src/pages/program/index.astro`, `web/src/pages/program/[slug].astro`, `web/src/pages/blog/index.astro`, `web/src/pages/blog/[slug].astro`, `web/src/components/ProgramCard.astro`, `web/src/components/PostCard.astro`

**Interfaces:**
- Consumes: `content.programs`, `content.posts`, `Odometer.astro`, `buildNavLinks` (already counts these), portable-text/body rendering from Task 14.

- [ ] **Step 1: Templates** — `/program`: header band + grid of `ProgramCard` (cover duotone-hover, title, partner, first impact stat). `/program/[slug]` via `getStaticPaths` from `content.programs`: hero band (cover, title, partner · period · location), impact stats row reusing `Odometer.astro`, body (string → `<p>` split on double newline; portable text → `@portabletext/to-html`), gallery grid reusing lightbox, CTA band at bottom. `/blog` + `/blog/[slug]`: same pattern, reading layout `max-width:720px`, date formatted `id-ID`.

- [ ] **Step 2: Test the templates with temporary content** — add ONE sample program + post to `seed.json`, `npm run build`, verify pages render + nav shows Program/Blog; THEN revert seed.json arrays to `[]`, rebuild, verify `/program/` returns 404 page and navbar hides links again. (Astro: when `getStaticPaths` returns empty, no pages are emitted — index pages should render a friendly "Belum ada konten" only if directly accessed… simpler: also emit index conditionally by redirecting to `/` when count is 0 via `Astro.redirect` in frontmatter of the index pages.)

- [ ] **Step 3: Run `npm test && npm run build`** → PASS. **Step 4: Commit** — `git commit -am "feat: program and blog templates with auto-hide"`

---

### Task 16: Deploy to Vercel + hooks + live verification

**Files:**
- Create: `web/vercel.json` (only if needed for headers), no code changes expected

- [ ] **Step 1: Deploy** — use the Vercel MCP connector (`deploy_to_vercel`) or `npx vercel --prod` from `web/`. Set env vars in Vercel project settings: `SANITY_PROJECT_ID`, `SANITY_DATASET`, `PUBLIC_WEB3FORMS_KEY`, `PUBLIC_SITE_URL`.
- [ ] **Step 2: USER ACTION — Web3Forms key**: user creates free key at web3forms.com with destination email → set `PUBLIC_WEB3FORMS_KEY` in Vercel + redeploy.
- [ ] **Step 3: Rebuild-on-publish** — create a Vercel Deploy Hook (project settings → Git → Deploy Hooks, name "sanity-publish"); in sanity.io/manage → API → Webhooks add POST to that URL on create/update/delete. Test: edit hero title in Studio → publish → site updates in ~1 min → revert.
- [ ] **Step 4: Live verification** — on the production URL: all 10 sections render, animations fire, form submits to email (send one real test), OG preview correct (share into WhatsApp), Lighthouse performance ≥ 90 mobile, `PUBLIC_SITE_URL` + sitemap resolve.
- [ ] **Step 5: Update `PUBLIC_SITE_URL`** to the real production URL, redeploy, final commit — `git commit -am "chore: production deployment configuration"`.
- [ ] **Step 6: Report to user**: live URL, Studio URL, how to edit content, what's pending (logo file swap, real `20+` activation number, custom domain `linkar.id`).

---

## Deferred / blocked items (tracked, not forgotten)

- **Logo integration**: when user drops file into `assets/brand/` → replace navbar/footer wordmark, favicon, OG mark. Small follow-up task.
- **Custom domain** `linkar.id`: user purchase → add in Vercel dashboard.
- **Real activation count** for "20+" stat: user edits in Studio.
- **Videos from portfolio zip**: out of scope (spec §11).
