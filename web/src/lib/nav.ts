import type { Entity, SiteContent } from './content';

export function buildBrandMenu(entities: Entity[]) {
  return entities
    .filter((e) => e.hasProfile && e.slug)
    .map((e) => ({ name: e.name, role: e.role, href: `/brand/${e.slug}`, logo: e.logo }));
}

type NavLabels = SiteContent['settings']['navLabels'];

const DEFAULT_LABELS = {
  about: 'Tentang',
  services: 'Layanan',
  portfolio: 'Portofolio',
  ecosystem: 'Ekosistem',
  contact: 'Kontak',
  program: 'Program',
  blog: 'Blog',
} as const;

export function buildNavLinks(programCount: number, postCount: number, labels?: NavLabels) {
  const l = { ...DEFAULT_LABELS, ...labels };
  const links = [
    { href: '/#about', label: l.about },
    { href: '/#services', label: l.services },
    { href: '/#portfolio', label: l.portfolio },
    { href: '/#ecosystem', label: l.ecosystem },
  ];
  if (programCount > 0) links.push({ href: '/program', label: l.program });
  if (postCount > 0) links.push({ href: '/blog', label: l.blog });
  links.push({ href: '/#contact', label: l.contact });
  return links;
}
