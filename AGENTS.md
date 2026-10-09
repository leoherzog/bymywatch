# AGENTS.md

This file provides guidance to Claude Code, OpenAI Codex, Gemini, etc when working with code in this repository.

## Important: No `Date` Objects

This project exists to learn and exercise the **Temporal API**. Never use `Date`, `Date.now()`, or any legacy date/time APIs. All date and time operations must go through `Temporal` (via the `temporal-polyfill` package). The `timeState` object passed to every card already provides `Temporal.Instant`, `Temporal.ZonedDateTime`, and derived values — use those.

## Project Overview

**By My Watch** is a single-page web app that visualizes time in multiple formats alongside an interactive orrery (solar system model). It was built as a learning exercise for the JavaScript Temporal API.

## Architecture

A **Vite** vanilla JS project. Each time-display card is a separate ES module in `src/cards/`. There are no frameworks — just plain JavaScript, CSS, and a bundler.

### File Structure

```
index.html              — Shell: PicoCSS CDN, header controls, empty <main>, Cloudflare beacon
package.json            — Dependencies and npm scripts
public/
  robots.txt
src/
  main.js               — Entry point: time state, animation loop, controls, card orchestration
  style.css             — Global styles (two-column Date/Time layout, card grids, controls, responsive breakpoint)
  cards/
    index.js            — Auto-registry: globs every module's `cards` array, sorts by meta.order
    lib/                — Shared factories / generators / utilities (excluded from the registry glob)
      simpleCard.js     — Factory for the shared header + value + footnote card DOM
      calendarCard.js   — Generator for "today's date in calendar X" cards
      timescaleCard.js  — Generator for "show timescale Y" cards
      astronomy.js      — Shared julianDate / modifiedJulianDate / gmstHours helpers
      earth.js          — Shared Earth / solar-position utilities (sub-solar longitude, emoji selection)
    orrery.js           — Solar system card (planet data, positioning, moon phase)
    orrery.css          — Orrery-specific styles
    greyline.js         — Grey line card (day/night terminator overlay on Earth emoji + local time readout)
    greyline.css        — Grey line-specific styles
    gregorian.js        — Gregorian calendar grid card
    gregorian.css       — Gregorian calendar-specific styles
    utc.js              — UTC card
    beat.js             — Swatch Internet Time card
    calendars.js        — Generator-backed: config table of non-Gregorian calendar cards (via calendarCard)
    timescales.js       — Generator-backed: config table of timescale cards (via timescaleCard)
```

Note: the former `src/cards/earth.js` now lives at `src/cards/lib/earth.js`.

### Dependencies

- **PicoCSS 2.x** — classless CSS framework (CDN link in `index.html`)
- **temporal-polyfill** — Temporal API polyfill (npm package, imported in `main.js`)
- **Vite** — dev server and bundler (dev dependency)
- **Cloudflare Insights** — analytics beacon (CDN script in `index.html`)

### Card Module Interface

Every card module in `src/cards/` exports a single array under the **unified contract**:

```js
export const cards = [ { meta, create, update }, ... ];
```

A module may export **multiple** cards — the generator-backed modules (`calendars.js`, `timescales.js`) do, mapping a config table through a factory.

Each card object has:

- `meta = { id, title, category, wikipedia, order, footnote?, fullWidth? }`
  - `id` — becomes the `<article>` id. The two anchor cards are placed **by id** (see Layout), so their ids are load-bearing.
  - `title` — header text (linked to `wikipedia` if present).
  - `category` — one of `solar | standard | calendars | timescales | novelty`. Drives column placement only for categories a column claims (see Layout); a category no column claims falls into the safety-net grid.
  - `order` — controls render order (cards are globally sorted by `meta.order`).
  - `footnote` — optional small print rendered in the card `<footer>`. May be a plain string or a DOM `Node` (so footnotes can include links / emphasis).
  - `fullWidth` — optional boolean; when `true` the card spans its full column width. Used by the Gregorian grid. (Anchor cards span automatically and don't need to set it.)
- `create()` — Called once at init. Returns the `<article>` DOM element to be appended.
- `update(timeState)` — Called every animation frame (~60fps). Mutates the DOM created by `create()`.

The `timeState` object: `{ now, zonedNow, utcNow, daysSinceEpoch, epochSeconds, manuallySpecified }`

### Auto-registry

`src/cards/index.js` collects every card automatically. It uses Vite's `import.meta.glob('./*.js', { eager: true })` to import every module in `src/cards/`, gathers each module's `cards` array, and sorts the flattened result by `meta.order`. The glob is intentionally **one level** (`./*.js`, not `./**/*.js`): one level excludes the helpers in `src/cards/lib/`, and avoids the `**` glob matching `index.js` itself (which also exports `cards`, which would cause a circular-import / TDZ error).

The registry is defensive: a module that doesn't export a `cards` array, or a card entry missing `meta.id` / `create` / `update`, is **skipped** (with a DEV `console.warn`) rather than silently dropped or allowed to crash the whole registry.

`src/main.js` does `import { cards } from './cards/index.js'` and iterates the array to `create()`/`update()` each card — it no longer hand-registers anything.

To add a new card: drop a module in `src/cards/` that exports a `cards` array (optionally with a `.css` and a `lib/` helper). The registry picks it up with no edits to `index.js`. Whether you need to touch `main.js` depends on the card's `meta.category`:

- If the category is **already mapped** by a `COLUMNS` entry (`calendars`, `standard`, `timescales`), no `main.js` edit is needed — it lands in that column automatically.
- If the category is **not** claimed by any column (e.g. `novelty`, until it's mapped), the card falls into the safety-net grid (the last / Time column) and the layout code emits a DEV `console.warn`. Placing it deliberately requires adding/extending a `COLUMNS` entry in `main.js`.

### Layout (two columns)

`src/main.js` arranges the registered cards into two side-by-side columns. Placement is driven by **both** anchor id and category, not by category alone:

- Each column has an anchor placed **by id** via `COLUMNS[].anchorId`. Both anchors carry `category: 'solar'` — category does **not** route them; their ids do.
- **Date** — anchored by the orrery (full-width hero), then takes every `category: 'calendars'` card (including the Gregorian grid).
- **Time** — anchored by the grey line (full-width hero), then takes `category: 'standard'` and `'timescales'` cards.

The mapping lives in the `COLUMNS` constant in `main.js` (each entry is an `anchorId` plus the categories that column claims). Each column is a responsive `.card-grid`; the anchor card spans the full column width (and a card may opt into full-width with `meta.fullWidth: true`) and carries a muted hgroup caption under its live readout ("Earth's Orbit" / "Earth's Rotation"). On screens ≤768px the columns stack and each grid collapses to one card wide. Any card whose category no column claims falls into a safety-net grid (appended to the last / Time column) so nothing is silently dropped, and the layout emits a DEV `console.warn` for it.

### Factories / Generators (`src/cards/lib/`)

Shared helpers live in `src/cards/lib/`, which the registry glob excludes:

- **`lib/simpleCard.js`** — `simpleCard({ id, title, wikipedia, footnote })` builds the shared `article > [header (+ Wikipedia link), h2, footer]` DOM. Returns `{ article, header, valueEl, footer, setValue }` so callers can augment the result (e.g. `.beat` inserts a `<progress>`). `setValue` short-circuits when the string is unchanged. `footnote` accepts either a plain string or a DOM `Node` (so a footnote can include links / emphasis).
- **`lib/calendarCard.js`** — `calendarCard({ id, title, calendar, wikipedia, footnote, order, format? })` generates a `{ meta, create, update }` card (category `calendars`) that renders today's date via `zonedNow.withCalendar(calendar)`. `format(zonedNow) => string` overrides rendering for schemes that aren't real Temporal calendar ids (e.g. Holocene). Updates at day granularity.
- **`lib/timescaleCard.js`** — `timescaleCard({ id, title, wikipedia, footnote, order, granularity?, compute })` generates a `{ meta, create, update }` card (category `timescales`) whose value is `compute(timeState)`. `granularity` is `'second'` (default, reuses the `epochSeconds` dirty-check) or `'frame'` (recompute every tick for sub-second readouts).
- **`lib/astronomy.js`** — shared `julianDate`, `modifiedJulianDate`, `gmstHours`.
- **`lib/earth.js`** — the former `src/cards/earth.js` (moved here); shared solar-position utils (sub-solar longitude, emoji selection).

### Core Components

1. **Orrery / Solar System Chart** (`src/cards/orrery.js`) — CSS-based circular visualization with 8 planets, Sun, Earth, and Moon. Planets positioned using CSS `rotate()`/`translateX()` transforms from real orbital periods. Planet data is a module-level constant. Moon phase tracking uses a 29.5305-day lunar cycle with 8 emoji phases. Earth's globe emoji rotates by UTC hour.

2. **Gregorian Calendar** (`src/cards/gregorian.js`) — Toggleable month/year calendar view. Clicking the header switches between a single-month view (short weekday headers, wider spacing) and a full 12-month year grid (narrow weekday headers, 3-column CSS Grid layout with responsive breakpoints). Uses semantic Pico CSS elements (`<mark>` for today, `<time>` for each day, `<abbr>` for weekday headers, `<section>` per month in year view). Weekday ordering is locale-aware via `Intl.Locale.getWeekInfo()`. Both views update every frame; the year view rebuilds only on year change, swaps `<mark>` for day/month changes. The month view rebuilds on month transitions and swaps `<mark>` for day changes. The grid spans its full column via `meta.fullWidth: true` (replacing the former hardcoded `#localDate` CSS rule).

3. **Time Displays** (`src/cards/utc.js`, `src/cards/beat.js`) — UTC and Swatch Internet Time (.beat time, BMT = UTC+1, 1000 beats/day). Local time is displayed within the grey line card.

4. **Time Travel Controls** (in `index.html` header, wired in `src/main.js`) — A datetime-local input for manual time selection and a range slider with exponential speed control. The slider uses a dead zone (45-55) around center, with exponential acceleration outside it. Double-clicking the slider returns to real time.

5. **Animation Loop** (`src/main.js`) — `requestAnimationFrame`-based with delta-time calculation. The `tick()` function updates time state, then calls `update()` on every card.

### Key State Variables (in `src/main.js`)

- `now` / `zonedNow` / `utcNow` — current time as Temporal.Instant and ZonedDateTime
- `manuallySpecified` — whether user has overridden system time
- `timeMultiplier` — speed factor for time travel slider
- `daysSinceEpoch` — computed in `buildTimeState()`, used for astronomical calculations

### Astronomical Data

Planet data is defined as a module-level constant in `src/cards/orrery.js` with properties: `period` (orbital period in days), `startAngle` (degrees at epoch), `distanceMultiplier` (chart spacing). Orbital periods use high-precision values (e.g., Mercury: 87.96935 days).

## Development

```bash
npm install          # install dependencies
npm run dev          # start Vite dev server
npm run build        # production build to dist/
npm run preview      # preview production build
```
