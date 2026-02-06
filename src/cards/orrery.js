import './orrery.css';
import { getSubSolarLongitude, getEarthEmoji } from './earth.js';

const PLANETS = {
  mercury: { period: 87.96935, startAngle: 296.20, distanceMultiplier: 0.5, tooltip: 'Mercury', symbol: '\u263F' },
  venus: { period: 224.70080, startAngle: 166.59, distanceMultiplier: 0.75, tooltip: 'Venus', symbol: '\u2640' },
  us: { period: 365.25636, startAngle: 0, distanceMultiplier: 1 },
  mars: { period: 686.97125, startAngle: 279.92, distanceMultiplier: 1.25, tooltip: 'Mars', symbol: '\u2642' },
  jupiter: { period: 4332.5906, startAngle: 104.12, distanceMultiplier: 1.5, tooltip: 'Jupiter', symbol: '\u2643' },
  saturn: { period: 10759.2225, startAngle: 297.57, distanceMultiplier: 1.75, tooltip: 'Saturn', symbol: '\u2644' },
  uranus: { period: 30688.4546, startAngle: 85.48, distanceMultiplier: 2, tooltip: 'Uranus', symbol: '\u2645' },
  neptune: { period: 60181.5878, startAngle: 138.52, distanceMultiplier: 2.25, tooltip: 'Neptune', symbol: '\u2646' },
};

const MOON_PERIOD = 29.5305;
const START_LUNAR_AGE = 15.66;
const MOON_ORBIT_RADIUS = 20;

const MOON_PHASES = [
  { threshold: 1.84566, emoji: '\u{1F311}' },
  { threshold: 5.53699, emoji: '\u{1F312}' },
  { threshold: 9.22831, emoji: '\u{1F313}' },
  { threshold: 12.91963, emoji: '\u{1F314}' },
  { threshold: 16.61096, emoji: '\u{1F315}' },
  { threshold: 20.30228, emoji: '\u{1F316}' },
  { threshold: 23.99361, emoji: '\u{1F317}' },
  { threshold: 27.68493, emoji: '\u{1F318}' },
  { threshold: 29.53, emoji: '\u{1F311}' },
];

let chart, earth, moonEl, planetEls, orbitEls, dateEl;

export function create() {
  const article = document.createElement('article');
  article.id = 'solarSystem';

  const header = document.createElement('header');
  dateEl = document.createElement('h2');
  header.appendChild(dateEl);
  article.appendChild(header);

  chart = document.createElement('figure');
  chart.id = 'solarSystemChart';

  const sun = document.createElement('span');
  sun.id = 'sun';
  sun.textContent = '\u2600\uFE0F';
  chart.appendChild(sun);

  orbitEls = {};
  planetEls = {};
  for (const [key, data] of Object.entries(PLANETS)) {
    const orbit = document.createElement('div');
    orbit.className = 'orbit';
    chart.appendChild(orbit);
    orbitEls[key] = orbit;

    if (key === 'us') {
      const us = document.createElement('span');
      us.id = 'us';
      earth = document.createElement('span');
      earth.id = 'earth';
      earth.textContent = '\u{1F30D}';
      moonEl = document.createElement('span');
      moonEl.id = 'moon';
      moonEl.textContent = '\u{1F314}';
      us.appendChild(earth);
      us.appendChild(moonEl);
      chart.appendChild(us);
      planetEls[key] = us;
    } else {
      const span = document.createElement('span');
      span.id = key;
      if (data.tooltip) span.dataset.tooltip = data.tooltip;
      span.textContent = data.symbol;
      chart.appendChild(span);
      planetEls[key] = span;
    }
  }

  article.appendChild(chart);
  return article;
}

export function update({ daysSinceEpoch, zonedNow, utcNow }) {
  dateEl.textContent = zonedNow.toLocaleString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const chartSize = chart.offsetWidth;
  const baseDistance = chartSize / 5;

  for (const [key, data] of Object.entries(PLANETS)) {
    const degreesPerDay = 360 / data.period;
    const currentAngle = Math.round((data.startAngle + daysSinceEpoch * degreesPerDay) % 360) + 90;
    const distance = baseDistance * data.distanceMultiplier;
    const diameter = distance * 2;
    orbitEls[key].style.width = orbitEls[key].style.height = diameter + 'px';
    const el = planetEls[key];
    if (el) {
      el.style.transform = `translate(-50%, -50%) rotate(${-currentAngle}deg) translateX(${distance}px) rotate(${currentAngle}deg)`;
    }
  }

  // Earth emoji — show the hemisphere facing the sun
  earth.textContent = getEarthEmoji(getSubSolarLongitude(utcNow));

  // Moon phase
  const currentPhase = (daysSinceEpoch + START_LUNAR_AGE) % MOON_PERIOD;
  let moonEmoji = '\u{1F31B}';
  for (const phase of MOON_PHASES) {
    if (currentPhase < phase.threshold) {
      moonEmoji = phase.emoji;
      break;
    }
  }
  moonEl.textContent = moonEmoji;

  // Moon orbit
  const moonPhaseAngle = (currentPhase / MOON_PERIOD) * 360;
  moonEl.style.transform = `rotate(${-moonPhaseAngle}deg) translate(${MOON_ORBIT_RADIUS}px)`;
}
