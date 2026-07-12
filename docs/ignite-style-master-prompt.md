# MASTER PROMPT — Landing Page Sistem "IGNITE-style"

> **Cara pakai:** Salin seluruh blok prompt di bawah (mulai dari `## THE PROMPT`) ke AI website builder / Claude Code / Cursor.
> Ganti semua slot `[[...]]` dengan konten Anda sendiri (nama brand, teks, logo, foto, warna aksen bila ingin diubah).
> Hasil analisis: situs referensi dibangun di Webflow + kode kustom GSAP. Prompt ini mereplikasi **sistemnya** (arsitektur, animasi, efek, layout, timing) dalam bentuk situs statis mandiri (HTML/CSS/JS atau Astro) tanpa Webflow.
>
> **Catatan lisensi:** Font asli referensi adalah *Söhne Schmal Halbfett* (Klim) dan *PP Neue Montreal* (Pangram Pangram) — keduanya font komersial berbayar. Prompt memakai padanan gratis yang sangat mirip (Anton + Hanken Grotesk via Google Fonts). Jika Anda punya lisensinya, tinggal tukar `@font-face`. Jangan pakai file font, logo, foto, atau teks milik situs referensi.

---

## THE PROMPT

Build a complete, production-ready one-page marketing/landing website as a static site (vanilla HTML + CSS + JS, or Astro). It must implement EVERY system below exactly as specified — animations, timings, easings, and structure are non-negotiable; only the content inside `[[...]]` placeholders is mine.

### 0. Tech stack (mandatory)

- **GSAP 3.15+** with plugins: `ScrollTrigger`, `SplitText`, `CustomEase` (load from CDN).
- **Lenis** smooth scrolling (default settings), exposed as `window.lenis`; ScrollTrigger synced to it via `lenis.on('scroll', ScrollTrigger.update)` + `gsap.ticker`.
- **Matter.js** (2D physics) — lazy-loaded only when its section approaches viewport.
- A tiny **canvas confetti** implementation (no heavy lib needed).
- No jQuery. No CSS frameworks. Semantic HTML5.
- Register a global custom ease once: `CustomEase.create("main", "0.65, 0.01, 0.05, 0.99")` — use `"main"` as the default ease for entrance/menu animations.
- All decorative animations must respect `prefers-reduced-motion: reduce` (disable/skip them).

### 1. Design tokens (CSS custom properties on `:root`)

**Brand colors** (replace hexes with mine if provided, keep the token structure):
```css
--color-brand-red: #ff3454;      /* primary accent */
--color-brand-blue: #1043f9;     /* category accent 1 */
--color-brand-green: #34ff48;    /* category accent 2 */
--color-brand-purple: #e64aff;   /* category accent 3 */
--color-black: #000; --color-white: #fff;
--neutral-lightest: #eee; --neutral-lighter: #ccc; --neutral-light: #aaa;
--neutral: #666; --neutral-dark: #444; --neutral-darker: #222; --neutral-darkest: #111;
--error-red: #ff5c76; --success-green: #027a48;
```
Semantic aliases: `--bg-primary` (white), `--bg-secondary` (#eee), `--bg-alternate` (black), `--bg-accent` (red), `--text-primary` (black), `--text-alternate` (white), `--text-accent` (red).

**Spacing scale:** 0.125 / 0.25 / 0.5 / 0.75 / 1 / 1.25 / 1.5 / 1.75 / 2 / 2.5 / 3 / 3.5 / 4 / 5 / 6 / 7 / 8 / 9 / 10 rem.
**Section padding:** small = 3rem, medium = 5rem, large = 9rem, xlarge = 10rem (halve on mobile).
**Page gutter:** `--page-padding: 5vw` applied by a `.padding-global` utility.
**Containers:** small 48rem, medium 64rem, large 140rem (max-width, centered).
**Radius:** tiny .25rem, small .5rem, regular 1rem, medium 2rem, large 4rem, max 20rem (pill).
**Marquee gap:** `--marquee-gap: 3em`.

### 2. Typography system

```css
--font-heading: 'Anton', Impact, sans-serif;        /* condensed, heavy, ALL-CAPS display */
--font-body: 'Hanken Grotesk', sans-serif;           /* neutral grotesque, 400 & 500 */
```
- **Headings:** always `text-transform: uppercase`, `line-height: 0.85`, `letter-spacing: -0.01em`, font-weight 600. Headings are HUGE and dominate each section.
- **Body:** line-height 1.5–1.6, weights 400/500.
- **Fluid sizing with container-query units:** every big heading lives in a container (`container-type: inline-size`) and is sized with `cqw` + `clamp()`. Reference values:
  - Hero H1: `font-size: clamp(6rem, 44cqw, 8rem+)` region — the hero title should fill ~90% of the container width (multi-line, stacked words).
  - Giant marquee/section headings: `15–20cqw`.
  - H1 style: ~7.5–8rem desktop; H2 ~6rem; H3 ~5.5rem; subtitles ~1.25rem; body 1.125rem; small .875rem.
- Utility classes: `.text-style-subtitle` (small all-caps label with accent color), `.text-style-allcaps`, `.text-size-large` (1.25rem), `.no-kerning`.

### 3. Global systems (build these first)

#### 3.1 Preloader (first visit only)
Full-screen fixed white overlay, z-index above everything:
- Corner texts: four small all-caps labels pinned to the 4 corners ([[TAGLINE_WORDS – e.g. brand values or coordinates]]).
- **Number counter** bottom-right: animates 0 → 100 over 2s while scaling up 2× and sliding toward the right edge; when done, digits slide up out of a masked wrapper (`yPercent: 200`, 0.8s, power2.inOut).
- **Center logo mark** ([[LOGO_SVG – a bold, simple SVG mark]]): starts as a huge outlined shape (scaled ~30×, rotated 90°, stroke only) with ~25 stacked clones at increasing scale; all clones animate to `scale: 1, rotation: 0` (1.2s, power4.inOut, stagger amount 0.3) collapsing into one crisp mark; then it pops to 1.2× while filling with the accent red; then 8 clones burst diagonally outward (4 up-left, 4 down-right, `power4.out`, 0.8s, stagger 0.1) creating a "echo trail" of the mark; finally the mark's shape stretches horizontally to wipe across the viewport.
- Exit: the whole loader slides up (`yPercent: -100`, 0.5s, power2.inOut) revealing the page.
- Timeline defaults: `duration: 2.5, ease: "power4.inOut"`. Total ≈ 4s.
- **Session logic:** set a `sessionStorage` flag after first play. On internal navigation (referrer = same origin, different path) skip the loader entirely. On refresh (returning visitor same session) play only the short second half (from the red-fill label onward).

#### 3.2 Custom cursor
- A small round dot (`.cursor` fixed, `pointer-events: none`, `mix-blend-mode: difference` optional) with an accent-red background circle, following the mouse via `gsap.quickTo(x/y, { duration: 0.2, ease: "power4.out" })`.
- **Contextual labels:** any element with `data-cursor="some text"` makes the cursor expand into a pill showing that all-caps text (e.g. `data-cursor="visit page"`, `data-cursor="edit!"`). Elements with `data-cursor-hide` hide the custom cursor while hovered.
- In specific sections the cursor can carry a small image + caption (`.cursor-content`: image on top, all-caps label under it) that follows with slightly softer smoothing (0.3s, power3.out).
- Hide entirely on touch devices; never block clicks.

#### 3.3 Navigation bar + full-screen menu
- **Navbar:** fixed top, transparent, contains logo (left) and right side: a pill CTA button + a "menu" text-button. Hide on scroll down / reveal on scroll up by tweening `yPercent` with `gsap.quickTo`.
- **Theme swapping:** invisible sentinel divs (`data-nav-theme="light|dark"`) placed at section boundaries; when one crosses the navbar line, the navbar swaps between dark-on-light and light-on-dark styling (transition ~0.3s). Every section declares which nav theme it needs.
- **Full-screen overlay menu**, opened by the menu button:
  - Structure: dark overlay + 3 full-height background panels (first panel accent-red, second white/neutral, third black) + menu content (4–6 huge nav links in heading font, small "extras" columns: contact info + socials, bottom row of fine print).
  - **Open timeline:** menu button label rolls up (`yPercent: -100`, stagger 0.2 between the two stacked labels "menu"/"close"); overlay fades in; panels slide in from the right `xPercent: 101 → 0`, `stagger 0.12`, `duration 0.575`, ease `"main"`; nav links rise from `yPercent: 140, rotation: 10°, transformOrigin: left bottom` to normal, `stagger 0.05`, starting `0.35s` after panels; extras fade up (`yPercent: 50 → 0`, stagger 0.04) `0.2s` later; finally a small logo-mark flourish is revealed.
  - Close reverses quickly. While open: `lenis.stop()`, body overflow hidden, `Escape` closes, focus is trapped and restored — full a11y (aria-hidden, tabindex management).

#### 3.4 Text reveal system (SplitText)
Three reusable patterns, auto-applied by data attributes:
1. `data-split="lines"` — split into masked lines; lines start `y: 100%, opacity: 0`; on scroll into view animate up per line with small stagger (ease "main").
2. `data-split="chars"` — split words+chars with word masks; chars rise/rotate in with tight stagger — used for big headings.
3. `data-scrub` — split into chars; chars start `opacity: 0.2` and brighten to 1 progressively, scrubbed to scroll position — used for long statement paragraphs.
Use `mask: "words"|"lines"` (SplitText 3.13+) so nothing bleeds outside. Re-split on resize (`autoSplit: true`).

#### 3.5 Marquee system (data-attribute driven)
Generic component: `data-marquee` wrapper with `data-marquee-speed` (seconds per loop), `data-marquee-direction="left|right"`, and `data-marquee-duplicate="4"` (content cloned N times for seamless loop). Implementation: `gsap.to(track, { xPercent: -100, repeat: -1, ease: "linear" })`.
**Scroll-reactive:** a ScrollTrigger (start "top bottom" / end "bottom top") watches scroll direction and **inverts the marquee direction** to match scrolling down vs up, and optionally adds a scrub-based extra x-offset so the marquee "scrubs" faster while scrolling. Edge fade masks (CSS mask-image linear-gradient) on logo marquees.

#### 3.6 Buttons
- **Pill button:** border 1px currentColor, radius 20rem, uppercase text + arrow icon. Hover: background fills black (or accent red for nav variant), text inverts to white, icon nudges; smooth 0.3s.
- **Link button:** plain all-caps text with an underline line element that shrinks/regrows left-to-right on hover.
- Buttons have a masked double-label roll-up effect on hover (text slides up, duplicate slides in from below).

### 4. Page structure & sections (in exact order)

Wrap everything: `.page-wrapper > main.main-wrapper`. Sections alternate white/black backgrounds; each carries its nav-theme sentinel.

#### S1 — HERO (white bg, section-padding-large)
- Small all-caps subtitle line: `[[HERO_KICKER]]` (e.g. the "we do X for Y" one-liner) with accent-colored key words.
- **Giant H1** filling the container: `[[HERO_TITLE_LINE_1]]` + a **rotating word slot**: 3 stacked spans ([[INDUSTRY_1/2/3]] — e.g. audience segments), each colored with one brand accent (blue/green/purple). Pure CSS keyframe cycle (~6s per word, infinite):
  - `hero-swap`: word enters from `translateY(100%)` (0→5.33%), holds (5.33→31.66%), exits to `translateY(-100%)` (38%), staggered so exactly one word is visible at a time inside an overflow-hidden mask.
  - Simultaneous gradient-fill keyframe: the visible word's color fills left-to-right via `background-size 0%→100%` on a text-clipped gradient.
- **Easter-egg toggle:** a small "[[SUPERCHARGE_LABEL]]" button; clicking toggles `data-supercharge="true"` on the hero section, which switches the hero into an alternate "hyped" style via CSS (reveals hidden decorative layer, hides normal layer, tweaks nav) — clicking again reverts.
- Bottom of hero: small caption "[[SOCIAL_PROOF_CAPTION]]" + **client logo marquee** (one row, ~10 logos `[[CLIENT_LOGOS]]`, grayscale, slow leftward loop, edge fades).

#### S2 — SCRUB INTRO (statement section, white bg, pinned)
A tall pinned section (`height: N × 100vh`, N = number of paragraphs, here 4):
- Optional decorative image/3D element at top that, as you begin scrolling, scales to `0.8` and fades to `0.5` (scrub, start "top 20%" end "top top").
- 4 statement paragraphs `[[STATEMENT_1..4]]` (one short punchline among them), each absolutely stacked in the pinned viewport. Master timeline scrubbed (`scrub: 0.5`) across the whole section; each paragraph gets a timeline slice **proportional to its text length**: fade in (5% of slice) → text "highlight fill" left-to-right via `background-size: 0% → 110% 100%` on a two-color background-clip gradient (80% of slice, linear) → fade out (15%). First paragraph starts visible; last one stays.
- Typography: big serif-less heading font or large body, key words wrapped in accent color.

#### S3 — FEATURED WORK (black bg, dark theme)
- **Giant marquee heading**: "[[WORK_MARQUEE_WORD]] •" repeated, heading font at ~15cqw, using the scroll-reactive marquee (direction follows scroll).
- Grid/list of 4–6 project cards `[[PROJECTS]]`: large media (image; on hover an autoplaying muted video fades in — `data-video-hover`), project name + tags. Cards zone sets `data-cursor-hide` and shows its own hover state. Card images subtly parallax/move toward the mouse (`data-hover-move`, few px, quickTo).
- Pill button "[[VIEW_ALL_WORK_LABEL]]".

#### S4 — DELIGHT / PLAYGROUND (white bg, sticky stack of 3 interactive sub-sections)
Sticky wrapper; each sub-section is 100vh and demonstrates "personality". **Lazy-init the whole thing via IntersectionObserver (rootMargin = 1 viewport) and only then load Matter.js.**
1. **Physics:** a full-bleed `<canvas>` running Matter.js — a pile of rounded rectangles/circles (chips with `[[VALUE_WORDS]]` rendered as DOM elements synced to physics bodies, or canvas-drawn) falls with gravity when the section enters, collides realistically, and is draggable with the mouse. Centered overlay text: subtitle + H1 `[[DELIGHT_1_TITLE]]` + short paragraph `[[DELIGHT_1_TEXT]]`.
2. **Confetti:** centered H1 `[[DELIGHT_2_TITLE]]` with a "tap me"-style prompt chip; every click fires a confetti burst from the click point on a full-bleed canvas (confetti in the 4 brand colors, ~50–150 pieces, gravity + spin + fade). Cursor shows a playful image+label here.
3. **Editable:** H1 `[[DELIGHT_3_TITLE]]` is `contenteditable` — cursor label says "edit!" (`data-cursor="edit!"`), inviting visitors to retype the headline; plus subtitle and paragraph `[[DELIGHT_3_TEXT]]`.

#### S5 — TEAM / ABOUT (white bg)
Two-column grid: left column **sticky** heading block (H2 `[[TEAM_TITLE]]` + large intro paragraph `[[TEAM_INTRO]]`); right column a vertical list of 5+ members `[[TEAM_MEMBERS]]` — each row: name (heading font, big), role; hover reveals their photo following the cursor (image trails the mouse within the row). Rows separated by 1px lines; subtle stagger reveal on scroll.

#### S6 — AUDIENCE TABS (colored themes)
Tab component with 2–3 tabs `[[AUDIENCE_TABS]]` (icon + label). Each tab pane is a full "mini-section" themed in one brand accent (blue / green / purple background), containing: kicker, H2, paragraph, bullet highlights, CTA button, and a supporting image. Instant tab switch (duration 0), the pane itself animates its content in with the SplitText line reveal.

#### S7 — TESTIMONIALS (black bg, dark theme)
H2 `[[TESTIMONIALS_TITLE]]` (huge, heading font) + 4 testimonial cards `[[TESTIMONIALS]]` (quote, name, role/company, logo). Cards are **stacked and pinned**: as you scroll, each new card slides/scales in over the previous one (scale previous to ~0.95, fade slightly), classic card-stack scrub. Pill button "[[MORE_TESTIMONIALS_LABEL]]".

#### S8 — BLOG / INSIGHTS (white bg)
Sticky heading column (H3 `[[BLOG_TITLE]]`) + 3 horizontal article rows `[[ARTICLES]]` (thumbnail, title, date, tag) with hover underline/arrow; link button "[[ALL_ARTICLES_LABEL]]".

#### S9 — CONTACT FORM (black bg, `#get-started`)
Centered, container-small: H2 `[[FORM_TITLE]]`, short reassurance line, then form: 2-column rows (name/email), then company, then a message textarea, then full-width submit pill (accent red on hover). Include success/error message states. Labels all-caps small; inputs minimal with bottom borders on dark.

#### S10 — SUPERCHARGED CTA (black bg, part of footer block)
A single **gigantic multi-line heading** `[[FINAL_CTA_TITLE]]` at ~18–20cqw filling the viewport width, each word/letter wrapped in spans; on scroll it reveals with a per-letter stagger and the key word fills with accent red. Under it: small all-caps prompt + row of 2–3 big link buttons `[[FINAL_CTA_LINKS]]` (e.g. start a project / email / call).

#### S11 — FOOTER (black bg)
- Row 1: logo + 3 nav link buttons.
- Row 2 (3-col grid): a warm sign-off sentence (text-xlarge) `[[FOOTER_NOTE]]`, contact details, address/socials `[[FOOTER_CONTACTS]]`.
- Row 3: fine print `[[LEGAL_LINE]]` + credits link.
- **Next-page teaser:** full-width band at the very bottom — "next page" label + a huge preview link `[[NEXT_PAGE_LINK]]` with `data-cursor="visit page"`; hover slides the background accent up behind the text.

### 5. Micro-interaction inventory (apply globally)

- `data-hover-stagger`: hovering a trigger animates its child elements with a quick stagger (e.g. nav link letters).
- `data-hover-move`: element drifts a few px toward the cursor (quickTo, 0.3s power3.out), resets on leave.
- All images: `border-radius: var(--radius-regular)` where carded; `object-fit: cover`.
- Scroll-triggered reveals default: start `"top 80%"`, ease `"main"`, duration 0.8–1.2s, translate-y 2–3rem + fade.
- Focus-visible outlines everywhere; skip-to-content link as first element.
- Lazy-load below-fold images (`loading="lazy"`), preload the two font files, `font-display: swap`.

### 6. Quality bar

- Lighthouse ≥ 90 performance despite animations (lazy-init heavy sections, `will-change` sparingly, kill ScrollTriggers on resize properly).
- Fully responsive: at ≤ 768px — halve section paddings, hero title still fills width (cqw handles it), menu links stack, physics section reduces body count, cursor disabled (native cursor), marquees keep running.
- No layout shift from font loading or SplitText (split after `document.fonts.ready`).
- Organize JS as small modules: `loader.js`, `cursor.js`, `nav.js`, `marquee.js`, `split-reveals.js`, `scrub-intro.js`, `physics.js`, `confetti.js`, `card-stack.js`, one `main.js` orchestrator that runs everything after `DOMContentLoaded` + fonts ready.

### CONTENT SLOTS SUMMARY
`[[LOGO_SVG]] [[HERO_KICKER]] [[HERO_TITLE_LINE_1]] [[INDUSTRY_1..3]] [[SUPERCHARGE_LABEL]] [[SOCIAL_PROOF_CAPTION]] [[CLIENT_LOGOS]] [[STATEMENT_1..4]] [[WORK_MARQUEE_WORD]] [[PROJECTS]] [[VALUE_WORDS]] [[DELIGHT_1..3_TITLE/TEXT]] [[TEAM_TITLE]] [[TEAM_INTRO]] [[TEAM_MEMBERS]] [[AUDIENCE_TABS]] [[TESTIMONIALS_TITLE]] [[TESTIMONIALS]] [[BLOG_TITLE]] [[ARTICLES]] [[FORM_TITLE]] [[FINAL_CTA_TITLE]] [[FINAL_CTA_LINKS]] [[FOOTER_NOTE]] [[FOOTER_CONTACTS]] [[LEGAL_LINE]] [[NEXT_PAGE_LINK]] [[TAGLINE_WORDS]]`

---

## LAMPIRAN — Ringkasan data hasil scraping (referensi teknis)

| Aspek | Temuan |
|---|---|
| Platform | Webflow + custom TypeScript (di-bundle, dimuat dari CDN) |
| Animasi | GSAP 3.15: ScrollTrigger, SplitText, CustomEase (ScrollSmoother dimuat tapi scroll memakai Lenis) |
| Smooth scroll | Lenis (`window.lenis`), di-stop saat menu terbuka |
| Fisika | Matter.js (section "delight" — lazy load, IntersectionObserver ±1 viewport) |
| Easing kustom | `CustomEase "main" = cubic-bezier(0.65, 0.01, 0.05, 0.99)` |
| Font heading | Söhne Schmal Halbfett (600), uppercase, line-height 0.85 |
| Font body | PP Neue Montreal (400/500), line-height 1.5–1.6 |
| Warna brand | Merah #ff3454, Biru #1043f9, Hijau #34ff48, Ungu #e64aff |
| Sizing tipografi | Container queries (`cqw`) + `clamp()`; heading raksasa 15–44cqw |
| Loader | Counter 0→100 (2s) + 25 klon SVG bolt (scale 30×→1, rotasi 90°→0) + burst diagonal + wipe; skip via sessionStorage + document.referrer |
| Menu | 3 panel geser `xPercent 101→0` stagger 0.12/0.575s; link naik `yPercent 140, rot 10°` stagger 0.05 |
| Navbar | Hide/show on scroll (quickTo yPercent); ganti tema via sentinel `data-nav-color-trigger` per section |
| Cursor | Dot merah quickTo 0.2s power4.out; label kontekstual `data-cursor="visit page"/"edit!"`; varian gambar di delight |
| Marquee | Data-attribute (speed/direction/duplicate=4); arah membalik mengikuti arah scroll |
| Scrub intro | Pinned n×100vh, scrub 0.5; fill teks via `background-size 0%→110%`, durasi proporsional panjang teks; gambar scale 0.8 + opacity 0.5 |
| Hero rotating text | CSS keyframes ~6s: translateY 100%→0→-100% + gradient fill via CSS var |
| SplitText pattern | lines mask y:100%; chars opacity 0.2→1 (scrub); words+chars mask reveal |
| Struktur section | Hero → Scrub intro → Featured work (marquee raksasa + kartu video hover) → Delight ×3 (fisika/confetti/contenteditable) → Team (sticky + hover foto) → Tabs industri (tema warna) → Testimonials (card stack) → Blog → Form (dark) → CTA raksasa → Footer + next-page teaser |
| Easter egg | Tombol "supercharge" men-toggle `data-supercharge="true"` pada hero (mode visual alternatif via CSS) |
| A11y | Skip link, focus trap menu, Escape close, aria-hidden, tabindex management |
