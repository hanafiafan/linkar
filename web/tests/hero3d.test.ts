import { describe, it, expect } from 'vitest';
import { groupPathsByColor } from '../src/scripts/hero3d.js';

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
