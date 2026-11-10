import { fmt } from '../lib/format.js';
import { createGraph } from './graph.js';
import {
  createState,
  formatFactored,
  formatStandard,
  formatVertex,
  fromFactored,
  fromStandard,
  fromVertex,
} from './math.js';

const UPDATERS = { standard: fromStandard, vertex: fromVertex, factored: fromFactored };

export function initQuadratic(root) {
  const state = createState();
  const graph = createGraph(root.querySelector('canvas'));
  const sliders = [...root.querySelectorAll('input[data-param]')];
  const outputs = Object.fromEntries(
    [...root.querySelectorAll('output[data-param]')].map((el) => [el.dataset.param, el]),
  );
  const equations = {
    standard: root.querySelector('[data-equation="standard"]'),
    vertex: root.querySelector('[data-equation="vertex"]'),
    factored: root.querySelector('[data-equation="factored"]'),
  };

  // While a = 0 there is no vertex, so edits to b/c leave h/k stale.
  let vertexStale = false;

  function onInput(event) {
    const slider = event.target;
    const param = slider.dataset.param;
    state[param] = parseFloat(slider.value);

    if (param === 'a') {
      // Changing a keeps the vertex fixed, unless it no longer matches b/c.
      (vertexStale ? fromStandard : fromVertex)(state);
      vertexStale = false;
    } else {
      UPDATERS[slider.dataset.form](state);
      if (state.a === 0) vertexStale = true;
    }
    render(slider);
  }

  function render(activeSlider) {
    for (const slider of sliders) {
      const param = slider.dataset.param;
      // Sliders clamp to their range; the output always shows the true value.
      if (slider !== activeSlider) slider.value = state[param];
      outputs[param].value = fmt(state[param]);

      const form = slider.dataset.form;
      const disabled =
        (form === 'vertex' && state.a === 0) || (form === 'factored' && !state.hasRoots);
      slider.disabled = disabled;
      slider.closest('.control').classList.toggle('disabled', disabled);
    }

    equations.standard.textContent = formatStandard(state);
    equations.vertex.textContent = formatVertex(state);
    equations.factored.textContent = formatFactored(state);
    graph.render(state);
  }

  for (const slider of sliders) slider.addEventListener('input', onInput);
  render();
}
