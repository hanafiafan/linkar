import { describe, it, expect } from 'vitest';
import { getContent } from '../src/lib/content';

describe('content layer (seed fallback)', () => {
  it('returns approved hero copy from seed when no Sanity env', async () => {
    const c = await getContent();
    expect(c.home.hero.title).toBe('Menghubungkan komunitas, korporat, dan pemerintah dalam satu lingkar dampak.');
    expect(c.entities).toHaveLength(6);
    expect(c.programs).toHaveLength(0);
    expect(c.home.portfolio.titleTop).toBe('JEJAK');
  });
});
