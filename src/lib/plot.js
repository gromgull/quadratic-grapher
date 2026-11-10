// A square canvas showing -RANGE..RANGE on both axes, with a grid.
// Resizes with its CSS box and draws sharply on HiDPI screens.

export const RANGE = 10;

const COLORS = {
  grid: '#eef1f7',
  axis: '#b8c0cc',
  label: '#8a94a3',
};

export function createPlot(canvas) {
  const ctx = canvas.getContext('2d');
  let drawContent = null;

  function draw() {
    const size = canvas.clientWidth;
    if (!drawContent || !size) return;
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

    drawContent({
      curve(fn, color, width = 2.5) {
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        ctx.beginPath();
        let prev = null;
        for (let px = 0; px <= size; px++) {
          const y = fn((px - size / 2) / scale);
          if (!Number.isFinite(y)) {
            prev = null;
            continue;
          }
          const [, py] = toPx(0, y);
          // Jumping from above the canvas to below it (or back) in one
          // pixel is an asymptote, not a steep line: lift the pen.
          const jump = prev !== null && ((prev < 0 && py > size) || (prev > size && py < 0));
          // Clamp far off-screen points to keep canvas paths well-behaved.
          const cy = Math.max(-size, Math.min(2 * size, py));
          if (prev === null || jump) ctx.moveTo(px, cy);
          else ctx.lineTo(px, cy);
          prev = py;
        }
        ctx.stroke();
      },

      dot(x, y, color) {
        const [px, py] = toPx(x, y);
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(px, py, 5, 0, 2 * Math.PI);
        ctx.fill();
      },
    });
  }

  new ResizeObserver(draw).observe(canvas);

  return {
    // fn receives { curve, dot } and is re-run on every resize.
    render(fn) {
      drawContent = fn;
      draw();
    },
  };
}
