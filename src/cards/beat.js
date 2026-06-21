import { simpleCard } from './lib/simpleCard.js';

const footnote = document.createDocumentFragment();
const beatLabel = document.createElement('strong');
beatLabel.textContent = '.beat';
footnote.append('Also known as ', beatLabel, ' time.');

const meta = {
  id: 'beat',
  title: 'Swatch Internet Time',
  category: 'standard',
  wikipedia: 'https://en.wikipedia.org/wiki/Swatch_Internet_Time',
  order: 50,
  footnote,
};

let card, progressEl;
let lastBeatCentis = -1;

function create() {
  card = simpleCard(meta);

  progressEl = document.createElement('progress');
  progressEl.id = 'beatTimeTimeline';
  progressEl.max = 1000;
  card.article.insertBefore(progressEl, card.footer);

  return card.article;
}

function update({ utcNow }) {
  const bmtSeconds = (((utcNow.hour + 1) % 24) * 3600) + (utcNow.minute * 60) + utcNow.second + (utcNow.millisecond / 1000);
  const beat = (bmtSeconds / 86.4) % 1000;
  const beatCentis = Math.floor(beat * 100);
  if (beatCentis === lastBeatCentis) return;
  lastBeatCentis = beatCentis;

  card.setValue('@' + beat.toFixed(2) + ' .beats');
  progressEl.value = beat;
}

export const cards = [{ meta, create, update }];
