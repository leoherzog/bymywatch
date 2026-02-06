import './greyline.css';
import { getSolarDeclination, getSubSolarLongitude, getEarthEmoji, getEmojiCenterLon } from './earth.js';

const DEG2RAD = Math.PI / 180;

let earthEl, shadowPath, shadowGroup, timeEl;
let userEmoji, userCenterLon;

export function create() {
  const article = document.createElement('article');
  article.id = 'greyLine';

  const header = document.createElement('header');
  timeEl = document.createElement('h2');
  timeEl.style.marginBottom = '0';
  timeEl.style.textAlign = 'center';
  header.appendChild(timeEl);
  article.appendChild(header);

  const chart = document.createElement('figure');
  chart.id = 'greyLineChart';

  earthEl = document.createElement('span');
  earthEl.className = 'grey-line-earth';
  earthEl.textContent = '\u{1F30D}';

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 100 100');
  svg.setAttribute('class', 'grey-line-overlay');

  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
  const clipPath = document.createElementNS('http://www.w3.org/2000/svg', 'clipPath');
  clipPath.setAttribute('id', 'grey-line-clip');
  const clipCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  clipCircle.setAttribute('cx', '50');
  clipCircle.setAttribute('cy', '50');
  clipCircle.setAttribute('r', '50');
  clipPath.appendChild(clipCircle);
  const filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
  filter.setAttribute('id', 'grey-line-blur');
  const blur = document.createElementNS('http://www.w3.org/2000/svg', 'feGaussianBlur');
  blur.setAttribute('stdDeviation', '3');
  filter.appendChild(blur);
  defs.appendChild(filter);

  defs.appendChild(clipPath);
  svg.appendChild(defs);

  shadowGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  shadowGroup.setAttribute('clip-path', 'url(#grey-line-clip)');

  shadowPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  shadowPath.setAttribute('fill', 'rgba(0, 0, 0, 0.35)');
  shadowPath.setAttribute('filter', 'url(#grey-line-blur)');
  shadowGroup.appendChild(shadowPath);
  svg.appendChild(shadowGroup);

  chart.appendChild(earthEl);
  chart.appendChild(svg);
  article.appendChild(chart);

  return article;
}

export function update({ zonedNow, utcNow, manuallySpecified }) {
  // Compute user's local emoji once (approximate longitude from UTC offset)
  if (!userEmoji) {
    const offsetHours = zonedNow.offsetNanoseconds / 3.6e12;
    const userLon = offsetHours * 15;
    userEmoji = getEarthEmoji(userLon);
    userCenterLon = getEmojiCenterLon(userEmoji);
  }

  const dayOfYear = utcNow.dayOfYear;
  const declination = getSolarDeclination(dayOfYear);
  const subSolarLon = getSubSolarLongitude(utcNow);

  let emoji, centerLon;
  if (manuallySpecified) {
    // Time travel: show the hemisphere facing the sun
    emoji = getEarthEmoji(subSolarLon);
    centerLon = getEmojiCenterLon(emoji);
  } else {
    // Real time: show the user's local hemisphere
    emoji = userEmoji;
    centerLon = userCenterLon;
  }
  earthEl.textContent = emoji;

  // Hour angle: angular distance from emoji center to sub-solar point (radians)
  let hDeg = subSolarLon - centerLon;
  if (hDeg > 180) hDeg -= 360;
  if (hDeg < -180) hDeg += 360;
  const h = hDeg * DEG2RAD;

  // Terminator geometry in orthographic projection.
  //
  // The path is drawn in an un-rotated frame where the terminator runs vertically
  // from (50,0) to (50,100).  A group rotation then tilts the whole shadow to
  // match the real terminator orientation (driven by declination + hour angle).
  //
  // In the un-rotated frame the sun is always to the LEFT, so the dark side is
  // always to the RIGHT.  Sweep flags are therefore constant.

  const cosH = Math.cos(h);
  const sinH = Math.sin(h);
  const cosDec = Math.cos(declination);
  const sinDec = Math.sin(declination);

  // Semi-minor axis of the projected terminator ellipse (semi-major = 50).
  const rx = 50 * Math.abs(cosDec * cosH);

  // SVG rotation: angle that maps the un-rotated vertical terminator onto the
  // actual terminator direction on the disk.
  // t1 is the math-convention angle (CCW from +x) where the terminator meets
  // the limb; the SVG rotation converts from "straight up" (90°) to t1.
  const t1 = Math.atan2(-cosDec * sinH, sinDec);
  const rotateDeg = 90 - t1 / DEG2RAD;

  let d;
  if (rx > 49) {
    // Terminator nearly coincides with the limb → negligible shadow
    d = '';
  } else {
    // Terminator arc (curves left, toward the sun) then straight lines extending
    // far beyond the clip circle on the dark side (right).  The clip-path on the
    // parent group provides a crisp limb edge, while the blur filter only softens
    // the terminator curve — the only edge that falls inside the circle.
    d = `M 50,0 A ${rx},50 0 0,1 50,100 L 200,100 L 200,0 Z`;
  }

  shadowPath.setAttribute('d', d);
  shadowGroup.setAttribute('transform', `rotate(${rotateDeg}, 50, 50)`);

  timeEl.textContent = zonedNow.toLocaleString('en-US', {
    'hour': 'numeric',
    'minute': 'numeric',
    'second': 'numeric',
    'timeZoneName': 'short',
  });
}
