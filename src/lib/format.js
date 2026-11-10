// Number formatting for equations shown to the user.

// Round to 2 decimals, dropping trailing zeros and "-0".
export function fmt(n) {
  const r = Math.round(n * 100) / 100;
  return (Object.is(r, -0) ? 0 : r).toString();
}

// fmt with a typographic minus.
export function num(n) {
  return fmt(n).replace('-', '−');
}

// " + 3" / " − 3", or "" when the value rounds to zero.
export function signed(n, suffix = '') {
  if (fmt(n) === '0') return '';
  return `${n < 0 ? ' − ' : ' + '}${fmt(Math.abs(n))}${suffix}`;
}

// Coefficient in front of a term: 1 → "", −1 → "−", 2.5 → "2.5".
export function coeff(a) {
  const f = fmt(a);
  return f === '1' ? '' : f === '-1' ? '−' : num(a);
}

const SUPERSCRIPT = '⁰¹²³⁴⁵⁶⁷⁸⁹';
const SUBSCRIPT = '₀₁₂₃₄₅₆₇₈₉';

export function superscript(n) {
  return String(n).replace('-', '⁻').replace(/\d/g, (d) => SUPERSCRIPT[d]);
}

export function subscript(n) {
  return String(n).replace(/\d/g, (d) => SUBSCRIPT[d]);
}
