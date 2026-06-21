import { timescaleCard } from './lib/timescaleCard.js';

const footnote = document.createDocumentFragment();
const gmtLink = document.createElement('a');
gmtLink.target = '_blank';
gmtLink.rel = 'noopener noreferrer';
gmtLink.href = 'https://en.wikipedia.org/wiki/Greenwich_Mean_Time';
gmtLink.textContent = 'GMT';
footnote.append('Which is actually a different thing than Greenwich Mean Time (', gmtLink, ')!');

const TIME_FORMAT = { hour: 'numeric', minute: 'numeric', second: 'numeric', timeZoneName: 'short' };

export const cards = [
  timescaleCard({
    id: 'utc',
    title: 'Coordinated Universal Time (UTC)',
    category: 'standard',
    wikipedia: 'https://en.wikipedia.org/wiki/Coordinated_Universal_Time',
    order: 40,
    footnote,
    compute: ({ utcNow }) => utcNow.toLocaleString('en-US', TIME_FORMAT),
  }),
];
