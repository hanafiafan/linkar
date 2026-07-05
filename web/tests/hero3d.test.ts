import { describe, it, expect } from 'vitest';
import { groupPathsByColor, fitDistanceForSphere } from '../src/scripts/hero3d.js';

describe('groupPathsByColor', () => {
  it('groups paths under their color key', () => {
    const navyPath = { id: 'navy' };
    const orangePath = { id: 'orange' };
    const result = groupPathsByColor([
      { color: '#1F2B5B', path: navyPath },
      { color: '#F26A21', path: orangePath },
    ]);

    expect(result.size).toBe(2);
    expect(result.get('#1f2b5b')).toEqual([navyPath]);
    expect(result.get('#f26a21')).toEqual([orangePath]);
  });

  it('falls back to navy when a path has no fill color', () => {
    const path = { id: 'no-color' };
    const result = groupPathsByColor([{ path }]);

    expect(result.get('#1f2b5b')).toEqual([path]);
  });
});

describe('fitDistanceForSphere', () => {
  it('fits a sphere exactly at margin=1 (no extra room)', () => {
    // For a 90deg FOV, sin(45deg) = sqrt(2)/2, so distance = radius / (sqrt(2)/2) = radius*sqrt(2)
    const distance = fitDistanceForSphere(10, 90, 1);
    expect(distance).toBeCloseTo(10 * Math.sqrt(2), 5);
  });

  it('adds proportional margin so a larger radius or margin increases distance', () => {
    const base = fitDistanceForSphere(10, 35);
    expect(fitDistanceForSphere(20, 35)).toBeCloseTo(base * 2, 5);
    expect(fitDistanceForSphere(10, 35, 1.5)).toBeGreaterThan(base);
  });
});
