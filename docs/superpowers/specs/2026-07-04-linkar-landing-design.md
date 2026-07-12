# LINKAR Landing Page — Design Spec

**Tanggal**: 2026-07-04
**Status**: Disetujui user per bagian (struktur, copywriting, CMS/teknis) — menunggu review dokumen final
**Proyek**: Website publik LINKAR (brand "Ecosystem Enabler" milik CV Rantai Usaha Nusantara / RUN)

---

## 1. Latar & Tujuan

LINKAR adalah brand publik RUN untuk masuk industri program berdampak (CSR korporat, BUMN, pemerintah) di Yogyakarta, Jawa Tengah, dan Jawa Timur. Website ini adalah **alat kredibilitas untuk pitching** — sesuai roadmap internal 12 bulan (deck `Linkar/LINKAR.pptx`), fase fondasi mensyaratkan: narasi entitas yang jelas, portofolio terdokumentasi, dan angka terukur.

**Referensi gaya**: https://scalient.webflow.io/ — dark premium agency, animasi scroll GSAP. Direplikasi *gayanya* dari nol (bukan disalin kodenya — template berbayar).

**Sukses berarti**: situs live di Vercel, semua konten (teks/foto/entitas) bisa diedit tim non-teknis via Sanity Studio, animasi kelas Scalient berjalan mulus, biaya berjalan Rp 0.

## 2. Stack & Arsitektur

| Lapisan | Teknologi | Alasan |
|---|---|---|
| Frontend | **Astro** (static output) | Ringan, cepat, bebas penuh untuk GSAP |
| CMS | **Sanity** (free tier) | Dashboard jadi, image CDN + crop/hotspot, 3 user gratis |
| Hosting | **Vercel** (free) | Sudah tersambung via connector; deploy hook untuk rebuild |
| Animasi | **GSAP 3.13+ + ScrollTrigger + SplitText** | Semua plugin resmi gratis sejak 3.13 |
| Form | **Web3Forms** (free) | Relay form ke email tanpa backend; honeypot anti-spam |

**Alur konten**: edit di Sanity Studio → publish → webhook Sanity → Vercel deploy hook → rebuild statis → live ±1 menit.

**Struktur halaman**:
- `/` — landing (fase 1, launch)
- `/program` + `/program/[slug]` — case study (template dibangun sekarang, menu **auto-hide** sampai ≥1 item published)
- `/blog` + `/blog/[slug]` — artikel (auto-hide, sama)
- `/studio` atau URL Sanity terpisah — dashboard CMS

## 3. Design System

- **Palet** (mengikuti logo LINKAR, keputusan user 2026-07-04):
  - Dasar gelap: navy `#0a1128`–`#0d1330` (base), panel `#111a3d`-ish
  - Aksen tunggal: oranye `#F26A21` (tombol, highlight, angka) — disiplin satu aksen ala lime-nya Scalient
  - Navy logo `#1F2B5B` untuk elemen sekunder; putih/off-white untuk teks
  - Ritme gelap–terang (sandwich ala Scalient): semua section navy gelap, **kecuali** #4 Portofolio dan #8 Komitmen yang berlatar terang `#fafafa` — memberi napas di tengah halaman; hero dan CTA selalu gelap
- **Font**: Plus Jakarta Sans (Google Fonts) — weight 400/500/600/700/800, letter-spacing negatif pada heading besar
- **Foto**: filter duotone navy via CSS ke semua foto dokumentasi (menyeragamkan foto WhatsApp yang campur-campur); hover → warna asli
- **Radius**: 12–20px kartu; pill untuk badge/kicker (latar putih transparan `rgba(255,255,255,.06)` di atas gelap)
- **Logo**: file asli menyusul dari user ke `assets/brand/` (butuh PNG transparan/SVG + versi putih; jika hanya ada JPG latar putih, latar dihapus saat implementasi)

## 4. Struktur Landing & Animasi (disetujui)

Alur narasi: **"Bukti dulu"** — ekosistem/portofolio/angka di depan, edukasi pasar di belakang.

| # | Section | Animasi |
|---|---|---|
| 0 | Navbar — logo, menu (Tentang, Layanan, Portofolio, Ekosistem, Kontak; Program & Blog auto-hide), CTA oranye | Sticky, mengecil saat scroll |
| 1 | Hero — badge, judul besar, sub EN+ID, 2 tombol, stat mini | SplitText per kata; badge pop-in; foto duotone |
| 2 | Marquee entitas — "Satu lingkar, enam kekuatan", strip 6 logo loop | Marquee (duplikasi konten, transform loop); hover pause + peran muncul |
| 3 | Tentang — narasi 2 paragraf + **expandable gallery** 5 foto | Reveal per baris; flex-expand (flex 1→3, 500ms) + duotone→warna + caption saat expand; tap-to-expand di layar sentuh; keyboard focus |
| 4 | Portofolio — judul raksasa "JEJAK AKTI—[strip foto]—VASI" + grid galeri + lightbox | Split-heading dengan strip foto bertukar; grid stagger reveal |
| 5 | Layanan — 3 kartu lini + kotak differentiator | Kartu slide-up berurutan; garis "tumbuh" (height 0→100%) |
| 6 | Statistik LINKAR — 6 Entitas · 4 Komunitas · 3 Provinsi · 20+ Aktivasi | **Odometer rolling digits** (kolom 0–9, translate dari -500%) |
| 7 | Peluang industri — 1.400T ekraf · 15–20T CSR · 64 Juta UMKM + kalimat penutup | Odometer + reveal |
| 8 | Komitmen — 4 kartu (teks prototype dipertahankan) | Stagger reveal |
| 9 | CTA + Form kontak (Nama, Instansi, Email, WhatsApp, Kebutuhan) | Reveal; status sukses/gagal inline |
| 10 | Footer — tagline besar, kolom navigasi/layanan/entitas/kontak | — |

**Aksesibilitas**: semua animasi dinonaktifkan bila `prefers-reduced-motion`; lightbox & gallery bisa dioperasikan keyboard; kontras teks WCAG AA di atas navy.

## 5. Copywriting (disetujui — konten awal, hidup di CMS)

Bahasa: **Indonesia + aksen Inggris**. Basis: copy prototype `linkar.html` disempurnakan.

- **Hero** — Badge: `ECOSYSTEM ENABLER · CV RANTAI USAHA NUSANTARA`. Judul: **"Menghubungkan komunitas, korporat, dan pemerintah dalam satu lingkar dampak."** (kata "lingkar" highlight oranye). Sub: *"We enable ecosystems, not just events."* — LINKAR merancang, mengeksekusi, dan mengukur program berdampak bagi UMKM, talenta muda, dan komunitas. Berakar di Yogyakarta, melayani Jawa Tengah & Jawa Timur. Tombol: `Ajak Kolaborasi →` / `Lihat Portofolio`. Stat mini: 6 Entitas terkoordinasi · 4 Komunitas aktif · 3 Provinsi inti.
- **Marquee** — Kicker `OUR ECOSYSTEM`; judul "Satu lingkar, enam kekuatan".
- **Tentang** — Kicker `TENTANG KAMI · WHO WE ARE`; judul "Kami percaya pada kolaborasi ekosistem, bukan sekadar eksekusi acara." Paragraf 1: Di bawah umbrella **CV Rantai Usaha Nusantara**, LINKAR menyatukan enam entitas yang beroperasi mandiri namun terkoordinasi — pendekatan multi-segmen dengan fleksibilitas eksekusi yang jarang dimiliki pemain tunggal. Paragraf 2: Kami mengisi celah yang dilewatkan pemain berbasis Jakarta: membangun ekosistem inovasi langsung dari komunitas — dengan dukungan ruang, pendanaan, mentorship, dan akses ke korporasi.
- **Portofolio** — Judul terbelah: `JEJAK AKTI` + `VASI`. Pengantar: "Cuplikan program, pelatihan, dan aktivasi komunitas yang telah kami jalankan bersama mitra."
- **Layanan** — Kicker `CARA KAMI BEKERJA · OUR MODEL`; judul "Tiga lini yang saling menguatkan."
  - 01 **Advisory & Consulting** (RUN): "Dari perancangan program, pemetaan pemangku kepentingan, hingga monitoring & evaluasi dampak." → Untuk: Corporate CSR · BUMN · Pemda
  - 02 **Program & Event Execution** (Selara · Neuverse · Gumregah): "Eksekusi lapangan: pelatihan, event, kompetisi, inkubasi, dan aktivasi komunitas — multi-entitas, multi-segmen."
  - 03 **Community Platform**: "Komunitas aktif sebagai bukti jangkauan dan kepercayaan — dari digital skill, UMKM, hingga mitra tani."
  - Differentiator: "**Kami bermain di luar Jakarta.** LINKAR menjadi anchor ekosistem di Yogyakarta, Jawa Tengah, dan Jawa Timur — celah yang dilewatkan pemain ibu kota."
- **Statistik LINKAR** — Kicker `LINKAR DALAM ANGKA`: 6 Entitas dalam satu ekosistem · 4 Komunitas aktif dibina · 3 Provinsi wilayah kerja · 20+ Aktivasi terlaksana (angka terakhir dikoreksi user di CMS).
- **Peluang industri** — Kicker `KENAPA SEKARANG · THE OPPORTUNITY`; judul "Pasar yang besar, eksekutor yang masih langka." Item: IDR 1.400T Ekonomi kreatif per tahun (±7–8% PDB · #3 dunia) · IDR 15–20T Anggaran CSR korporat · 64 Juta UMKM menanti pendampingan (60% PDB). Penutup: "Kebutuhan eksekusi program tersebar lintas kementerian, BUMN, dan CSR korporat — dan belum ada pemain dominan di luar Jakarta."
- **Komitmen** — "Komitmen Kami" + 4 kartu, teks dari prototype dipertahankan utuh (SDM terampil; pendampingan UMKM & wirausaha; kolaborasi lintas pemangku kepentingan; kemitraan publik–swasta).
- **CTA** — Judul "Mari membangun ekosistem dampak bersama." Sub: *"Everyone can be everyone's gateway."* — Punya program CSR, pelatihan, atau inisiatif komunitas yang butuh eksekusi terukur? Ceritakan kebutuhan Anda. Form → `Kirim Pesan →`.
- **Footer** — Tagline besar *"Everyone can be everyone's gateway"*; kolom Navigasi · Layanan · Entitas (6) · Kontak; © 2026 CV Rantai Usaha Nusantara · LINKAR — Ecosystem Enabler.

## 6. Skema CMS (Sanity)

**Singleton:**
- `siteSettings` — logo warna, logo putih, email tujuan form, link sosial, tagline footer, teks CTA navbar
- `homePage` — seluruh konten landing per section; setiap field teks diberi **batas karakter + deskripsi petunjuk** (guardrail agar layout tak rusak). Field judul-terbelah portofolio dibuat 2 field terpisah (`part1`, `part2`) dengan batas karakter ketat.

**Koleksi:**
- `entity` — nama, logo (image), peran, tagline, urutan (orderable). Dipakai: marquee, footer. Menambah item → otomatis ikut di marquee.
- `activationPhoto` — foto (hotspot/crop), caption, nama program, flag `featured` (dipakai expandable gallery & strip judul), urutan. Dipakai: grid portofolio, expandable gallery, strip foto judul.
- `program` — judul, slug, mitra/klien, periode, lokasi, ringkasan, body (portable text), cover, galeri, angka dampak (array {nilai, label}), entitas terlibat (referensi), status publish.
- `post` — judul, slug, excerpt, cover, body (portable text), penulis, tanggal, tag.

**Aturan auto-hide**: link navbar "Program"/"Blog" hanya dirender bila count published > 0 (dievaluasi saat build).

## 7. Form Kontak

- Field: Nama, Instansi/Perusahaan, Email, No. WhatsApp, Kebutuhan (textarea)
- Submit → Web3Forms API → email ke alamat di `siteSettings`
- Proteksi: honeypot field; validasi client-side sederhana
- UX: status terkirim/gagal inline tanpa reload; tanpa halaman thank-you terpisah

## 8. Aset

- `assets/brand/` — logo LINKAR (menyusul dari user)
- `assets/entities/` — logo 6 entitas, diekstrak dari `Linkar/Logo - Company RBL-*.zip` (folder relevan: RUN, NEUverse, Selara, Gumregah, Exsiting Brand/HAN, Multi Agency/Artha id). Perlu penyeragaman: versi putih/monokrom untuk marquee di atas navy.
- `assets/portfolio/` — foto terkurasi dari `Linkar/Portofolio Arc-*.zip` (26 foto + video WhatsApp, dokumentasi internal). Kurasi memilih yang paling representatif; duotone CSS menyeragamkan. Aset awal di-upload ke Sanity saat seeding konten.

## 9. SEO & Lain-lain

- Meta title/description per halaman, Open Graph image (kartu share WA/LinkedIn), sitemap.xml, favicon dari mark logo
- `lang="id"`
- Analytics: belum (bisa ditambah Vercel Analytics kapan saja)
- Domain: `linkar.id` dibeli user terpisah; sementara pakai subdomain `*.vercel.app`

## 10. Fase Implementasi

1. **Fase 1 — Landing live**: setup Astro + Sanity + schema, bangun 10 section + animasi, seed konten awal (copy §5 + aset terkurasi), form, deploy Vercel. *Program/Blog: schema + template dibangun, menu tersembunyi.*
2. **Fase 2 — Konten menyusul** (tanpa kerja kode): user mengisi program/case study & artikel via CMS → menu muncul otomatis.

## 11. Di Luar Cakupan (eksplisit)

- Ecommerce/pricing/cart (ada di Scalient, tidak relevan)
- Testimoni (belum ada bahan; bisa jadi koleksi CMS baru nanti)
- Dwibahasa penuh (ID/EN toggle)
- Edit layout via CMS (CMS hanya konten — pelindung desain)
- Editor in-browser prototype lama (dibuang)
- Video WhatsApp dari zip portofolio (foto saja dulu)
