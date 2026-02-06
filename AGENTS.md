# AGENTS.md

This file provides guidance to Claude Code, OpenAI Codex, Gemini, etc when working with code in this repository.

## Important: No `Date` Objects

This project exists to learn and exercise the **Temporal API**. Never use `Date`, `Date.now()`, or any legacy date/time APIs. All date and time operations must go through `Temporal` (via the `temporal-polyfill` package). The `timeState` object passed to every card already provides `Temporal.Instant`, `Temporal.ZonedDateTime`, and derived values — use those.

## Project Overview

**By My Watch** is a single-page web app that visualizes time in multiple formats alongside an interactive orrery (solar system model). It was built as a
learning exercise for the JavaScript Temporal API.

## Architecture

A **Vite** vanilla JS project. Each time-display card is a separate ES module in `src/cards/`. There are no frameworks — just plain JavaScript, CSS, and a
bundler.

### File Structure

```
index.html              — Shell: PicoCSS CDN, header controls, empty <main>, Cloudflare beacon
package.json            — Dependencies (read by Deno)
deno.json               — Deno configuration
public/
  robots.txt
src/
  main.js               — Entry point: time state, animation loop, controls, card orchestration
  style.css             — Global styles (article layout, controls, responsive breakpoint)
  cards/
    orrery.js           — Solar system card (planet data, positioning, moon phase)
    orrery.css          — Orrery-specific styles
    calendar.js         — Monthly calendar grid card
    calendar.css        — Calendar-specific styles
    local.js            — Local time card
    utc.js              — UTC card
    beat.js             — Swatch Internet Time card
```

### Dependencies

- **PicoCSS 2.x** — classless CSS framework (CDN link in `index.html`)
- **temporal-polyfill** — Temporal API polyfill (npm package, imported in `main.js`)
- **Vite** — dev server and bundler (dev dependency)
- **Cloudflare Insights** — analytics beacon (CDN script in `index.html`)

### Card Module Interface

Every card in `src/cards/` exports two functions:

- `create()` — Called once at init. Returns an `<article>` DOM element to be appended to `<main>`.
- `update(timeState)` — Called every animation frame (~60fps). Mutates the DOM created by `create()`.

The `timeState` object: `{ now, zonedNow, utcNow, daysSinceEpoch }`

To add a new card: create `src/cards/my-card.js` (and optionally `.css`), export `create()` and `update()`, then import and add it to the `cards` array in
`src/main.js`.

### Core Components

1. **Orrery / Solar System Chart** (`src/cards/orrery.js`) — CSS-based circular visualization with 8 planets, Sun, Earth, and Moon. Planets positioned using CSS
   `rotate()`/`translateX()` transforms from real orbital periods. Planet data is a module-level constant. Moon phase tracking uses a 29.5305-day lunar cycle
   with 8 emoji phases. Earth's globe emoji rotates by UTC hour.

2. **Calendar** (`src/cards/calendar.js`) — Monthly calendar grid using a `<table>` with semantic Pico CSS elements (`<mark>` for today, `<time>` for each day,
   `<abbr>` for weekday headers). Uses Temporal's `daysInMonth`, `dayOfWeek`, `dayOfYear`, `weekOfYear`, and `toLocaleString()` for locale-aware display. Rebuilds
   the grid only on month transitions; day changes swap `<mark>` in place.

3. **Time Displays** (`src/cards/local.js`, `src/cards/utc.js`, `src/cards/beat.js`) — Local time, UTC, and Swatch Internet Time (.beat time, BMT
   = UTC+1, 1000 beats/day).

4. **Time Travel Controls** (in `index.html` header, wired in `src/main.js`) — A datetime-local input for manual time selection and a range slider with
   exponential speed control. The slider uses a dead zone (45-55) around center, with exponential acceleration outside it. A "Now" button resets to real-time.

5. **Animation Loop** (`src/main.js`) — `requestAnimationFrame`-based with delta-time calculation. The `tick()` function updates time state, then calls
   `update()` on every card.

### Key State Variables (in `src/main.js`)

- `now` / `zonedNow` / `utcNow` — current time as Temporal.Instant and ZonedDateTime
- `manuallySpecified` — whether user has overridden system time
- `timeMultiplier` — speed factor for time travel slider
- `daysSinceEpoch` — computed in `buildTimeState()`, used for astronomical calculations

### Astronomical Data

Planet data is defined as a module-level constant in `src/cards/orrery.js` with properties: `period` (orbital period in days), `startAngle` (degrees at epoch),
`distanceMultiplier` (chart spacing). Orbital periods use high-precision values (e.g., Mercury: 87.96935 days).

## Development

```bash
deno install         # install dependencies
deno task dev        # start Vite dev server
deno task build      # production build to dist/
deno task preview    # preview production build
```
