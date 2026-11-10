import { fmt } from '../lib/format.js';
import { createPlot } from '../lib/plot.js';
import { TRANSFORMS, compose, evaluate, formatClosed, formatDefinition } from './math.js';

const PALETTE = ['#4a90e2', '#e2734a', '#2f9e6b', '#9b59b6', '#d4a017', '#e24a8d', '#17a2b8', '#7f8c8d'];
const color = (i) => PALETTE[i % PALETTE.length];

export function initTransform(root) {
  const plot = createPlot(root.querySelector('canvas'));
  const template = root.querySelector('[data-layer-template]');
  const list = root.querySelector('.layers');
  const base = root.querySelector('.layer[data-index="0"]');
  const nSlider = base.querySelector('input');

  let n = parseInt(nSlider.value, 10);
  // Each layer: { type, a, el } — el is its <li> in the list.
  const layers = [];

  function addLayer(type = 'shiftX') {
    const el = template.content.firstElementChild.cloneNode(true);
    const layer = { type, a: TRANSFORMS[type].defaultA, el };
    const select = el.querySelector('select');
    const slider = el.querySelector('input');
    select.value = type;
    slider.value = layer.a;

    select.addEventListener('change', () => {
      // Reset a, so e.g. a shift of 1 doesn't become a no-op stretch of 1.
      layer.type = select.value;
      layer.a = slider.value = TRANSFORMS[layer.type].defaultA;
      render();
    });
    slider.addEventListener('input', () => {
      layer.a = parseFloat(slider.value);
      render();
    });
    el.querySelector('[data-action="remove"]').addEventListener('click', () => {
      layers.splice(layers.indexOf(layer), 1);
      el.remove();
      render();
    });

    layers.push(layer);
    list.append(el);
    render();
  }

  function render() {
    const functions = compose(n, layers);

    base.querySelector('[data-definition]').textContent = formatClosed(0, functions[0]);
    base.querySelector('output').value = n;
    base.style.setProperty('--color', color(0));

    layers.forEach((layer, idx) => {
      const i = idx + 1;
      const { el } = layer;
      el.style.setProperty('--color', color(i));
      el.querySelector('[data-definition]').textContent = formatDefinition(i, layer);
      el.querySelector('output').value = fmt(layer.a);
    });

    plot.render(({ curve }) => {
      // Earlier functions thinner, the final result on top and thickest.
      functions.forEach((f, i) => {
        const last = i === functions.length - 1;
        curve((x) => evaluate(f, x), color(i), last ? 3 : 1.75);
      });
    });
  }

  nSlider.addEventListener('input', () => {
    n = parseInt(nSlider.value, 10);
    render();
  });
  root.querySelector('[data-action="add"]').addEventListener('click', () => addLayer());

  addLayer();
}
