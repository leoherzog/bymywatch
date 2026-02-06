import { Temporal } from 'temporal-polyfill';
import './gregorian.css';

// Locale-aware first day of week (1=Mon..7=Sun, same as Temporal dayOfWeek)
const locale = new Intl.Locale(navigator.language);
const weekInfo = locale.getWeekInfo?.() ?? locale.weekInfo;
const FIRST_DAY = weekInfo?.firstDay ?? 7;

// Build locale-aware weekday headers starting from the locale's first day.
// 1970-01-04 is a Sunday (Temporal dayOfWeek 7); offset to reach FIRST_DAY.
const DAY_ABBRS = Array.from({ length: 7 }, (_, i) => {
  const date = Temporal.PlainDate.from('1970-01-04').add({ days: (FIRST_DAY % 7) + i });
  return {
    narrow: date.toLocaleString(undefined, { weekday: 'narrow' }),
    short: date.toLocaleString(undefined, { weekday: 'short' }),
    full: date.toLocaleString(undefined, { weekday: 'long' }),
  };
});

// --- Month view elements ---
let monthViewEl, monthNameEl, monthYearEl, monthTbody;

// --- Year view elements ---
let yearViewEl, yearHeadingEl;
const yearTbodies = [];
const yearMonthHeadings = [];

// --- Shared ---
let footerEl;
let showFullYear = false;
let lastYear = 0, lastMonth = 0, lastDay = 0;

function buildWeekdayHeader(format) {
  const headRow = document.createElement('tr');
  const key = format === 'narrow' ? 'narrow' : 'short';
  for (const day of DAY_ABBRS) {
    const th = document.createElement('th');
    th.scope = 'col';
    const abbrEl = document.createElement('abbr');
    abbrEl.title = day.full;
    abbrEl.textContent = day[key];
    th.appendChild(abbrEl);
    headRow.appendChild(th);
  }
  return headRow;
}

export function create() {
  const article = document.createElement('article');
  article.id = 'localDate';

  // Header (click target for toggle)
  const header = document.createElement('header');
  const headerLabel = document.createTextNode('Gregorian Calendar ');
  const toggleIndicator = document.createElement('span');
  toggleIndicator.className = 'toggle-indicator';
  toggleIndicator.textContent = '\u25b6';
  header.appendChild(headerLabel);
  header.appendChild(toggleIndicator);
  header.addEventListener('click', () => {
    showFullYear = !showFullYear;
    monthViewEl.hidden = showFullYear;
    yearViewEl.hidden = !showFullYear;
    toggleIndicator.textContent = showFullYear ? '\u25bc' : '\u25b6';
  });
  article.appendChild(header);

  // --- Month view (default) ---
  monthViewEl = document.createElement('div');
  monthViewEl.className = 'month-view';

  const monthHgroup = document.createElement('hgroup');
  monthNameEl = document.createElement('h2');
  monthYearEl = document.createElement('p');
  monthHgroup.appendChild(monthNameEl);
  monthHgroup.appendChild(monthYearEl);
  monthViewEl.appendChild(monthHgroup);

  const monthTable = document.createElement('table');
  const monthThead = document.createElement('thead');
  monthThead.appendChild(buildWeekdayHeader('short'));
  monthTable.appendChild(monthThead);
  monthTbody = document.createElement('tbody');
  monthTable.appendChild(monthTbody);
  monthViewEl.appendChild(monthTable);

  article.appendChild(monthViewEl);

  // --- Year view (hidden) ---
  yearViewEl = document.createElement('div');
  yearViewEl.className = 'year-view';
  yearViewEl.hidden = true;

  const yearHgroup = document.createElement('hgroup');
  yearHeadingEl = document.createElement('h2');
  yearHgroup.appendChild(yearHeadingEl);
  yearViewEl.appendChild(yearHgroup);

  const gridContainer = document.createElement('div');
  gridContainer.className = 'year-grid';

  for (let m = 0; m < 12; m++) {
    const section = document.createElement('section');

    const heading = document.createElement('h3');
    yearMonthHeadings[m] = heading;
    section.appendChild(heading);

    const table = document.createElement('table');
    const thead = document.createElement('thead');
    thead.appendChild(buildWeekdayHeader('narrow'));
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    yearTbodies[m] = tbody;
    table.appendChild(tbody);

    section.appendChild(table);
    gridContainer.appendChild(section);
  }

  yearViewEl.appendChild(gridContainer);
  article.appendChild(yearViewEl);

  // Footer (shared)
  const footer = document.createElement('footer');
  footerEl = document.createElement('small');
  footer.appendChild(footerEl);
  article.appendChild(footer);

  return article;
}

function buildMonthGrid(year, month, today) {
  monthTbody.innerHTML = '';

  const firstOfMonth = Temporal.PlainDate.from({ year, month, day: 1 });
  const daysInMonth = firstOfMonth.daysInMonth;
  const startDow = (firstOfMonth.dayOfWeek - FIRST_DAY + 7) % 7;

  let row = document.createElement('tr');

  for (let i = 0; i < startDow; i++) {
    row.appendChild(document.createElement('td'));
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const cell = document.createElement('td');
    const time = document.createElement('time');
    time.dateTime = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
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
      monthTbody.appendChild(row);
      if (d < daysInMonth) row = document.createElement('tr');
    }
  }

  const remaining = (startDow + daysInMonth) % 7;
  if (remaining !== 0) {
    for (let i = remaining; i < 7; i++) {
      row.appendChild(document.createElement('td'));
    }
    monthTbody.appendChild(row);
  }
}

function buildAllYearGrids(year, todayMonth, todayDay) {
  for (let m = 1; m <= 12; m++) {
    const tbody = yearTbodies[m - 1];
    tbody.innerHTML = '';

    const firstOfMonth = Temporal.PlainDate.from({ year, month: m, day: 1 });
    const daysInMonth = firstOfMonth.daysInMonth;

    yearMonthHeadings[m - 1].textContent = firstOfMonth.toLocaleString(undefined, { month: 'long' });

    const startDow = (firstOfMonth.dayOfWeek - FIRST_DAY + 7) % 7;

    let row = document.createElement('tr');

    for (let i = 0; i < startDow; i++) {
      row.appendChild(document.createElement('td'));
    }

    const isCurrentMonth = (m === todayMonth);

    for (let d = 1; d <= daysInMonth; d++) {
      const cell = document.createElement('td');
      const time = document.createElement('time');
      time.dateTime = `${year}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      time.textContent = d;

      if (isCurrentMonth && d === todayDay) {
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

    const remaining = (startDow + daysInMonth) % 7;
    if (remaining !== 0) {
      for (let i = remaining; i < 7; i++) {
        row.appendChild(document.createElement('td'));
      }
      tbody.appendChild(row);
    }
  }
}

function swapMark(tbody, newDay) {
  const oldMark = tbody.querySelector('mark');
  if (oldMark) {
    const time = oldMark.firstChild;
    oldMark.parentNode.replaceChild(time, oldMark);
  }
  if (newDay) {
    const times = tbody.querySelectorAll('time');
    for (const t of times) {
      if (Number(t.textContent) === newDay) {
        const mark = document.createElement('mark');
        t.parentNode.replaceChild(mark, t);
        mark.appendChild(t);
        break;
      }
    }
  }
}

export function update({ zonedNow }) {
  const year = zonedNow.year;
  const month = zonedNow.month;
  const day = zonedNow.day;

  if (year === lastYear && month === lastMonth && day === lastDay) return;

  // --- Update month view ---
  monthNameEl.textContent = zonedNow.toLocaleString(undefined, { month: 'long' });
  monthYearEl.textContent = year;

  if (year !== lastYear || month !== lastMonth) {
    buildMonthGrid(year, month, day);
  } else {
    swapMark(monthTbody, day);
  }

  // --- Update year view ---
  if (year !== lastYear) {
    yearHeadingEl.textContent = year;
    buildAllYearGrids(year, month, day);
  } else {
    swapMark(yearTbodies[lastMonth - 1], null);
    swapMark(yearTbodies[month - 1], day);
  }

  // --- Footer ---
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
