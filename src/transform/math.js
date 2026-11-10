import { coeff, fmt, num, signed, subscript, superscript } from '../lib/format.js';

// Starting from f₀(x) = xⁿ, any stack of these transformations simplifies to
// f(x) = A·(p·x + q)ⁿ + B, so each function is stored as { n, A, p, q, B }.

export const TRANSFORMS = {
  shiftX: {
    defaultA: 1,
    apply: (f, a) => ({ ...f, q: f.q + f.p * a }),
    describe: (g, a) => `${g}(x${signed(a)})`,
  },
  scaleX: {
    defaultA: 2,
    apply: (f, a) => ({ ...f, p: f.p * a }),
    describe: (g, a) => `${g}(${fmt(a) === '0' ? '0' : `${coeff(a)}x`})`,
  },
  scaleY: {
    defaultA: 2,
    apply: (f, a) => ({ ...f, A: f.A * a, B: f.B * a }),
    describe: (g, a) => `${coeff(a)}${g}(x)`,
  },
  shiftY: {
    defaultA: 1,
    apply: (f, a) => ({ ...f, B: f.B + a }),
    describe: (g, a) => `${g}(x)${signed(a)}`,
  },
};

// Returns [f₀, f₁, …] for the given layers ({ type, a }).
export function compose(n, layers) {
  let f = { n, A: 1, p: 1, q: 0, B: 0 };
  const functions = [f];
  for (const { type, a } of layers) {
    f = TRANSFORMS[type].apply(f, a);
    functions.push(f);
  }
  return functions;
}

export function evaluate({ n, A, p, q, B }, x) {
  return A * (p * x + q) ** n + B;
}

// --- Formatting ---

export function name(i) {
  return `f${subscript(i)}`;
}

// "f₂(x) = 3·f₁(x)"
export function formatDefinition(i, { type, a }) {
  return `${name(i)}(x) = ${TRANSFORMS[type].describe(name(i - 1), a)}`;
}

// "f₂(x) = 3(x + 1)² − 2"
export function formatClosed(i, { n, A, p, q, B }) {
  const lhs = `${name(i)}(x) = `;
  if (n === 0 || fmt(A) === '0') return lhs + num(n === 0 ? A + B : B);

  const inner = fmt(p) === '0' ? num(q) : `${coeff(p)}x${signed(q)}`;
  const wrapped = inner === 'x' ? inner : `(${inner})`;
  const c = coeff(A);
  const term = n === 1 ? (c === '' ? inner : c + wrapped) : c + wrapped + superscript(n);
  return lhs + term + signed(B);
}
