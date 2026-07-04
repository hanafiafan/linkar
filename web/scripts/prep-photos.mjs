// Prepares curated portfolio photos for the "Jejak Aktivasi" gallery.
// Reads 10 selected originals extracted from the "Portofolio Arc" zip (see docs/task-6 brief),
// auto-orients via EXIF, resizes to max width 1600px, and writes compressed progressive JPEGs
// to web/public/images/portfolio/ using the filenames referenced by content/seed.json (`photos[].src`).
import sharp from 'sharp';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sourceDir = path.resolve(__dirname, '../../assets/portfolio');
const outDir = path.resolve(__dirname, '../public/images/portfolio');

// display order: source filename in assets/portfolio/ -> output name
const photos = [
  { source: 'WhatsApp Image 2026-06-30 at 12.54.58 (1).jpeg', out: 'aktivasi-01.jpg' },
  { source: 'WhatsApp Image 2026-06-30 at 12.53.30 (1).jpeg', out: 'aktivasi-02.jpg' },
  { source: 'WhatsApp Image 2026-06-30 at 12.54.57 (1).jpeg', out: 'aktivasi-03.jpg' },
  { source: 'WhatsApp Image 2026-06-30 at 12.53.45 (1).jpeg', out: 'aktivasi-04.jpg' },
  { source: 'WhatsApp Image 2026-06-30 at 12.54.57.jpeg', out: 'aktivasi-05.jpg' },
  { source: 'WhatsApp Image 2026-06-30 at 12.54.58.jpeg', out: 'aktivasi-06.jpg' },
  { source: 'WhatsApp Image 2026-06-30 at 12.53.37.jpeg', out: 'aktivasi-07.jpg' },
  { source: 'WhatsApp Image 2026-06-30 at 12.53.30.jpeg', out: 'aktivasi-08.jpg' },
  { source: 'WhatsApp Image 2026-06-30 at 12.53.31 (1).jpeg', out: 'aktivasi-09.jpg' },
  { source: 'WhatsApp Image 2026-06-30 at 12.53.33 (1).jpeg', out: 'aktivasi-10.jpg' },
];

// If quality 75 produces a file >= 350KB, step down through these quality levels
// (still at width 1600) until it fits.
const QUALITY_STEPS = [75, 70, 65, 60, 55, 50];
const MAX_BYTES = 350 * 1024;

async function processOne({ source, out }, quality) {
  const inputPath = path.join(sourceDir, source);
  const outputPath = path.join(outDir, out);

  await sharp(inputPath)
    .rotate()
    .resize({ width: 1600, withoutEnlargement: true })
    .jpeg({ quality, progressive: true, mozjpeg: true })
    .toFile(outputPath);

  return fs.statSync(outputPath).size;
}

async function run() {
  fs.mkdirSync(outDir, { recursive: true });

  for (const photo of photos) {
    let size;
    let quality;

    for (quality of QUALITY_STEPS) {
      size = await processOne(photo, quality);
      if (size < MAX_BYTES) break;
    }

    const kb = (size / 1024).toFixed(1);
    const flag = size >= MAX_BYTES ? '  !! still over 350KB' : '';
    console.log(`prepared ${photo.out} <- ${photo.source} (q${quality}, ${kb}KB)${flag}`);
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
