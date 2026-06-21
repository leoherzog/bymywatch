// Factory for the common "header + value + footnote" card shape shared by most
// single-value cards (UTC, .beat, calendars, timescales, ...).
//
// Returns handles so callers can augment the result (e.g. .beat inserts a
// <progress> before the footer). The value <h2> is appended as a DIRECT child
// of <article> so the global `article > h2 { text-align: center }` rule applies.

function externalLink(href, text) {
  const a = document.createElement('a');
  a.href = href;
  a.target = '_blank';
  a.rel = 'noopener noreferrer';
  a.textContent = text;
  return a;
}

/**
 * @param {{ id: string, title: string, category?: string, wikipedia?: string, order?: number, footnote?: string|Node }} meta
 * @returns {{ article, footer, setValue }}
 */
export function simpleCard(meta) {
  const article = document.createElement('article');
  article.id = meta.id;

  const header = document.createElement('header');
  if (meta.wikipedia) {
    header.appendChild(externalLink(meta.wikipedia, meta.title));
  } else {
    header.textContent = meta.title;
  }

  const valueEl = document.createElement('h2');

  article.append(header, valueEl);

  let footer = null;
  if (meta.footnote) {
    footer = document.createElement('footer');
    const small = document.createElement('small');
    if (typeof meta.footnote === 'string') {
      small.textContent = meta.footnote;
    } else {
      small.append(meta.footnote);
    }
    footer.appendChild(small);
    article.appendChild(footer);
  }

  let last;
  function setValue(str) {
    if (str !== last) {
      last = str;
      valueEl.textContent = str;
    }
  }

  return { article, footer, setValue };
}
