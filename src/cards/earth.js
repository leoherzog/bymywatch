// Shared Earth / solar-position utilities used by orrery.js and greyline.js

const DEG2RAD = Math.PI / 180;

// Globe emoji center longitudes (degrees East)
const EARTH_EMOJIS = [
  { emoji: '\u{1F30D}', centerLon: 25 },    // 🌍 Europe-Africa
  { emoji: '\u{1F30E}', centerLon: -100 },   // 🌎 Americas
  { emoji: '\u{1F30F}', centerLon: 135 },    // 🌏 Asia-Australia
];

/** Smallest signed angle between two longitudes, in degrees [-180, 180]. */
function angleDist(a, b) {
  let d = ((b - a + 540) % 360) - 180;
  return d;
}

/**
 * Solar declination (radians) from day-of-year (1–366).
 * Simple cosine approximation, accurate to ~0.5°.
 */
export function getSolarDeclination(dayOfYear) {
  return -23.44 * DEG2RAD * Math.cos((2 * Math.PI / 365) * (dayOfYear + 10));
}

/**
 * Sub-solar longitude (degrees, –180 to +180) from a Temporal ZonedDateTime in UTC.
 * This is the longitude where the sun is directly overhead.
 */
export function getSubSolarLongitude(utcNow) {
  const hours = utcNow.hour + utcNow.minute / 60 + utcNow.second / 3600;
  return (12 - hours) * 15;  // ranges from +180 (UTC 00:00) to –180 (UTC 24:00)
}

/**
 * Pick the Earth globe emoji whose center longitude is closest to the
 * sub-solar longitude (i.e. the hemisphere currently facing the sun).
 */
export function getEarthEmoji(subSolarLon) {
  let best = EARTH_EMOJIS[0];
  let bestDist = 360;
  for (const entry of EARTH_EMOJIS) {
    const d = Math.abs(angleDist(subSolarLon, entry.centerLon));
    if (d < bestDist) {
      bestDist = d;
      best = entry;
    }
  }
  return best.emoji;
}

/**
 * Return the center longitude (degrees) of the given Earth emoji.
 */
export function getEmojiCenterLon(emoji) {
  for (const entry of EARTH_EMOJIS) {
    if (entry.emoji === emoji) return entry.centerLon;
  }
  return 0;
}
