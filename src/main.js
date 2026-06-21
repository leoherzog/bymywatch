import { Temporal } from 'temporal-polyfill';
import './style.css';

import { cards } from './cards/index.js';

// --- Time state ---
const localTimeZone = Temporal.Now.timeZoneId();
const epoch = Temporal.Instant.from('1970-01-01T00:00:00Z');

let now, zonedNow, utcNow;
let manuallySpecified = false;
let timeMultiplier = 0;
let lastFrameTime = performance.now();

function deriveZoned() {
  zonedNow = now.toZonedDateTimeISO(localTimeZone);
  utcNow = now.toZonedDateTimeISO('UTC');
}

function updateTimeFromNow() {
  now = Temporal.Now.instant();
  deriveZoned();
}

updateTimeFromNow();

// --- DOM references (header controls) ---
const timeInput = document.getElementById('time');
const timeTravel = document.getElementById('timetravel');
const timeTravelContainer = document.getElementById('timetravel-container');
const container = document.getElementById('card-container');

// --- Layout: two columns. The orrery (Earth's revolution around the Sun ->
// dates) anchors the Date column; the grey line (Earth's rotation -> times)
// anchors the Time column. Each column packs the rest of its cards into a grid. ---
const COLUMNS = [
  { anchorId: 'solarSystem', categories: ['calendars'] },
  { anchorId: 'greyLine', categories: ['standard', 'timescales'] },
];

// --- Initialize cards into their columns ---
const placed = new Set();

function mountCard(card, grid, isAnchor) {
  const el = card.create();
  if (isAnchor) el.classList.add('anchor');
  if (isAnchor || card.meta.fullWidth) el.classList.add('full-span');
  grid.appendChild(el);
  placed.add(card.meta.id);
}

// Categories claimed by a column, plus 'solar' (the anchors). Anything else
// falls through to the safety net below and is dev-warned.
const KNOWN = new Set(COLUMNS.flatMap((c) => c.categories).concat(['solar']));

for (const col of COLUMNS) {
  const grid = document.createElement('div');
  grid.className = 'card-grid';
  container.appendChild(grid);

  // Anchor (orrery / grey line) leads the column at full width.
  const anchor = cards.find((c) => c.meta.id === col.anchorId);
  if (anchor) mountCard(anchor, grid, true);

  // Then this column's categories, in global meta.order (cards is pre-sorted).
  for (const card of cards) {
    if (placed.has(card.meta.id)) continue;
    if (col.categories.includes(card.meta.category)) mountCard(card, grid, false);
  }
}

// Safety net: any card not claimed by a column lands in the last grid.
const lastGrid = container.querySelector('.card-grid:last-child');
for (const card of cards) {
  if (placed.has(card.meta.id)) continue;
  if (import.meta.env?.DEV && !KNOWN.has(card.meta.category)) {
    console.warn(`[card] ${card.meta.id} has unmapped category "${card.meta.category}"; using safety net`);
  }
  mountCard(card, lastGrid, false);
}

// --- Build timeState ---
function buildTimeState() {
  return {
    now,
    zonedNow,
    utcNow,
    daysSinceEpoch: Number(now.since(epoch, { largestUnit: 'hour' }).total('days')),
    epochSeconds: Math.floor(now.epochMilliseconds / 1000),
    manuallySpecified,
  };
}

// --- Tick ---
function tick(msSincePageLoad) {
  const deltaTime = (msSincePageLoad - lastFrameTime) / 1000;
  lastFrameTime = msSincePageLoad;

  if (!manuallySpecified) {
    updateTimeFromNow();
    timeInput.value = zonedNow.toPlainDateTime().toString().slice(0, 19);
  } else {
    const speedValue = timeTravel.value;
    if (speedValue !== '50') {
      if (speedValue < 45) {
        timeMultiplier = -Math.exp((45 - speedValue) / 5);
      } else if (speedValue > 55) {
        timeMultiplier = Math.exp((speedValue - 55) / 5);
      } else {
        timeMultiplier = 0;
      }

      const adjustment = Math.round(timeMultiplier * deltaTime * 1000 * 3600);
      now = now.add({ milliseconds: adjustment });
      deriveZoned();

      timeInput.value = zonedNow.toPlainDateTime().toString().slice(0, 19);
    }
  }

  const timeState = buildTimeState();
  for (const card of cards) {
    try {
      card.update(timeState);
    } catch (err) {
      if (import.meta.env?.DEV) console.warn(`[card] ${card.meta.id} update failed`, err);
    }
  }
}

// --- Event listeners ---
function onManuallySpecifiedTime() {
  if (!timeInput.value) {
    return;
  }

  let plainDateTime;
  try {
    plainDateTime = Temporal.PlainDateTime.from(timeInput.value);
  } catch {
    return;
  }

  manuallySpecified = true;
  now = plainDateTime.toZonedDateTime(localTimeZone).toInstant();
  deriveZoned();
  tick(performance.now());
}

timeInput.addEventListener('change', function () {
  onManuallySpecifiedTime();
  if (manuallySpecified) showTooltip();
});

function showTooltip() {
  timeTravelContainer.setAttribute('data-tooltip', 'Double-Click to Return to Now');
  timeTravelContainer.setAttribute('data-placement', 'bottom');
}

timeTravel.addEventListener('input', function () {
  if (!manuallySpecified) {
    manuallySpecified = true;
    lastFrameTime = performance.now();
    updateTimeFromNow();
    showTooltip();
  }
});

timeTravel.addEventListener('change', function () {
  timeTravel.value = 50;
  timeMultiplier = 0;
});

timeTravel.addEventListener('dblclick', function () {
  manuallySpecified = false;
  timeTravel.value = 50;
  timeMultiplier = 0;
  updateTimeFromNow();
  timeTravelContainer.removeAttribute('data-tooltip');
  timeTravelContainer.removeAttribute('data-placement');
});

// --- Animation loop ---
lastFrameTime = performance.now();
tick(performance.now());

function animationLoop(timestamp) {
  tick(timestamp);
  requestAnimationFrame(animationLoop);
}
requestAnimationFrame(animationLoop);
