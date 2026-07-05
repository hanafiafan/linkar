import { createClient } from '@sanity/client';
import type { SiteContent } from './content';

const IMG = '?w=1600&q=75&auto=format';

// ponytail: append CDN params in JS after fetch rather than string-concat inside GROQ —
// simpler to get right and easy to verify against real output.
const withParams = (url: string | null | undefined) => (url ? `${url}${IMG}` : '');

const query = `{
  "settings": *[_id=="siteSettings"][0]{formEmail, footerTagline, ctaLabel, navLabels, "logoColor": logoColor.asset->url, "logoWhite": logoWhite.asset->url},
  "home": *[_id=="homePage"][0]{hero, marquee, about, portfolio, services, linkarStats, industry, commitments, cta},
  "entities": *[_type=="entity"]|order(orderRank asc){name, role, tagline, "logo": logo.asset->url, "slug": slug.current, "heroImage": heroImage.asset->url, description, body, website, hasProfile},
  "photos": *[_type=="activationPhoto"]|order(orderRank asc){"src": image.asset->url, "alt": caption, program, "featured": coalesce(featured, false)},
  "programs": *[_type=="program" && defined(slug.current)]{"slug": slug.current, title, partner, period, location, summary, body, "cover": cover.asset->url, "gallery": gallery[].asset->url, impact},
  "posts": *[_type=="post" && defined(slug.current)]|order(date desc){"slug": slug.current, title, excerpt, "cover": cover.asset->url, body, author, date}
}`;

export async function fetchFromSanity(): Promise<SiteContent> {
  const projectId = import.meta.env?.SANITY_PROJECT_ID ?? process.env.SANITY_PROJECT_ID;
  const dataset = import.meta.env?.SANITY_DATASET ?? process.env.SANITY_DATASET ?? 'production';
  const client = createClient({
    projectId,
    dataset,
    apiVersion: '2026-07-01',
    useCdn: true,
  });
  const r = await client.fetch(query);

  if (!r.settings || !r.home) {
    throw new Error('Sanity: dokumen siteSettings/homePage tidak ditemukan — jalankan node studio/scripts/seed.mjs');
  }

  return {
    settings: {
      ...r.settings,
      logoColor: withParams(r.settings.logoColor),
      logoWhite: withParams(r.settings.logoWhite),
    },
    home: r.home,
    entities: (r.entities ?? []).map((e: { logo: string; heroImage?: string }) => ({
      ...e,
      logo: withParams(e.logo),
      heroImage: withParams(e.heroImage),
    })),
    photos: (r.photos ?? []).map((p: { src: string; alt: string; program: string; featured: boolean }) => ({
      ...p,
      src: withParams(p.src),
    })),
    programs: (r.programs ?? []).map((p: { cover: string; gallery: string[] | null }) => ({
      ...p,
      cover: withParams(p.cover),
      gallery: (p.gallery ?? []).map(withParams),
    })),
    posts: (r.posts ?? []).map((p: { cover: string }) => ({
      ...p,
      cover: withParams(p.cover),
    })),
  } as SiteContent;
}
