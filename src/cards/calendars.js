import { calendarCard } from './lib/calendarCard.js';

// "Today's date in calendar X" cards. Each entry maps directly to a
// calendarCard config; the Holocene scheme isn't a real calendar id, so it
// supplies a `compute` override built from the Gregorian/ISO date.
const configs = [
  { id: 'hebrew', title: 'Hebrew Calendar', calendar: 'hebrew', wikipedia: 'https://en.wikipedia.org/wiki/Hebrew_calendar', footnote: 'Lunisolar — a leap month is added in 7 of every 19 years.', order: 100 },
  { id: 'islamic', title: 'Islamic (Hijri) Calendar', calendar: 'islamic-umalqura', wikipedia: 'https://en.wikipedia.org/wiki/Islamic_calendar', footnote: 'Purely lunar. Its year is ~11 days shorter than the solar one.', order: 110 },
  { id: 'persian', title: 'Solar Hijri (Jalali) Calendar', calendar: 'persian', wikipedia: 'https://en.wikipedia.org/wiki/Solar_Hijri_calendar', footnote: 'Solar — the year begins at the northern spring equinox.', order: 120 },
  { id: 'indian', title: 'Indian National Calendar', calendar: 'indian', wikipedia: 'https://en.wikipedia.org/wiki/Indian_national_calendar', footnote: 'India’s official civil calendar; its era starts in 78 CE.', order: 130 },
  { id: 'buddhist', title: 'Buddhist Calendar', calendar: 'buddhist', wikipedia: 'https://en.wikipedia.org/wiki/Buddhist_calendar', footnote: 'Thai solar calendar — runs 543 years ahead of the Gregorian year.', order: 140 },
  { id: 'japanese', title: 'Japanese Calendar', calendar: 'japanese', wikipedia: 'https://en.wikipedia.org/wiki/Japanese_era_name', footnote: 'Years are counted within the reigning emperor’s era (now Reiwa).', order: 150 },
  { id: 'coptic', title: 'Coptic Calendar', calendar: 'coptic', wikipedia: 'https://en.wikipedia.org/wiki/Coptic_calendar', footnote: 'Egyptian Christian calendar of 13 months; its era starts in 284 CE.', order: 160 },
  { id: 'roc', title: 'Minguo (ROC) Calendar', calendar: 'roc', wikipedia: 'https://en.wikipedia.org/wiki/Republic_of_China_calendar', footnote: 'Used in Taiwan; year 1 is 1912, the Republic’s founding.', order: 170 },
  { id: 'chinese', title: 'Chinese Calendar', calendar: 'chinese', wikipedia: 'https://en.wikipedia.org/wiki/Chinese_calendar', footnote: 'Lunisolar — years cycle through 12 zodiac animals and 10 stems.', order: 180 },
  {
    id: 'holocene',
    title: 'Holocene Calendar',
    wikipedia: 'https://en.wikipedia.org/wiki/Holocene_calendar',
    footnote: 'Adds 10,000 years to the Gregorian year, near civilization’s dawn.',
    order: 190,
    compute: (z) => {
      const d = z.toPlainDate();
      const weekday = d.toLocaleString(undefined, { weekday: 'long' });
      const month = d.toLocaleString(undefined, { month: 'long' });
      return `${weekday}, ${month} ${d.day}, ${d.year + 10000} HE`;
    },
  },
];

export const cards = configs.map(calendarCard);
