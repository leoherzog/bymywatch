import { Temporal } from 'temporal-polyfill';
import './calendar.css';

// Build locale-aware weekday headers (Sun=0 .. Sat=6)
// 1970-01-04 is a Sunday (Temporal dayOfWeek 7)
const DAY_ABBRS = Array.from({ length: 7 }, (_, i) => {
  const date = Temporal.PlainDate.from('1970-01-04').add({ days: i });
  return {
    abbr: date.toLocaleString(undefined, { weekday: 'short' }),
    full: date.toLocaleString(undefined, { weekday: 'long' }),
  };
});

let monthEl, yearEl, tbody, footerEl;
let lastYear = 0, lastMonth = 0, lastDay = 0;

export function create() {
  const article = document.createElement('article');
  article.id = 'localDate';

  // Header
  const header = document.createElement('header');
  header.textContent = 'Your Local Date';
  article.appendChild(header);

  const hgroup = document.createElement('hgroup');
  monthEl = document.createElement('h2');
  yearEl = document.createElement('p');
  hgroup.appendChild(monthEl);
  hgroup.appendChild(yearEl);
  article.appendChild(hgroup);

  // Table
  const table = document.createElement('table');

  const thead = document.createElement('thead');
  const headRow = document.createElement('tr');
  for (const { abbr, full } of DAY_ABBRS) {
    const th = document.createElement('th');
    th.scope = 'col';
    const abbrEl = document.createElement('abbr');
    abbrEl.title = full;
    abbrEl.textContent = abbr;
    th.appendChild(abbrEl);
    headRow.appendChild(th);
  }
  thead.appendChild(headRow);
  table.appendChild(thead);

  tbody = document.createElement('tbody');
  table.appendChild(tbody);

  article.appendChild(table);

  // Footer
  const footer = document.createElement('footer');
  footerEl = document.createElement('small');
  footer.appendChild(footerEl);
  article.appendChild(footer);

  return article;
}

function buildGrid(zonedNow) {
  tbody.innerHTML = '';

  const year = zonedNow.year;
  const month = zonedNow.month;
  const today = zonedNow.day;
  const daysInMonth = zonedNow.daysInMonth;

  // Temporal dayOfWeek: 1=Mon..7=Sun; convert to 0=Sun..6=Sat
  const firstOfMonth = zonedNow.with({ day: 1 });
  const startDow = firstOfMonth.dayOfWeek % 7;

  let row = document.createElement('tr');

  // Leading empty cells
  for (let i = 0; i < startDow; i++) {
    row.appendChild(document.createElement('td'));
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const cell = document.createElement('td');
    const time = document.createElement('time');
    const iso = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    time.dateTime = iso;
    time.textContent = d;

    if (d === today) {
      const mark = document.createElement('mark');
      mark.appendChild(time);
      cell.appendChild(mark);
    } else {
      cell.appendChild(time);
    }

    row.appendChild(cell);

    if ((startDow + d) % 7 === 0) {
      tbody.appendChild(row);
      if (d < daysInMonth) row = document.createElement('tr');
    }
  }

  // Trailing empty cells to complete the last row
  const remaining = (startDow + daysInMonth) % 7;
  if (remaining !== 0) {
    for (let i = remaining; i < 7; i++) {
      row.appendChild(document.createElement('td'));
    }
    tbody.appendChild(row);
  }
}

export function update({ zonedNow }) {
  const year = zonedNow.year;
  const month = zonedNow.month;
  const day = zonedNow.day;

  if (year === lastYear && month === lastMonth && day === lastDay) return;

  monthEl.textContent = zonedNow.toLocaleString(undefined, { month: 'long' });
  yearEl.textContent = year;

  if (year !== lastYear || month !== lastMonth) {
    buildGrid(zonedNow);
  } else {
    // Same month, different day — swap <mark>
    const oldMark = tbody.querySelector('mark');
    if (oldMark) {
      const time = oldMark.firstChild;
      oldMark.parentNode.replaceChild(time, oldMark);
    }
    const times = tbody.querySelectorAll('time');
    for (const t of times) {
      if (Number(t.textContent) === day) {
        const mark = document.createElement('mark');
        t.parentNode.replaceChild(mark, t);
        mark.appendChild(t);
        break;
      }
    }
  }

  const dayOfYear = zonedNow.dayOfYear;
  const daysInYear = zonedNow.daysInYear;
  const weekOfYear = zonedNow.weekOfYear;

  footerEl.innerHTML = '';
  footerEl.append(
    'Day ',
    Object.assign(document.createElement('strong'), { textContent: dayOfYear }),
    ` of ${daysInYear} · Week `,
    Object.assign(document.createElement('strong'), { textContent: weekOfYear }),
  );

  lastYear = year;
  lastMonth = month;
  lastDay = day;
}
