# 🚀 LINKAR Redesign Documentation — Theme: IGNITE® Agency Melbourne

Dokumentasi ini dibuat untuk merekam seluruh perubahan, struktur arsitektur, dan sistem animasi hasil redesain total situs LINKAR agar menyerupai situs **IGNITE® (igniteagency.com)**. File ini dapat dibaca oleh AI Assistant di perangkat lain untuk melanjutkan pengembangan tanpa kehilangan konteks.

---

## 🎨 Skema Warna & Desain Sistem (iOS 26 / Tahoe 26.5)
* **Latar Belakang:** Menggunakan transisi scroll-driven background morph murni **Hitam (#000000)** dan **Putih (#ffffff)**.
* **Elemen Pendukung (2 Warna Logo Brand):**
  * **Oranye LINKAR (`#F26A21`):** Warna primer aksen, badge, tombol utama, hover link utama, dan garis bawah form input aktif.
  * **Biru Cobalt LINKAR (`#007AFF` / `#0A72E4`):** Warna sekunder aksen untuk list numbers menu, teks rotator, kategori portofolio, dan label form aktif.

---

## 🛠️ Komponen Interaktif & Animasi yang Selesai

### 1. Percentage Preloader
* **File:** `web/src/components/Preloader.astro`
* **Fitur:** 
  * Melakukan *lock* scroll pada body (`overflow: hidden`) saat memutar angka.
  * Animasi persentase dari `0%` ke `100%` secara dinamis dipicu oleh GSAP.
  * Setelah selesai, ikon logo sentral meluncur ke atas dan seluruh preloader di-slide ke atas menggunakan `translateY(-100%)`, kemudian body scroll dikembalikan normal.

### 2. Header & Fullscreen Menu
* **File:** `web/src/components/Navbar.astro`
* **Fitur:**
  * **Logo Text-Slide:** Huruf logo LINKAR terbelah dan bergeser ke atas/bawah secara staggered pada hover menggunakan efek CSS transition.
  * **Staggered Fullscreen Menu:** Hamburg menu membuka panel hitam pekat dengan transisi slide-in panel kiri-kanan. Link utama berukuran raksasa tampil secara staggered.
  * **Panel Overlay Fix:** Menyetel Panel 1 bergeser ke atas (`translateY(-100%)`) dan Panel 2 bergeser ke bawah (`translateY(100%)`) saat menu ditutup agar tidak menutupi layar bagian atas (mencegah bug blank hitam setengah halaman).

### 3. Hero Section
* **File:** `web/src/components/Hero.astro`
* **Fitur:**
  * **Text Rotator:** Judul memiliki rotator teks vertikal ("EKOSISTEM.", "KOLABORASI.", "LINGKAR DAMPAK."). Kata sambung dibungkus dalam `white-space: nowrap` agar tidak pecah di mobile.
  * **Logo Marquee:** Slider logo mitra kerja berjalan lambat grayscale di bagian bawah menggunakan GSAP.
  * **3D Canvas:** Canvas Three.js logo diinisialisasi otomatis menggunakan loader `initHero3D` saat visual mode diatur ke `logo3d` di database.

### 4. Scroll-Scrub Text Highlight
* **File:** `web/src/components/About.astro`
* **Fitur:**
  * Paragraf perkenalan LINKAR berwarna abu-abu redup dan menyala putih bersih kata-demi-kata (highlight) berdasarkan posisi scroll menggunakan GSAP ScrollTrigger.
  * Mengintegrasikan model 3D logo LINKAR (Three.js) di tengah seksi yang berputar merespon scroll.

### 5. Cursor-Following Portfolio Previews
* **File:** `web/src/components/PortfolioSection.astro`
* **Fitur:**
  * Row list portofolio minimalis pada background putih.
  * Kotak preview foto melayang (lerp smoothing menggunakan GSAP ticker) mengikuti kursor mouse dengan bouncy transition (`scale` & `opacity` diatur penuh menggunakan GSAP untuk menghindari tabrakan dengan CSS transform).

### 6. Capabilities & Delight (Matter.js + Confetti)
* **File:** `web/src/components/Services.astro`
* **Fitur:**
  * **Seksi 1 (Matter.js):** Menjatuhkan balok-balok 2D bertuliskan kata kunci ekosistem. Warna balok diwarnai berselingan (oranye & biru). Balok dapat digeser dan dilempar, serta di-clamp ke batas layar saat resize.
  * **Seksi 2 (Confetti):** Menembakkan letupan confetti warna-warni (oranye, putih, biru) tepat di koordinat klik kursor mouse.
  * **Seksi 3 (Model Cards):** Memetakan 3 pilar kapabilitas nyata dari database `seed.json` (`services.cards`) dalam bentuk list vertikal minimalis yang elegan.

### 7. Form & Footer Minimalis
* **File:** `web/src/components/ContactCta.astro` & `web/src/components/Footer.astro`
* **Fitur:** Form input bergaya borderless (hanya garis bawah) yang berubah oranye saat aktif, dan label di atasnya berubah biru. Footer minimalis dengan outline tag marquee berjalan.

### 8. Page Transition Delay Curtain & Hover Leakage Fix
* **File:** `web/src/layouts/Base.astro`, `web/src/styles/global.css`, `web/src/components/PortfolioSection.astro`
* **Fitur:** 
  * **Page Transition Curtain:** Menambahkan `.transition-curtain` yang menangkap klik tautan internal, memicu tirai hitam meluncur ke atas untuk menutupi viewport selama `0.85s`, lalu menahan layar kosong (hold blank screen) hingga total `1.4s` sebelum berpindah halaman. Halaman baru kemudian dimuat di bawah preloader yang meluncur keluar ke atas, menciptakan alur navigasi halaman yang mulus.
  * **Hover Leakage Fix:** Menambahkan pengaman `mouseleave` pada seluruh seksi portofolio dan `mouseenter` pada bar navigasi untuk mereset skala preview melayang ke `0`, melenyapkan bug foto menggantung saat bergulir ke seksi lain.

---

## ⚙️ Petunjuk untuk Melanjutkan di Device Baru

Saat Anda membuka repository ini di perangkat baru menggunakan AI Assistant lain, berikan petunjuk berikut ke AI tersebut:

1. **Jalankan Environment:**
   ```bash
   cd web
   npm install
   npm run dev
   ```
2. **Konteks Library:**
   Situs ini menggunakan **Astro v7**, **GSAP v3 (ScrollTrigger, SplitText)** untuk animasi, **Three.js** untuk logo 3D, **Matter.js** untuk physics engine di Services, dan **Canvas Confetti** untuk efek klik.
3. **Struktur Data:**
   Seluruh data dinamis dimuat dari file JSON lokal di `web/src/content/seed.json` (dan `draft.json` bila dalam mode draft). Pastikan perubahan data dilakukan di file JSON tersebut agar tersinkronisasi dengan dashboard admin Astro.
4. **Pencegahan Bug Transisi:**
   Hindari mencampur inline style transform GSAP dengan transisi CSS transform pada elemen yang sama (seperti cursor/hover preview) agar tidak terjadi overlap/kedutan visual.
