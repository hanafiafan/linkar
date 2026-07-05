import { describe, it, expect } from 'vitest';
import { wrapIndex, signedOffset, fanTransform } from '../src/scripts/card-stack.js';

describe('wrapIndex', () => {
  it('wraps positive overflow', () => {
    expect(wrapIndex(6, 6)).toBe(0);
    expect(wrapIndex(7, 6)).toBe(1);
  });

  it('wraps negative values', () => {
    expect(wrapIndex(-1, 6)).toBe(5);
    expect(wrapIndex(-7, 6)).toBe(5);
  });

  it('returns 0 for non-positive length', () => {
    expect(wrapIndex(3, 0)).toBe(0);
  });
});

describe('signedOffset', () => {
  it('returns 0 for the active card itself', () => {
    expect(signedOffset(2, 2, 6)).toBe(0);
  });

  it('takes the minimal-magnitude wrap (wraps backward near the end)', () => {
    // len=6, active=0: card 5 is one step behind (-1), not five steps ahead.
    expect(signedOffset(5, 0, 6)).toBe(-1);
    expect(signedOffset(1, 0, 6)).toBe(1);
  });

  it('handles active near the end wrapping forward', () => {
    expect(signedOffset(0, 5, 6)).toBe(1);
  });
});

describe('fanTransform', () => {
  it('centers and lifts the active card', () => {
    const t = fanTransform(0);
    expect(t.x).toBe(0);
    expect(t.scale).toBe(1);
    expect(t.hidden).toBe(false);
    expect(t.y).toBeLessThan(0); // lifted
  });

  it('fans neighbors to either side with reduced scale', () => {
    const left = fanTransform(-1);
    const right = fanTransform(1);
    expect(left.x).toBeLessThan(0);
    expect(right.x).toBeGreaterThan(0);
    expect(left.scale).toBeLessThan(1);
    expect(right.rotateZ).toBeGreaterThan(0);
  });

  it('hides cards beyond maxVisible', () => {
    const t = fanTransform(3, { maxVisible: 2 });
    expect(t.hidden).toBe(true);
    expect(t.opacity).toBe(0);
  });

  it('respects a custom maxVisible for mobile (fewer visible)', () => {
    expect(fanTransform(2, { maxVisible: 1 }).hidden).toBe(true);
    expect(fanTransform(1, { maxVisible: 1 }).hidden).toBe(false);
  });
});
