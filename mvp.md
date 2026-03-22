# Claude Code Prompt: Arc — Goal-Aligned Daily Planner

## Overview

Build a full-stack TypeScript web app called **Arc** — a minimalist planner that bridges long-term goals and daily actions. The core philosophy: daily tasks and events can be optionally linked to long-term goals, creating ambient awareness of alignment without enforcing productivity guilt.

This is NOT a generic productivity app. It's about helping users *notice* whether their daily life reflects their aspirations, without judgment.

## Tech Stack

- **Framework**: Next.js 14+ (App Router, TypeScript)
- **Database**: SQLite via `better-sqlite3`
- **ORM**: Drizzle ORM (chosen for easy database swapping later — keep all DB logic behind a clean repository/service layer so switching to PostgreSQL only requires changing the driver and connection config)
- **Styling**: Tailwind CSS
- **State Management**: React hooks + context (no Redux)
- **Date Handling**: `date-fns`

## Architecture Principles

1. **Database modularity**: All database access goes through a `db/` module. Schema defined in `db/schema.ts` with Drizzle. All queries in repository files (`db/repositories/`). The app layer never imports `better-sqlite3` directly — only the Drizzle client. This makes swapping to Postgres/MySQL a driver-level change.
2. **API layer**: Next.js API routes under `app/api/`. RESTful. All business logic in `lib/services/`.
3. **Clean separation**: `db/` (schema + repositories) → `lib/services/` (business logic) → `app/api/` (HTTP handlers) → `components/` (UI).

## Database Schema

Design these tables with Drizzle ORM in `db/schema.ts`:

### `goals`
- `id`: text (UUID, primary key)
- `title`: text (e.g., "Get good at drawing")
- `color`: text (hex color — one of a curated palette of 6 colors)
- `type`: text enum — `"milestone"` (has end date) or `"challenge"` (has frequency + duration)
- `startDate`: text (ISO date)
- `targetDate`: text (ISO date — for milestones: the deadline; for challenges: auto-calculated from start + duration)
- `challengeFrequency`: text, nullable (e.g., `"daily"`, `"3x_per_week"` — only for challenge type)
- `challengeDurationDays`: integer, nullable (e.g., 30 — only for challenge type)
- `status`: text enum — `"active"`, `"completed"`, `"archived"`
- `createdAt`: text (ISO datetime)
- `updatedAt`: text (ISO datetime)

### `items`
- `id`: text (UUID, primary key)
- `title`: text
- `date`: text (ISO date — which day this item belongs to)
- `startTime`: text, nullable (HH:mm — if set, renders on timeline; if null, renders in checklist)
- `endTime`: text, nullable (HH:mm)
- `completed`: integer (0 or 1, SQLite boolean)
- `goalId`: text, nullable (foreign key → goals.id — the linked goal, if any)
- `createdAt`: text (ISO datetime)

> **Design note**: There is no separate tasks/events distinction. An item with a time is rendered as a timed event on the daily timeline. An item without a time is rendered as a task in the checklist. Users can add or remove time from any item fluidly — no need to delete and recreate.

### `challenge_checkins`
- `id`: text (UUID, primary key)
- `goalId`: text (foreign key → goals.id)
- `date`: text (ISO date)
- `createdAt`: text (ISO datetime)
- Unique constraint on (goalId, date) — one check-in per goal per day

## Core Features to Build

### 1. Two-Pane Layout

**Left pane — Goal Tracker:**
- List of active goals as cards
- Each card shows: title, color indicator, countdown bar (days remaining / total days), and a health/beauty state
- **Goal health visualization**:
  - **Thriving**: Goal has been linked to tasks/events or checked into within the last 3 days → full color, subtle gradient or shimmer (CSS animation, keep it tasteful)
  - **Neutral**: 3–5 days with no links/check-ins → normal color, no animation
  - **Fading**: 5–7 days with no activity → desaturated/greyed out
  - **Blinking**: 7+ days with no activity → grey + gentle CSS pulse animation
- For challenge-type goals: show a mini calendar grid (like GitHub contributions) — small squares for each day of the challenge, filled = checked in, empty = missed, today = highlighted
- Progress bar: for milestones, based on linked task count vs. time elapsed (approximate); for challenges, based on check-in count vs. expected count

**Right pane — Daily View:**
- Shows today's date prominently
- Date navigation (prev/next day arrows)
- **Two sections, one data model**: Items with a `startTime` render on a visual timeline at the top. Items without a time render as a checklist below. Users can fluidly add/remove time from any item — it just moves between sections.
- Each item shows a small colored dot matching its linked goal (if linked)
- At a glance, user can see how "colorful" their day is

### 2. Goal-Item Linking (The Core Interaction)

When creating or editing an item, show a row of small colored circles representing active goals. Tap one to link. Tap again to unlink. This is the primary interaction — it should feel instant and effortless.

Also support linking from the daily view: a small icon/button on each item that reveals the goal color selector inline. One extra tap to link.

### 3. Challenge Check-In

For challenge-type goals, the goal card has a prominent "Check In" button for today. One tap marks today as done. The mini calendar grid updates immediately. The goal's health state refreshes.

Show current streak count on the card (consecutive days/sessions completed).

### 4. Weekly Summary Banner

A collapsible banner at the top of the app:
- **Collapsed state**: a thin strip showing colored blocks proportional to time spent on each goal that week (like a stacked bar chart, but minimal)
- **Expanded state** (tap to expand): 
  - "This week you spent time on: [Drawing (3 tasks), Running (5 check-ins), Work (8 tasks)]"
  - "Your active goals: [list with colors]"
  - Goals that got zero attention that week are listed separately, gently: "Didn't get to: [goal name]"
- Automatically resets on Monday

### 5. Goal CRUD

- Create goal: modal/drawer with title, color (pick from 6 curated colors), type (milestone vs challenge), dates, frequency (if challenge)
- Edit goal: same form, pre-filled
- Complete goal: celebration moment (confetti animation or similar, keep it brief), then prompt: "Continue, evolve, or archive?"
- Archive goal: moves to an archived section, accessible but hidden from main view
- **Limit active goals to 6 max** (matches the color palette — enforces focus)

### 6. Item CRUD

- Quick-add item: text input at the top of the daily checklist, press enter to add. Defaults to no time (checklist item).
- To add a timed item: same form but with an optional "add time" toggle that reveals start/end time pickers
- Inline editing for all items
- Swipe or click to complete items (checkbox)
- Add/remove time on any existing item to move it between timeline and checklist

## UI/UX Guidelines

- **Minimalist**: lots of whitespace, no clutter. Think Things 3 or Linear, not Notion.
- **Color palette**: neutral background (soft off-white/warm grey for light mode). The only saturated colors come from the goal dots/indicators. The goal colors should POP against the neutral background — they're the visual soul of the app.
- **Curated goal color palette** (6 colors, accessible and distinct):
  - `#E07A5F` (terra cotta)
  - `#3D85C6` (calm blue)
  - `#81B29A` (sage green)
  - `#F2CC8F` (warm gold)
  - `#9B72AA` (soft purple)
  - `#E88D97` (rose)
- **Typography**: clean sans-serif (Inter or system font stack). Goal titles slightly larger. Dates and metadata in lighter weight.
- **Animations**: subtle and purposeful. Goal health shimmer, blink for neglected goals, smooth transitions. No bouncy/playful animations — this is calm and grounding.
- **Responsive**: works on desktop (two-pane side by side) and mobile (tabs or swipeable panes).
- **No gamification language**: no "streaks!", no "you're on fire!", no badges. The visual beauty of a thriving goal IS the reward.

## API Routes

```
GET    /api/goals              — list active goals (with computed health state)
POST   /api/goals              — create goal
PATCH  /api/goals/:id          — update goal
DELETE /api/goals/:id          — soft delete (archive)

GET    /api/items?date=YYYY-MM-DD  — items for a specific date
POST   /api/items              — create item
PATCH  /api/items/:id          — update item (including linking/unlinking goal, adding/removing time)
DELETE /api/items/:id          — delete item

POST   /api/checkins           — check in to a challenge goal (body: { goalId })
GET    /api/checkins?goalId=X  — get all check-ins for a goal (for the mini calendar)

GET    /api/summary/weekly     — weekly summary data (goal activity counts, etc.)
```

## File Structure

```
horizon/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                    # Main two-pane view
│   ├── api/
│   │   ├── goals/
│   │   │   ├── route.ts            # GET, POST
│   │   │   └── [id]/route.ts       # PATCH, DELETE
│   │   ├── items/
│   │   │   ├── route.ts
│   │   │   └── [id]/route.ts
│   │   ├── checkins/
│   │   │   └── route.ts
│   │   └── summary/
│   │       └── weekly/route.ts
├── components/
│   ├── goals/
│   │   ├── GoalCard.tsx            # Individual goal with health viz
│   │   ├── GoalList.tsx            # Left pane goal list
│   │   ├── GoalForm.tsx            # Create/edit modal
│   │   ├── GoalColorPicker.tsx     # 6-color selector
│   │   ├── ChallengeGrid.tsx       # Mini calendar for challenges
│   │   └── HealthIndicator.tsx     # Visual health state (shimmer/grey/blink)
│   ├── daily/
│   │   ├── DailyView.tsx           # Right pane
│   │   ├── TimedItems.tsx          # Items with startTime, rendered as timeline
│   │   ├── Checklist.tsx           # Items without time, rendered as task list
│   │   ├── ItemRow.tsx             # Shared row component (colored dot, checkbox, title)
│   │   ├── QuickAddItem.tsx        # Quick-add input (defaults to no time = checklist item)
│   │   └── GoalLinkSelector.tsx    # Inline colored circles for linking
│   ├── summary/
│   │   └── WeeklySummaryBanner.tsx
│   └── ui/
│       ├── CountdownBar.tsx
│       ├── ColorDot.tsx
│       └── Modal.tsx
├── db/
│   ├── index.ts                    # Drizzle client init (the ONLY file that imports better-sqlite3)
│   ├── schema.ts                   # All table definitions
│   ├── migrate.ts                  # Migration runner
│   └── repositories/
│       ├── goals.ts
│       ├── items.ts
│       └── checkins.ts
├── lib/
│   ├── services/
│   │   ├── goals.ts                # Business logic (health computation, etc.)
│   │   ├── items.ts
│   │   ├── checkins.ts
│   │   └── summary.ts             # Weekly summary aggregation
│   ├── types.ts                    # Shared TypeScript types
│   ├── constants.ts                # Color palette, limits, etc.
│   └── utils.ts                    # Date helpers, ID generation
├── drizzle.config.ts
├── package.json
├── tsconfig.json
└── tailwind.config.ts
```

## Implementation Order

1. **Database layer first**: schema, Drizzle config, migrations, repository functions. Verify with a quick test script.
2. **API routes**: implement all endpoints, test with curl or a simple script.
3. **UI - Goal pane**: GoalList, GoalCard (with health states), GoalForm, ChallengeGrid.
4. **UI - Daily pane**: DailyView, TimedItems (timeline), Checklist, QuickAddItem, GoalLinkSelector.
5. **UI - Integration**: wire up the linking interaction, colored dots, weekly summary banner.
6. **Polish**: animations (health shimmer/blink), responsive layout, transitions.

## Important Notes

- Use `crypto.randomUUID()` for IDs
- All dates stored as ISO strings in SQLite, parsed with `date-fns` in the app layer
- The goal health state should be computed server-side in the GET /api/goals endpoint based on the latest linked item/check-in dates — don't store health state in the DB
- Keep the weekly summary computation in a service function that aggregates from items and check-ins for the current week
- For the 6-goal limit: enforce in both the API (return 400 if trying to create a 7th active goal) and the UI (hide/disable the create button when at limit)
