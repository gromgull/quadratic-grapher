import { initQuadratic } from './quadratic/index.js';
import { initTransform } from './transform/index.js';

// Each tab is a <section class="tab-panel" data-panel="..."> plus a matching nav link.
const TOOLS = {
  quadratic: initQuadratic,
  transform: initTransform,
};

const tabs = [...document.querySelectorAll('[data-tab]')];
const panels = [...document.querySelectorAll('.tab-panel')];
const initialised = new Set();

function showTab() {
  const requested = location.hash.slice(1);
  const id = requested in TOOLS ? requested : Object.keys(TOOLS)[0];

  for (const panel of panels) panel.hidden = panel.dataset.panel !== id;
  for (const tab of tabs) tab.setAttribute('aria-selected', String(tab.dataset.tab === id));

  // Initialise lazily: canvases need a visible, laid-out panel.
  if (!initialised.has(id)) {
    TOOLS[id](document.querySelector(`[data-panel="${id}"]`));
    initialised.add(id);
  }
}

window.addEventListener('hashchange', showTab);
showTab();
