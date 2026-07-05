import seed from '../content/seed.json';

export interface Stat { value: string; label: string; note?: string }
export interface Entity { name: string; role: string; tagline: string; logo: string }
export interface Photo { src: string; alt: string; program: string; featured: boolean }
export interface ProgramDoc { slug: string; title: string; partner: string; period: string; location: string; summary: string; body: unknown; cover: string; gallery: string[]; impact: Stat[] }
export interface PostDoc { slug: string; title: string; excerpt: string; cover: string; body: unknown; author: string; date: string }
export interface SiteContent {
  settings: { formEmail: string; footerTagline: string; ctaLabel: string };
  home: {
    hero: { badge: string; title: string; highlight: string; subEn: string; subId: string; primaryCta: string; secondaryCta: string; miniStats: Stat[] };
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

export async function getContent(): Promise<SiteContent> {
  const projectId = import.meta.env?.SANITY_PROJECT_ID ?? process.env.SANITY_PROJECT_ID;
  if (projectId) {
    const { fetchFromSanity } = await import('./sanity');
    return fetchFromSanity();
  }
  return seed as unknown as SiteContent;
}
