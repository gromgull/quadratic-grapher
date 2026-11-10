import { describe, expect, it } from 'vitest';
import { compose, evaluate, formatClosed, formatDefinition } from './math.js';

// Reference implementation: wrap plain functions, no closed form.
const WRAPPERS = {
  shiftX: (f, a) => (x) => f(x + a),
  scaleX: (f, a) => (x) => f(a * x),
  scaleY: (f, a) => (x) => a * f(x),
  shiftY: (f, a) => (x) => f(x) + a,
};

describe('compose', () => {
  it('closed form matches nested function application', () => {
    const layers = [
      { type: 'shiftX', a: 1.5 },
      { type: 'scaleY', a: -2 },
      { type: 'scaleX', a: 0.5 },
      { type: 'shiftY', a: 3 },
      { type: 'shiftX', a: -1 },
      { type: 'scaleY', a: 0.3 },
    ];
    for (const n of [-2, -1, 0, 1, 2, 3]) {
      const functions = compose(n, layers);
      let ref = (x) => x ** n;
      layers.forEach((layer, i) => {
        ref = WRAPPERS[layer.type](ref, layer.a);
        for (const x of [-3.3, -1, 0.25, 2, 4.7]) {
          expect(evaluate(functions[i + 1], x)).toBeCloseTo(ref(x), 8);
        }
      });
    }
  });
});

describe('formatting', () => {
  it('definitions', () => {
    expect(formatDefinition(1, { type: 'shiftX', a: 2 })).toBe('f₁(x) = f₀(x + 2)');
    expect(formatDefinition(2, { type: 'scaleX', a: -1 })).toBe('f₂(x) = f₁(−x)');
    expect(formatDefinition(3, { type: 'scaleY', a: 0.5 })).toBe('f₃(x) = 0.5f₂(x)');
    expect(formatDefinition(4, { type: 'shiftY', a: -3 })).toBe('f₄(x) = f₃(x) − 3');
  });

  it('closed forms', () => {
    const [f0, f1, f2, f3] = compose(2, [
      { type: 'shiftX', a: 1 },
      { type: 'scaleY', a: 3 },
      { type: 'shiftY', a: -2 },
    ]);
    expect(formatClosed(0, f0)).toBe('f₀(x) = x²');
    expect(formatClosed(1, f1)).toBe('f₁(x) = (x + 1)²');
    expect(formatClosed(2, f2)).toBe('f₂(x) = 3(x + 1)²');
    expect(formatClosed(3, f3)).toBe('f₃(x) = 3(x + 1)² − 2');
  });

  it('special exponents', () => {
    expect(formatClosed(0, compose(-1, [])[0])).toBe('f₀(x) = x⁻¹');
    expect(formatClosed(1, compose(1, [{ type: 'scaleX', a: 2 }])[1])).toBe('f₁(x) = 2x');
    expect(formatClosed(1, compose(1, [{ type: 'scaleY', a: 2 }])[1])).toBe('f₁(x) = 2x');
    expect(formatClosed(1, compose(0, [{ type: 'shiftY', a: 2 }])[1])).toBe('f₁(x) = 3');
  });
});
