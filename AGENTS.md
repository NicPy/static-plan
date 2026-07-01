# AGENTS.md — 3-Week Reset

Orientation for anyone (human or AI agent) working on this project. This file is the **map**; the detailed
guidance lives in [`docs/`](docs/) — read the doc for the area you're touching instead of loading everything.

## What this is
A **static, self-contained website** — a personal 3-week fat-loss plan. No build step, no server, no
package manager, no dependencies. Every page is plain HTML and opens directly via `file://`
(double-click `index.html`). It is meant to be readable in a browser and printable.

**Only two things need the internet** and both degrade gracefully offline:
- Google Fonts (Fraunces + Inter) — falls back to system fonts.
- YouTube "Watch demo" links on the exercises page.

## File structure
```
food-plan/
├── index.html            Hub: numbers, goal framing, the 3 levers, links to every page
├── food-plan.html        3-week meal tables (Sun–Sat) with portions, kcal, swaps
├── nutrition.html        Theory: calories/deficit, protein/carbs/fat/fiber/sugar/alcohol, labels
├── exercises.html        Program + exercise library w/ SVG muscle maps, sets/reps, video links
├── shopping-list.html    Weekly grocery lists by aisle, persistent checkboxes
├── tracker.html          Daily habits + weight/waist log, trend chart, backup/restore
├── tips.html             Habits, sleep, eating out, Shabbat, plateaus, FAQ (accordions)
├── AGENTS.md             This file (the map)
├── docs/                 Detailed guidance (see table below)
└── assets/
    ├── styles.css        The entire design system (one stylesheet, all pages)
    ├── app.js            Shared JS: storage layer + generic UI behaviors
    └── favicon.svg       Brand mark (teal→green tile + white diamond)
```

All 7 pages share the same `<head>`, sticky `<nav>`, and `<footer>` — the nav is duplicated per-page, not
templated. When adding a page, see [docs/editing-and-verifying.md](docs/editing-and-verifying.md).

## Documentation
| Doc | What's in it |
|---|---|
| [docs/design-system.md](docs/design-system.md) | Tokens, components, responsive & print styles (`styles.css`) |
| [docs/javascript.md](docs/javascript.md) | `FP` namespace: storage layer, generic UI behaviors, page scripts (`app.js`) |
| [docs/editing-and-verifying.md](docs/editing-and-verifying.md) | Adding a page, the food-plan cell markup convention, how to verify changes |
| [docs/goal-context.md](docs/goal-context.md) | Who this is for, the honest goal framing, the target numbers |
| [docs/food-content.md](docs/food-content.md) | The reasoning behind food-plan / shopping-list / nutrition content |
| [docs/exercise-content.md](docs/exercise-content.md) | The reasoning behind the exercises program & library |

## Core conventions (apply everywhere)
- **English** copy; **metric** units (kg, g, cm, °C); **Sun–Sat** week (Israeli).
- Keep the **honest-expectations** framing (`index` + `nutrition`) and the **spot-reduction myth** note
  (`exercises` + `nutrition`). A "not medical advice" line lives in the footers / index. See
  [docs/goal-context.md](docs/goal-context.md) for the "why."
- **No personal identifiers** on the site — body numbers are user-entered (tracker). Keep it shareable.
- Use CSS **tokens**, never hardcoded colors. All app code talks to **`FP.Storage`**, never `localStorage`
  directly.
