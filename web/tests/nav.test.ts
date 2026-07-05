import { describe, it, expect } from 'vitest';
import { buildNavLinks, buildBrandMenu } from '../src/lib/nav';
import type { Entity } from '../src/lib/content';

describe('auto-hide nav', () => {
  it('hides Program & Blog when collections are empty', () => {
    const labels = buildNavLinks(0, 0).map(l => l.label);
    expect(labels).toEqual(['Tentang', 'Layanan', 'Portofolio', 'Ekosistem', 'Kontak']);
  });
  it('shows them when content exists', () => {
    const labels = buildNavLinks(2, 1).map(l => l.label);
    expect(labels).toContain('Program'); expect(labels).toContain('Blog');
  });
});

describe('CMS-overridable nav labels', () => {
  it('uses provided labels when given', () => {
    const labels = buildNavLinks(0, 0, { about: 'About Us', ecosystem: 'Network' }).map(l => l.label);
    expect(labels).toEqual(['About Us', 'Layanan', 'Portofolio', 'Network', 'Kontak']);
  });
  it('falls back to defaults per-key when only some are set', () => {
    const labels = buildNavLinks(1, 1, { contact: 'Hubungi Kami' }).map(l => l.label);
    expect(labels).toEqual(['Tentang', 'Layanan', 'Portofolio', 'Ekosistem', 'Program', 'Blog', 'Hubungi Kami']);
  });
});

describe('mega-menu brand list', () => {
  const entities = [
    { name: 'RUN', role: 'Advisory', tagline: '', logo: '/a.png', slug: 'run', hasProfile: true },
    { name: 'NoProfile', role: 'X', tagline: '', logo: '/b.png', slug: 'noprofile', hasProfile: false },
    { name: 'NoSlug', role: 'Y', tagline: '', logo: '/c.png', hasProfile: true },
  ] as Entity[];

  it('only includes entities with hasProfile and a slug', () => {
    const menu = buildBrandMenu(entities);
    expect(menu).toEqual([{ name: 'RUN', role: 'Advisory', href: '/brand/run', logo: '/a.png' }]);
  });
  it('builds /brand/<slug> links', () => {
    const menu = buildBrandMenu(entities);
    expect(menu[0].href).toBe('/brand/run');
  });
});
