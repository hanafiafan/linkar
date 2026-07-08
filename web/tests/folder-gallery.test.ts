import { describe, it, expect } from 'vitest';
import { computeSpreadLayout } from '../src/scripts/folder-gallery.js';

describe('computeSpreadLayout', () => {
  it('returns one position per photo', () => {
    expect(computeSpreadLayout(5)).toHaveLength(5);
  });

  it('spreads positions symmetrically around center (x sums to 0, rotation sums to 0)', () => {
    const layout = computeSpreadLayout(4, 90);
    const xSum = layout.reduce((sum, p) => sum + p.x, 0);
    const rotSum = layout.reduce((sum, p) => sum + p.rotation, 0);
    expect(xSum).toBeCloseTo(0, 10);
    expect(rotSum).toBeCloseTo(0, 10);
    expect(layout.every((p) => p.y === 0)).toBe(true);
  });
});
