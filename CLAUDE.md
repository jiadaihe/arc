# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — start dev server (port 3000)
- `npm run build` — production build
- `npm run lint` — ESLint with Next.js rules

## What This Is

Arc is a minimalist goal-aligned daily planner. Users link daily tasks/events to long-term goals, creating ambient awareness of alignment without productivity guilt. See `mvp.md` for the full specification.

## Tech Stack

- Next.js 16 (App Router, TypeScript, strict mode)
- SQLite via `better-sqlite3` + Drizzle ORM
- Tailwind CSS
- React hooks + context (no Redux)
- `date-fns` for date handling

## Architecture

Two layers — API routes contain business logic and call repositories directly:

```
db/               → schema + repositories (only file that imports better-sqlite3)
app/api/          → HTTP handlers + business logic (RESTful routes)
components/       → UI (React components)
```

**Database modularity is critical**: all DB access goes through `db/`. The app layer never imports `better-sqlite3` directly — only the Drizzle client. This enables swapping to Postgres by changing only the driver and connection config.

## Key Design Decisions

- **No tasks/events distinction**: an `item` with `startTime` renders on the timeline; without it, renders as a checklist task. Users can fluidly add/remove time.
- **Goal health is computed, not stored**: calculated server-side in GET /api/goals based on latest linked item/check-in dates (Thriving ≤3 days, Neutral 3-5, Fading 5-7, Blinking 7+).
- **6 active goals max**: enforced in both API (return 400) and UI (disable create button). Matches the 6-color palette.
- **IDs**: use `crypto.randomUUID()`
- **Dates**: stored as ISO strings in SQLite, parsed with `date-fns` in app layer.
- **Path alias**: `@/*` maps to project root.

## Color Palette

The 6 curated goal colors (the only saturated colors in the UI):
`#E07A5F` (terra cotta), `#3D85C6` (calm blue), `#81B29A` (sage green), `#F2CC8F` (warm gold), `#9B72AA` (soft purple), `#E88D97` (rose)

## UI Philosophy

Minimalist (Things 3 / Linear aesthetic). Neutral background with goal colors as the only pops of color. Subtle purposeful animations only. No gamification language — no "streaks!", no badges. The visual beauty of a thriving goal is the reward.
