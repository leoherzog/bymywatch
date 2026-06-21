import { timescaleCard } from './lib/timescaleCard.js';
import { julianDate, modifiedJulianDate, gmstHours } from './lib/astronomy.js';

// Wall-clock HH:MM:SS (UTC) of an instant
function clockUTC(instant) {
  return instant.toZonedDateTimeISO('UTC').toPlainTime().toString({ smallestUnit: 'second' });
}

// hours (float) -> HH:MM:SS
function hoursToHMS(h) {
  const total = Math.floor(((h % 24) + 24) % 24 * 3600);
  const s = total % 60, m = Math.floor(total / 60) % 60, hr = Math.floor(total / 3600);
  const p = (n) => String(n).padStart(2, '0');
  return `${p(hr)}:${p(m)}:${p(s)}`;
}

export const cards = [
  timescaleCard({
    id: 'unix',
    title: 'Unix Time',
    wikipedia: 'https://en.wikipedia.org/wiki/Unix_time',
    footnote: 'Used by most computers. Seconds elapsed since 1970-01-01 00:00 UTC, the Unix epoch.',
    order: 200,
    compute: (ts) => `${ts.epochSeconds.toLocaleString('en-US')} s`,
  }),
  timescaleCard({
    id: 'tai',
    title: 'International Atomic Time (TAI)',
    wikipedia: 'https://en.wikipedia.org/wiki/International_Atomic_Time',
    footnote: 'The steady atomic timescale UTC is built from; unlike UTC it never inserts leap seconds (UTC = TAI − 37s).',
    order: 210,
    compute: ({ now }) => clockUTC(now.add({ seconds: 37 })),
  }),
  timescaleCard({
    id: 'gps',
    title: 'GPS Time',
    wikipedia: 'https://en.wikipedia.org/wiki/Global_Positioning_System#Timekeeping',
    footnote: 'Runs continuously so receivers can fix position — GPS skips leap seconds, leaving it UTC + 18s.',
    order: 220,
    compute: ({ now }) => clockUTC(now.add({ seconds: 18 })),
  }),
  timescaleCard({
    id: 'tt',
    title: 'Terrestrial Time (TT)',
    wikipedia: 'https://en.wikipedia.org/wiki/Terrestrial_Time',
    footnote: 'The timescale almanacs use to predict the Sun, Moon, and planets; TT = TAI + 32.184s.',
    order: 230,
    compute: ({ now }) => clockUTC(now.add({ milliseconds: 69184 })),
  }),
  timescaleCard({
    id: 'tdb',
    title: 'Barycentric Dynamical Time (TDB)',
    wikipedia: 'https://en.wikipedia.org/wiki/Barycentric_Dynamical_Time',
    footnote: 'For Solar-System ephemerides: it ticks at the barycenter, so relativity offsets it from TT by under 2ms.',
    order: 240,
    compute: ({ now }) => {
      const jd = julianDate(now);
      const g = (357.53 + 0.9856003 * (jd - 2451545.0)) * Math.PI / 180;
      const offsetMs = (0.001658 * Math.sin(g) + 0.000014 * Math.sin(2 * g)) * 1000;
      return clockUTC(now.add({ milliseconds: Math.round(69184 + offsetMs) }));
    },
  }),
  timescaleCard({
    id: 'ut1',
    title: 'Universal Time (UT1)',
    wikipedia: 'https://en.wikipedia.org/wiki/Universal_Time',
    footnote: 'Tracks Earth’s actual, uneven rotation (for aiming telescopes); UT1 = UTC + DUT1, observed by the IERS (≈0 here).',
    order: 250,
    compute: ({ now }) => clockUTC(now),
  }),
  timescaleCard({
    id: 'julianDate',
    title: 'Julian Date',
    wikipedia: 'https://en.wikipedia.org/wiki/Julian_day',
    footnote: 'MJD = JD − 2400000.5 — a shorter, midnight-based count used in astronomy, satellite tracking, and geodesy.',
    order: 260,
    compute: ({ now }) => `JD ${julianDate(now).toFixed(5)} · MJD ${modifiedJulianDate(now).toFixed(5)}`,
  }),
  timescaleCard({
    id: 'sidereal',
    title: 'Sidereal Time (GMST)',
    wikipedia: 'https://en.wikipedia.org/wiki/Sidereal_time',
    footnote: '“Star time” — which stars are overhead, used to aim telescopes. A sidereal day is ~4 min shorter than a solar one.',
    order: 270,
    compute: ({ now }) => hoursToHMS(gmstHours(now)),
  }),
];
