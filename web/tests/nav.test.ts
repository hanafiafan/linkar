import { describe, it, expect } from 'vitest';
import { buildNavLinks } from '../src/lib/nav';

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
