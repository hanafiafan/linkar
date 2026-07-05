// Prepares entity logo assets for the ecosystem marquee.
// Reads originals extracted from the "Logo - Company RBL" zip (see docs/task brief),
// trims surrounding whitespace/transparency, resizes to fit within 480x240,
// and writes PNGs to web/public/images/entities/ using the filenames referenced
// by content/seed.json (`entities[].logo`).
import sharp from 'sharp';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sourceDir = path.resolve(__dirname, '../../assets/entities');
const outDir = path.resolve(__dirname, '../public/images/entities');

// name -> source filename in assets/entities/
const logos = {
  run: 'run.png',
  neuverse: 'neuverse.png',
  // NOTE: the zip's only Selara asset (Logo - Company RBL/Selara/IMG_5523.PNG) is a
  // blank/all-white 5335x2668 PNG with no visible artwork, and no other Selara file
  // exists anywhere in the source zips. Using a generated wordmark placeholder until
  // a real Selara logo is supplied — see task-5 report.
  selara: 'selara_placeholder.png',
  gumregah: 'gumregah.png',
  han: 'han_candidate_5786.png', // cleanest standalone HAN logo (see task-5 report)
  artha: 'artha.png',
};

async function run() {
  fs.mkdirSync(outDir, { recursive: true });
  for (const [name, sourceFile] of Object.entries(logos)) {
    const inputPath = path.join(sourceDir, sourceFile);
    const outputPath = path.join(outDir, `${name}.png`);

    await sharp(inputPath)
      .trim()
      .resize({ width: 480, height: 240, fit: 'inside', withoutEnlargement: true })
      .png()
      .toFile(outputPath);

    console.log(`prepared ${name}.png <- ${sourceFile}`);
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
