import { describe, it, expect } from 'vitest';
import { MORPH_FROM, MORPH_TO, morphTargets } from '../src/scripts/morph';

describe('clip-path trapezoid morph', () => {
  it('has equal point counts on both ends', () => {
    const fromPoints = MORPH_FROM.split(',').length;
    const toPoints = MORPH_TO.split(',').length;
    expect(fromPoints).toBe(toPoints);
  });

  it('finds elements with data-morph in a fixture', () => {
    document.body.innerHTML = `
      <div data-morph></div>
      <div></div>
      <button data-morph></button>
    `;
    expect(morphTargets(document).length).toBe(2);
  });
});
