import { simpleCard } from './simpleCard.js';

// Generator for "show timescale Y" cards.
//
// `compute(timeState) => string` produces the display value. `granularity`
// 'second' (default) reuses the epochSeconds dirty-check; 'frame' recomputes
// every tick (for sub-second readouts).
//
// @param {{ id, title, category?, wikipedia?, footnote?, order?, granularity?, compute }} config
// @returns {{ meta, create, update }}
export function timescaleCard(config) {
  const meta = {
    id: config.id,
    title: config.title,
    category: config.category ?? 'timescales',
    wikipedia: config.wikipedia,
    order: config.order,
    footnote: config.footnote,
  };

  const granularity = config.granularity ?? 'second';
  if (granularity !== 'second' && granularity !== 'frame') {
    if (import.meta.env?.DEV) {
      console.warn(`timescaleCard "${config.id}": unknown granularity "${granularity}", defaulting to second`);
    }
  }
  // Per-frame only when explicitly opted in; anything else dirty-checks per second.
  const perFrame = granularity === 'frame';
  let card;
  let lastSecond = null;

  return {
    meta,
    create() {
      card = simpleCard(meta);
      return card.article;
    },
    update(timeState) {
      if (!perFrame) {
        if (timeState.epochSeconds === lastSecond) return;
        lastSecond = timeState.epochSeconds;
      }
      card.setValue(config.compute(timeState));
    },
  };
}
