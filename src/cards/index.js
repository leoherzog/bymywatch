// Auto-registry: every card module in this directory exports
// `export const cards = [{ meta, create, update }, ...]`. We glob them all,
// flatten, and sort by meta.order.
//
// The glob is `./*.js` (ONE level) — NOT `./**/*.js`. One level naturally
// excludes the helpers in `./lib/`. Note `./*.js` DOES match this index.js
// itself, so the `path === './index.js'` skip below is load-bearing. If that
// skip were ever removed, the `Array.isArray(m.cards)` guard is the real
// backstop: index.js resolves mid-init with its `cards` export still undefined.
const modules = import.meta.glob('./*.js', { eager: true });

const collected = [];
for (const path in modules) {
  if (path === './index.js') continue; // skip self (the glob matches index.js)
  const m = modules[path];
  if (!Array.isArray(m.cards)) {
    if (import.meta.env?.DEV) console.warn(`[cards] ${path} has no \`cards\` array export; skipped`);
    continue;
  }
  for (const c of m.cards) {
    if (!c?.meta?.id || typeof c.create !== 'function' || typeof c.update !== 'function') {
      if (import.meta.env?.DEV) console.warn(`[cards] ${path} exported a malformed card`, c);
      continue;
    }
    collected.push(c);
  }
}

collected.sort((a, b) => (a.meta.order ?? 999) - (b.meta.order ?? 999));

export const cards = collected;
