# Maths Tools

Interactive maths tools, built as a static site.

- **Quadratic** – graph a quadratic equation and adjust the coefficients in standard, vertex or factored form.
- **Transformations** – start from f₀(x) = xⁿ and stack transformations (f(x + a), f(a·x), a·f(x), f(x) + a),
  seeing every intermediate function on one graph.

Originally 100% vibe coded with Gemini 2.5 :D

## Development

```sh
npm install
npm run dev      # dev server with hot reload
npm test         # unit tests
npm run build    # static build in dist/
npm run preview  # serve the build locally
```

Pushes to `main` are built and deployed to GitHub Pages by `.github/workflows/deploy.yml`
(repo Settings → Pages → Source must be set to "GitHub Actions").

## Adding a tool

1. Add a `<section class="tab-panel card" data-panel="mytool">` to `index.html` and a matching
   `<a href="#mytool" data-tab="mytool">` link in the nav.
2. Create `src/mytool/index.js` exporting an `init(root)` function.
3. Register it in `TOOLS` in `src/main.js`.
