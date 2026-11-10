import { evaluate } from './math.js';

const RANGE = 10; // the graph shows -RANGE..RANGE on both axes

const COLORS = {
  grid: '#eef1f7',
  axis: '#b8c0cc',
  label: '#8a94a3',
  curve: '#4a90e2',
  vertex: '#e2734a',
  root: '#2f9e6b',
};

// Sets up a canvas that resizes with its CSS box and redraws on demand.
export function createGraph(canvas) {
  const ctx = canvas.getContext('2d');
  let state = null;

  function draw() {
    if (!state) return;
    const size = canvas.clientWidth;
    const dpr = window.devicePixelRatio || 1;
    if (canvas.width !== Math.round(size * dpr)) {
      canvas.width = canvas.height = Math.round(size * dpr);
    }

    const scale = size / (2 * RANGE);
    const toPx = (x, y) => [size / 2 + x * scale, size / 2 - y * scale];

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, size, size);

    // Grid
    ctx.lineWidth = 1;
    ctx.strokeStyle = COLORS.grid;
    ctx.beginPath();
    for (let i = -RANGE; i <= RANGE; i++) {
      const p = size / 2 + i * scale;
      ctx.moveTo(p, 0);
      ctx.lineTo(p, size);
      ctx.moveTo(0, p);
      ctx.lineTo(size, p);
    }
    ctx.stroke();

    // Axes
    ctx.strokeStyle = COLORS.axis;
    ctx.beginPath();
    ctx.moveTo(0, size / 2);
    ctx.lineTo(size, size / 2);
    ctx.moveTo(size / 2, 0);
    ctx.lineTo(size / 2, size);
    ctx.stroke();

    // Axis labels every 5 units
    ctx.fillStyle = COLORS.label;
    ctx.font = '11px system-ui, sans-serif';
    for (let i = -RANGE + 5; i < RANGE; i += 5) {
      if (i === 0) continue;
      const [x] = toPx(i, 0);
      const [, y] = toPx(0, i);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(i, x, size / 2 + 4);
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(i, size / 2 + 4, y);
    }

    // Curve
    ctx.strokeStyle = COLORS.curve;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (let px = 0; px <= size; px++) {
      const x = (px - size / 2) / scale;
      const [, py] = toPx(x, evaluate(state, x));
      // Clamp far off-screen points to keep canvas paths well-behaved.
      const y = Math.max(-size, Math.min(2 * size, py));
      if (px === 0) ctx.moveTo(px, y);
      else ctx.lineTo(px, y);
    }
    ctx.stroke();

    // Vertex and roots
    const dot = (x, y, color) => {
      const [px, py] = toPx(x, y);
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(px, py, 5, 0, 2 * Math.PI);
      ctx.fill();
    };
    if (state.a !== 0) dot(state.h, state.k, COLORS.vertex);
    if (state.hasRoots) {
      dot(state.r1, 0, COLORS.root);
      dot(state.r2, 0, COLORS.root);
    }
  }

  new ResizeObserver(draw).observe(canvas);

  return {
    render(newState) {
      state = newState;
      draw();
    },
  };
}
