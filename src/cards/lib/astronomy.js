// Shared astronomical time conversions. Temporal-based — takes a Temporal.Instant
// (timeState.now) and works from its epochMilliseconds. No Date objects.

const UNIX_EPOCH_JD = 2440587.5;   // Julian Date at 1970-01-01T00:00:00Z
const MJD_OFFSET = 2400000.5;      // JD - MJD
const J2000_JD = 2451545.0;        // Julian Date at J2000.0 (2000-01-01T12:00 TT)
const MS_PER_DAY = 86400000;

/** Julian Date for a Temporal.Instant. */
export function julianDate(instant) {
  return UNIX_EPOCH_JD + instant.epochMilliseconds / MS_PER_DAY;
}

/** Modified Julian Date for a Temporal.Instant. */
export function modifiedJulianDate(instant) {
  return julianDate(instant) - MJD_OFFSET;
}

/**
 * Greenwich Mean Sidereal Time in hours, [0, 24).
 * USNO low-precision formula (Circular 163). Fed UTC rather than UT1, which
 * introduces an error of |DUT1| (< 0.9 s) — acceptable for a display.
 */
export function gmstHours(instant) {
  const d = julianDate(instant) - J2000_JD;
  const gmst = 18.697374558 + 24.06570982441908 * d;
  return ((gmst % 24) + 24) % 24;
}
