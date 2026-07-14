import type { APIRoute } from 'astro';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { isAuthenticated } from '../../lib/adminAuth';
import { pushFileToGitHub } from '../../lib/github';

export const prerender = false;

// .svg sengaja tidak diizinkan: bisa membawa <script> (stored XSS)
const ALLOWED = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export const POST: APIRoute = async ({ request, cookies }) => {
  if (!isAuthenticated(cookies)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file');
    if (!(file instanceof File)) {
      return new Response(JSON.stringify({ error: 'Tidak ada file yang dikirim' }), { status: 400 });
    }
    if (file.size > MAX_SIZE) {
      return new Response(JSON.stringify({ error: 'Ukuran file maksimal 5MB' }), { status: 400 });
    }

    const ext = path.extname(file.name).toLowerCase();
    if (!ALLOWED.includes(ext)) {
      return new Response(JSON.stringify({ error: `Format ${ext || 'file'} tidak didukung (pakai jpg/png/webp/gif)` }), { status: 400 });
    }

    // Nama file aman: huruf kecil, tanda hubung, plus stempel waktu agar unik
    const base = path.basename(file.name, path.extname(file.name))
      .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'gambar';
    const fileName = `${Date.now()}-${base}${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    // Vercel Functions: filesystem read-only, dan aset statis dilayani dari
    // build CDN (bukan dari function ini) — jadi gambar cuma bisa masuk lewat
    // commit GitHub, yang memicu build baru untuk menyertakannya.
    if (process.env.VERCEL) {
      let github: 'pushed' | null = null;
      try {
        github = await pushFileToGitHub(`web/public/images/uploads/${fileName}`, buffer, `cms: upload ${fileName}`);
      } catch (e: any) {
        return new Response(JSON.stringify({ error: `Gagal mengunggah ke GitHub: ${e.message}` }), { status: 502 });
      }
      if (!github) {
        return new Response(JSON.stringify({ error: 'GITHUB_TOKEN/GITHUB_REPO belum dikonfigurasi — upload gambar tidak didukung di Vercel tanpa itu' }), { status: 500 });
      }
      return new Response(JSON.stringify({ path: `/images/uploads/${fileName}`, github, pending: true }), { status: 200 });
    }

    const dir = path.resolve(process.cwd(), 'public/images/uploads');
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, fileName), buffer);

    // Ikut commit ke GitHub (kalau dikonfigurasi) — tanpa ini gambar hanya ada
    // di server lokal dan 404 di situs statis production
    let github: 'pushed' | null = null;
    try {
      github = await pushFileToGitHub(`web/public/images/uploads/${fileName}`, buffer, `cms: upload ${fileName}`);
    } catch (e: any) {
      return new Response(JSON.stringify({ error: `File tersimpan lokal, tapi gagal dikirim ke GitHub: ${e.message}` }), { status: 502 });
    }

    return new Response(JSON.stringify({ path: `/images/uploads/${fileName}`, github }), { status: 200 });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: `Gagal mengunggah: ${e.message}` }), { status: 500 });
  }
};
