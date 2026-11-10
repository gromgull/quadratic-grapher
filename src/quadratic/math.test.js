import { describe, expect, it } from 'vitest';
import {
  createState,
  fromFactored,
  fromStandard,
  fromVertex,
  formatFactored,
  formatStandard,
  formatVertex,
} from './math.js';

const close = (s, expected) => {
  for (const [key, value] of Object.entries(expected)) expect(s[key]).toBeCloseTo(value);
};

describe('form conversions', () => {
  it('standard → vertex and roots', () => {
    const s = createState();
    Object.assign(s, { a: 2, b: -4, c: -6 });
    fromStandard(s);
    close(s, { h: 1, k: -8 });
    expect(s.hasRoots).toBe(true);
    expect([s.r1, s.r2].sort()).toEqual([-1, 3]);
  });

  it('values beyond slider ranges are not clamped', () => {
    const s = createState();
    Object.assign(s, { a: 0.1, b: 20, c: 0 });
    fromStandard(s);
    close(s, { h: -100, k: -1000 });
  });

  it('vertex → standard', () => {
    const s = createState();
    Object.assign(s, { a: -1, h: 2, k: 3 });
    fromVertex(s);
    close(s, { b: 4, c: -1 });
  });

  it('factored → standard and vertex', () => {
    const s = createState();
    Object.assign(s, { a: 1, r1: 2, r2: -4 });
    fromFactored(s);
    close(s, { b: 2, c: -8, h: -1, k: -9 });
  });

  it('no real roots', () => {
    const s = createState();
    Object.assign(s, { a: 1, b: 0, c: 1 });
    fromStandard(s);
    expect(s.hasRoots).toBe(false);
    expect(formatFactored(s)).toBe('No real roots');
  });

  it('keeps r1/r2 identity stable when roots move', () => {
    const s = createState();
    Object.assign(s, { a: 1, r1: -3, r2: 2 });
    fromFactored(s);
    s.c += 0.5;
    fromStandard(s);
    expect(s.r1).toBeLessThan(0);
    expect(s.r2).toBeGreaterThan(0);
  });

  it('vertex survives a passing through zero', () => {
    const s = createState();
    Object.assign(s, { a: 1, h: 2, k: 1 });
    fromVertex(s);
    s.a = 0;
    fromVertex(s);
    close(s, { b: 0, c: 1, h: 2, k: 1 });
  });
});

describe('formatting', () => {
  it('standard form', () => {
    expect(formatStandard({ a: 1, b: 0, c: -1 })).toBe('y = x² − 1');
    expect(formatStandard({ a: -2.5, b: 3, c: 0 })).toBe('y = −2.5x² + 3x');
    expect(formatStandard({ a: 0, b: -2, c: 1 })).toBe('y = −2x + 1');
    expect(formatStandard({ a: 0, b: 0, c: 0 })).toBe('y = 0');
  });

  it('vertex form', () => {
    expect(formatVertex({ a: 1, h: 0, k: -1 })).toBe('y = x² − 1');
    expect(formatVertex({ a: 2, h: -1.5, k: 3 })).toBe('y = 2(x + 1.5)² + 3');
    expect(formatVertex({ a: 0, h: 1, k: 1 })).toBe('Not a parabola (a = 0)');
  });

  it('factored form', () => {
    expect(formatFactored({ a: 1, r1: 1, r2: -1, hasRoots: true })).toBe('y = (x − 1)(x + 1)');
    expect(formatFactored({ a: 3, r1: 0, r2: 2, hasRoots: true })).toBe('y = 3x(x − 2)');
    expect(formatFactored({ a: 1, r1: 2, r2: 2, hasRoots: true })).toBe('y = (x − 2)²');
  });
});
