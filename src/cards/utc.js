let timeEl;

export function create() {
  const article = document.createElement('article');
  article.id = 'utc';

  const header = document.createElement('header');
  header.append('Universal Coordinated Time (');
  const utcLink = document.createElement('a');
  utcLink.href = 'https://en.wikipedia.org/wiki/Coordinated_Universal_Time';
  utcLink.target = '_blank';
  utcLink.rel = 'noopener noreferrer';
  utcLink.textContent = 'UTC';
  header.append(utcLink, ')');
  article.appendChild(header);

  timeEl = document.createElement('h2');
  timeEl.id = 'utcTime';
  article.appendChild(timeEl);

  const footer = document.createElement('footer');
  const small = document.createElement('small');
  small.append('Which is actually a different thing than Greenwich Mean Time (');
  const gmtLink = document.createElement('a');
  gmtLink.href = 'https://en.wikipedia.org/wiki/Greenwich_Mean_Time';
  gmtLink.target = '_blank';
  gmtLink.rel = 'noopener noreferrer';
  gmtLink.textContent = 'GMT';
  small.append(gmtLink, ')!');
  footer.appendChild(small);
  article.appendChild(footer);

  return article;
}

export function update({ utcNow }) {
  timeEl.textContent = utcNow.toLocaleString('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    timeZoneName: 'short',
  });
}
