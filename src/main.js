import { Temporal } from 'temporal-polyfill';
import './style.css';

import * as orrery from './cards/orrery.js';
import * as localTime from './cards/local.js';
import * as utcTime from './cards/utc.js';
import * as beatTime from './cards/beat.js';

// --- Time state ---
const localTimeZone = Temporal.Now.timeZoneId();
const epoch = Temporal.Instant.from('1970-01-01T00:00:00Z');

let now, zonedNow, utcNow;
let manuallySpecified = false;
let timeMultiplier = 0;
let lastFrameTime = performance.now();

function updateTimeFromNow() {
  now = Temporal.Now.instant();
  zonedNow = now.toZonedDateTimeISO(localTimeZone);
  utcNow = now.toZonedDateTimeISO('UTC');
}

updateTimeFromNow();

// --- Cards ---
const cards = [orrery, localTime, utcTime, beatTime];

// --- DOM references (header controls) ---
const timeInput = document.getElementById('time');
const timeTravel = document.getElementById('timetravel');
const container = document.getElementById('card-container');

// --- Initialize cards ---
for (const card of cards) {
  container.appendChild(card.create());
}

// --- Build timeState ---
function buildTimeState() {
  return {
    now,
    zonedNow,
    utcNow,
    daysSinceEpoch: Number(now.since(epoch, { largestUnit: 'hour' }).total('days')),
  };
}

// --- Tick ---
function tick(msSincePageLoad) {
  const deltaTime = (msSincePageLoad - lastFrameTime) / 1000;
  lastFrameTime = msSincePageLoad;

  if (!manuallySpecified) {
    updateTimeFromNow();
    timeInput.value = zonedNow.toPlainDateTime().toString().slice(0, 16);
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
      zonedNow = now.toZonedDateTimeISO(localTimeZone);
      utcNow = now.toZonedDateTimeISO('UTC');

      timeInput.value = zonedNow.toPlainDateTime().toString().slice(0, 16);
    }
  }

  const timeState = buildTimeState();
  for (const card of cards) {
    card.update(timeState);
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
  zonedNow = now.toZonedDateTimeISO(localTimeZone);
  utcNow = now.toZonedDateTimeISO('UTC');
  tick(performance.now());
}

timeInput.addEventListener('change', onManuallySpecifiedTime);

timeTravel.addEventListener('input', function () {
  if (!manuallySpecified) {
    manuallySpecified = true;
    lastFrameTime = performance.now();
    updateTimeFromNow();
  }
});

timeTravel.addEventListener('change', function () {
  timeTravel.value = 50;
  timeMultiplier = 0;
});

document.getElementById('now').addEventListener('click', function () {
  manuallySpecified = false;
  timeTravel.value = 50;
  timeMultiplier = 0;
  updateTimeFromNow();
});

// --- Animation loop ---
lastFrameTime = performance.now();
tick(performance.now());

function animationLoop(timestamp) {
  tick(timestamp);
  requestAnimationFrame(animationLoop);
}
requestAnimationFrame(animationLoop);
