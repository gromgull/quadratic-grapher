import { coeff, fmt, signed } from '../lib/format.js';

// Pure maths for y = ax² + bx + c and its vertex / factored forms.
// The state object holds all seven parameters; each update function takes
// one form as the source of truth and recomputes the others.

export function createState() {
  const state = { a: 1, b: 0, c: -1, h: 0, k: 0, r1: 0, r2: 0, hasRoots: false };
  fromStandard(state);
  return state;
}

export function fromStandard(s) {
  // h and k are left untouched when a = 0 so the vertex survives
  // dragging a through zero.
  if (s.a !== 0) {
    s.h = -s.b / (2 * s.a);
    s.k = s.c - (s.b * s.b) / (4 * s.a);
  }
  updateRoots(s);
}

export function fromVertex(s) {
  s.b = -2 * s.a * s.h;
  s.c = s.a * s.h * s.h + s.k;
  updateRoots(s);
}

export function fromFactored(s) {
  s.b = -s.a * (s.r1 + s.r2);
  s.c = s.a * s.r1 * s.r2;
  s.h = (s.r1 + s.r2) / 2;
  s.k = (-s.a * (s.r1 - s.r2) ** 2) / 4;
  s.hasRoots = s.a !== 0;
}

function updateRoots(s) {
  const disc = s.b * s.b - 4 * s.a * s.c;
  s.hasRoots = s.a !== 0 && disc >= 0;
  if (!s.hasRoots) return;

  const sq = Math.sqrt(disc);
  const x1 = (-s.b + sq) / (2 * s.a);
  const x2 = (-s.b - sq) / (2 * s.a);
  // Keep r1/r2 attached to whichever root they were closest to, so the
  // sliders don't swap places as the curve moves.
  const keep = Math.abs(x1 - s.r1) + Math.abs(x2 - s.r2);
  const swap = Math.abs(x2 - s.r1) + Math.abs(x1 - s.r2);
  [s.r1, s.r2] = keep <= swap ? [x1, x2] : [x2, x1];
}

export function evaluate(s, x) {
  return s.a * x * x + s.b * x + s.c;
}

// --- Formatting ---

// "(x − 2)" / "(x + 2)" / "x"
function shifted(root) {
  return fmt(root) === '0' ? 'x' : `(x${root > 0 ? ' − ' : ' + '}${fmt(Math.abs(root))})`;
}

export function formatStandard({ a, b, c }) {
  if (fmt(a) === '0') {
    const rest = `${signed(b, 'x')}${signed(c)}`.replace(/^ \+ /, '').replace(/^ − /, '−');
    return `y = ${rest || '0'}`;
  }
  return `y = ${coeff(a)}x²${signed(b, 'x')}${signed(c)}`;
}

export function formatVertex({ a, h, k }) {
  if (fmt(a) === '0') return 'Not a parabola (a = 0)';
  const sq = fmt(h) === '0' ? 'x²' : `${shifted(h)}²`;
  return `y = ${coeff(a)}${sq}${signed(k)}`;
}

export function formatFactored({ a, r1, r2, hasRoots }) {
  if (fmt(a) === '0') return 'Not a parabola (a = 0)';
  if (!hasRoots) return 'No real roots';
  const f1 = shifted(r1);
  const f2 = shifted(r2);
  return `y = ${coeff(a)}${f1 === f2 ? `${f1}²` : f1 + f2}`;
}
