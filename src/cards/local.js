let timeEl;

export function create() {
  const article = document.createElement('article');
  article.id = 'your';

  const header = document.createElement('header');
  header.textContent = 'Your Local Time';
  article.appendChild(header);

  timeEl = document.createElement('h2');
  timeEl.id = 'yourTime';
  article.appendChild(timeEl);

  return article;
}

export function update({ zonedNow }) {
  timeEl.textContent = zonedNow.toLocaleString('en-US', {
    'hour': 'numeric',
    'minute': 'numeric',
    'second': 'numeric',
    'timeZoneName': 'short',
  });
}
