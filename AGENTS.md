# AGENTS.md

This file provides guidance to Claude Code, OpenAI Codex, Gemini, etc when working with code in this repository.

## Project Overview

**By My Watch** is a single-page web app that visualizes time in multiple formats alongside an interactive orrery (solar system model). It was built as a learning exercise for the JavaScript Temporal API.

## Architecture

The entire application lives in **`index.html`** — a single file containing all HTML, CSS, and JavaScript. There is no build system, no package manager, no bundler, and no test framework.

External dependencies are loaded via CDN:
- **PicoCSS 2.x** — classless CSS framework for styling
- **temporal-polyfill** — Temporal API polyfill for browser compatibility
- **Cloudflare Insights** — analytics beacon

### Core Components (all in `index.html`)

1. **Orrery / Solar System Chart** — CSS-based circular visualization with 8 planets, Sun, Earth, and Moon. Planets are positioned using CSS `rotate()`/`translateX()` transforms calculated from real orbital periods and start angles calibrated against JPL HORIZONS data. The Moon orbits Earth with phase tracking (29.5305-day lunar cycle, 8 emoji phases). Earth's globe emoji rotates based on UTC hour.

2. **Time Display** — Shows local time, UTC, and Swatch Internet Time (.beat time, BMT = UTC+1, 1000 beats/day).

3. **Time Travel Controls** — A datetime-local input for manual time selection and a range slider with exponential speed control for time travel. The slider uses a dead zone (45-55) around center, with exponential acceleration outside it. A "Now" button resets the clock back to real-time.

4. **Animation Loop** — `requestAnimationFrame`-based with delta-time calculation for frame-independent updates. The `tick()` function is the main update, called ~60fps.

### Key State Variables

- `now` / `zonedNow` / `utcNow` — current time as Temporal.Instant and ZonedDateTime
- `manuallySpecified` — whether user has overridden system time
- `timeMultiplier` — speed factor for time travel slider
- `daysSinceEpoch` — used for all astronomical position calculations

### Astronomical Data

Planet data is defined inline in `tick()` with properties: `period` (orbital period in days), `startAngle` (degrees at epoch), `distanceMultiplier` (for chart spacing). Orbital periods use high-precision values (e.g., Mercury: 87.96935 days).

## Development

Open `index.html` directly in a browser or serve it with any static file server. No build or install step required.
