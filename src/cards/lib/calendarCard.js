import { simpleCard } from './simpleCard.js';

// Generator for "show today's date in calendar X" cards.
//
// `calendar` is a Temporal/CLDR calendar id passed to ZonedDateTime.withCalendar().
// `compute(zonedNow) => string` optionally overrides the default Temporal-native
// rendering, for schemes that are NOT real calendar ids (e.g. Holocene).
//
// Updates at day granularity: a key built from the calendar's own
// era/year/monthCode/day short-circuits the per-frame work.
//
// @param {{ id, title, calendar?, category?, wikipedia?, footnote?, order?, compute? }} config
// @returns {{ meta, create, update }}
export function calendarCard(config) {
  if (!config.calendar && !config.compute) {
    throw new Error(`calendarCard "${config.id}" needs a calendar or compute()`);
  }

  const meta = {
    id: config.id,
    title: config.title,
    category: config.category ?? 'calendars',
    wikipedia: config.wikipedia,
    order: config.order,
    footnote: config.footnote,
  };

  let card;
  let lastKey;

  return {
    meta,
    create() {
      card = simpleCard(meta);
      return card.article;
    },
    update({ zonedNow }) {
      // Day-granular key short-circuits before any string formatting.
      const d = (config.calendar ? zonedNow.withCalendar(config.calendar) : zonedNow).toPlainDate();
      // monthCode (not month) so leap months in lunisolar calendars stay distinct.
      const key = `${d.era ?? ''}:${d.year}:${d.monthCode}:${d.day}`;
      if (key === lastKey) return;
      lastKey = key;
      // Pass the SAME calendar as the date carries: with no calendar option Intl
      // defaults to the locale's (Gregorian), which conflicts with the date's
      // calendar and throws "Mismatching Calendars". dateStyle:'full' then renders
      // the era/year/month/day in that calendar.
      card.setValue(
        config.compute
          ? config.compute(zonedNow)
          : d.toLocaleString(undefined, { dateStyle: 'full', calendar: config.calendar })
      );
    },
  };
}
