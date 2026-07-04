import { describe, it, expect } from 'vitest';
import { buildOdometer } from '../src/scripts/odometer';

describe('odometer builder', () => {
  it('builds a digit column per numeral and static spans for others', () => {
    const el = document.createElement('div');
    el.dataset.value = '1.400';
    buildOdometer(el);
    expect(el.querySelectorAll('.od-col')).toHaveLength(4);      // 1,4,0,0
    expect(el.querySelectorAll('.od-static')).toHaveLength(1);   // "."
    const firstCol = el.querySelector('.od-col')!;
    expect(firstCol.querySelectorAll('.od-digit')).toHaveLength(10);
    expect(firstCol.getAttribute('data-target')).toBe('1');
  });
  it('keeps suffix like + static', () => {
    const el = document.createElement('div');
    el.dataset.value = '20+';
    buildOdometer(el);
    expect(el.querySelectorAll('.od-col')).toHaveLength(2);
    expect(el.querySelector('.od-static')!.textContent).toBe('+');
  });
  it('sets a resting transform so correct digit shows without animation', () => {
    const el = document.createElement('div');
    el.dataset.value = '64';
    buildOdometer(el);
    const cols = el.querySelectorAll<HTMLElement>('.od-col');
    expect(cols[0].style.transform).toBe('translateY(-6em)');
    expect(cols[1].style.transform).toBe('translateY(-4em)');
  });
});
