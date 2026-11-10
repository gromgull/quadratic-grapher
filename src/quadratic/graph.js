import { createPlot } from '../lib/plot.js';
import { evaluate } from './math.js';

const COLORS = {
  curve: '#4a90e2',
  vertex: '#e2734a',
  root: '#2f9e6b',
};

export function createGraph(canvas) {
  const plot = createPlot(canvas);

  return {
    render(state) {
      plot.render(({ curve, dot }) => {
        curve((x) => evaluate(state, x), COLORS.curve);
        if (state.a !== 0) dot(state.h, state.k, COLORS.vertex);
        if (state.hasRoots) {
          dot(state.r1, 0, COLORS.root);
          dot(state.r2, 0, COLORS.root);
        }
      });
    },
  };
}
