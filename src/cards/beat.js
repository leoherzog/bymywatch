let timeEl, progressEl;
let lastEpochSeconds = -1;

export function create() {
  const article = document.createElement('article');
  article.id = 'beat';

  const header = document.createElement('header');
  const link = document.createElement('a');
  link.href = 'https://en.wikipedia.org/wiki/Swatch_Internet_Time';
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.textContent = 'Swatch Internet Time';
  header.appendChild(link);
  article.appendChild(header);

  timeEl = document.createElement('h2');
  timeEl.id = 'beatTime';
  article.appendChild(timeEl);

  progressEl = document.createElement('progress');
  progressEl.id = 'beatTimeTimeline';
  progressEl.max = 1000;
  article.appendChild(progressEl);

  const footer = document.createElement('footer');
  const small = document.createElement('small');
  small.append('Also known as ');
  const strong = document.createElement('strong');
  strong.textContent = '.beat';
  small.append(strong, ' time.');
  footer.appendChild(small);
  article.appendChild(footer);

  return article;
}

export function update({ utcNow, epochSeconds }) {
  if (epochSeconds === lastEpochSeconds) return;
  lastEpochSeconds = epochSeconds;

  const bmtSeconds = (((utcNow.hour + 1) % 24) * 3600) + (utcNow.minute * 60) + utcNow.second;
  const beat = (bmtSeconds / 86.4) % 1000;
  timeEl.textContent = '@' + beat.toFixed(2) + ' .beats';
  progressEl.value = beat;
}
