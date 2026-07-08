import { describe, it, expect } from 'vitest';
import { validateForm } from '../src/scripts/form';

describe('contact form validation', () => {
  it('flags empty required fields and bad email', () => {
    expect(validateForm({ name: '', org: 'X', email: 'not-email', wa: '08', need: '' }))
      .toEqual(['name', 'email', 'need']);
  });
  it('passes a valid submission', () => {
    expect(validateForm({ name: 'Budi', org: 'Pemda DIY', email: 'budi@jogja.go.id', wa: '0812345', need: 'Pelatihan UMKM' })).toEqual([]);
  });
});
