import seed from '../content/seed.json';
import * as fs from 'node:fs';
import * as path from 'node:path';

export interface Stat { value: string; label: string; note?: string }
export interface Entity {
  name: string; role: string; tagline: string; logo: string;
  slug?: string; heroImage?: string; description?: string; body?: unknown; website?: string; hasProfile?: boolean;
}
export interface Photo { src: string; alt: string; program: string; featured: boolean }
export interface ProgramDoc { slug: string; title: string; partner: string; period: string; location: string; summary: string; body: unknown; cover: string; gallery: string[]; impact: Stat[] }
export interface PostDoc { slug: string; title: string; excerpt: string; cover: string; body: unknown; author: string; date: string }
export interface SiteContent {
  settings: {
    formEmail: string; footerTagline: string; ctaLabel: string; logoColor?: string; logoWhite?: string;
    social?: { linkedin?: string; instagram?: string };
    navLabels?: Partial<Record<'about' | 'services' | 'portfolio' | 'ecosystem' | 'contact' | 'program' | 'blog', string>>;
  };
  home: {
    visibility?: Record<string, boolean>;
    hero: { badge: string; title: string; highlight: string; subEn: string; subId: string; primaryCta: string; secondaryCta: string; miniStats: Stat[]; visualMode?: 'kosong' | 'logo3d' | 'foto' | 'folder'; folderPhotos?: string[]; showDeco?: boolean; heroImage?: string; };
    marquee: { kicker: string; title: string };
    about: { kicker: string; title: string; paragraphs: string[] };
    portfolio: { titleTop: string; titlePart1: string; titlePart2: string; intro: string };
    services: { kicker: string; title: string; cards: { no: string; title: string; who: string; body: string; target: string }[]; differentiator: string };
    linkarStats: { kicker: string; items: Stat[] };
    industry: { kicker: string; title: string; items: Stat[]; closing: string };
    commitments: { title: string; cards: { title: string; body: string }[] };
    cta: { title: string; subEn: string; subId: string; submitLabel: string };
  };
  entities: Entity[]; photos: Photo[]; programs: ProgramDoc[]; posts: PostDoc[];
}

// Validasi struktur minimum SiteContent — mencegah JSON valid tapi salah
// bentuk merusak render halaman atau build (dipakai getContent & /api/save).
export function isSiteContent(c: any): c is SiteContent {
  const HOME_KEYS = ['hero', 'marquee', 'about', 'portfolio', 'services', 'linkarStats', 'industry', 'commitments', 'cta'];
  return !!c && typeof c === 'object'
    && !!c.settings && typeof c.settings.formEmail === 'string'
    && !!c.home && typeof c.home === 'object'
    && HOME_KEYS.every((k) => !!c.home[k] && typeof c.home[k] === 'object')
    && Array.isArray(c.home.about.paragraphs)
    && Array.isArray(c.home.services.cards)
    && Array.isArray(c.home.linkarStats.items)
    && Array.isArray(c.home.industry.items)
    && Array.isArray(c.home.commitments.cards)
    && [c.entities, c.photos, c.programs, c.posts].every(Array.isArray);
}

export async function getContent(isDraft = false): Promise<SiteContent> {
  if (typeof process !== 'undefined' && process.versions?.node) {
    try {
      const fileName = isDraft ? 'draft.json' : 'seed.json';
      let filePath = path.resolve(process.cwd(), `src/content/${fileName}`);

      if (isDraft && !fs.existsSync(filePath)) {
        filePath = path.resolve(process.cwd(), 'src/content/seed.json');
      }

      if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, 'utf-8');
        const parsed = JSON.parse(raw);
        if (isSiteContent(parsed)) return parsed;
        console.warn(`Konten di ${fileName} tidak valid strukturnya — memakai fallback seed.`);
      }
    } catch (e) {
      console.warn('Failed to read content dynamically, using fallback', e);
    }
  }
  return seed as unknown as SiteContent;
}
