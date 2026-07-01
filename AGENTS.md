# AGENTS.md — 3-Week Reset

Context for anyone (human or AI agent) working on this project. It has two parts:

1. **[Technical](#part-1--technical)** — how the site is built and how to change it safely.
2. **[Personal goal & content context](#part-2--personal-goal--content-context)** — who this is for, the
   numbers behind it, and the reasoning behind the food & exercise content.

---

# Part 1 — Technical

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
├── AGENTS.md             This file
└── assets/
    ├── styles.css        The entire design system (one stylesheet, all pages)
    ├── app.js            Shared JS: storage layer + generic UI behaviors
    └── favicon.svg       Brand mark (teal→green tile + white diamond)
```

All 7 pages share the **same `<head>`** (fonts → favicon → styles.css), the **same sticky `<nav>`**, and the
**same `<footer>`** pattern. When adding a page, copy these from an existing page and add it to the nav on
**every** page (the nav is duplicated per-page, not templated).

## Design system (`assets/styles.css`)
- **Theme:** fresh Mediterranean. Tokens are CSS custom properties in `:root` — use them, don't hardcode
  colors. Key ones: `--sand` (bg), `--cream` (cards), `--ink` (text), `--teal` (primary), `--terracotta`
  (accent), `--gold`, `--green`, `--radius` (16px), `--shadow-sm/md`.
- **Fonts:** `--font-display` = Fraunces (headings), `--font-body` = Inter (body).
- **Reusable components** (same class names everywhere): `.container`, `.section`/`.section-tight`,
  `.card`, `.tile` (link tiles), `.stat` (number cards), `.badge` (`.teal`/`.gold`/`.terra`),
  `.macro-pill` (`.kcal`/`.protein`/`.carbs`/`.fat`/`.water`), `.callout` (`.info`/`.good`/`.warn`/`.danger`),
  `.btn` (`.btn-primary`/`.btn-ghost`/`.btn-sm`), `.progress`, `.split` (macro bar), `.accordion`,
  `.tabs`/`.tab`, `.checklist`, `.day-table`, `.food-list`.
- **Responsive** via grid/flex with breakpoints at 860px and 560px. Mobile nav collapses behind `.nav-toggle`.
- **Print styles** live in the `@media print` block: hides nav/footer/buttons (`.no-print`), expands all
  accordions, and **forces every `[data-panel]` tab to print** (so all 3 weeks print, not just the open one).

## Shared JavaScript (`assets/app.js`)
Everything hangs off `window.FP`. Loaded with a plain `<script src="assets/app.js">` at the end of `<body>`.

### Persistence layer — built to swap localStorage → a database
This was an explicit requirement. **All app code talks to `FP.Storage`**, never to `localStorage` directly.
- `FP.Storage` is a `Store` instance: namespaced (`foodplan:`), **Promise-based** async API:
  `get(key, fallback)`, `set(key, val)`, `remove(key)`, `exportAll()`, `importAll(obj)`, `clearAll()`.
- It sits on a swappable **adapter** with 4 methods: `get / set / remove / keys(prefix)`.
- Current adapter: `LocalStorageAdapter` (falls back to in-memory if `localStorage` is blocked).
- **To migrate to a backend:** write one `ApiAdapter` implementing the same 4 async methods (a commented
  template is in `app.js`), then change the single line `FP.Storage = createStorage(LocalStorageAdapter())`.
  **No call sites change** because they already `await`. `exportAll()` is also the migration data dump.

### Generic UI behaviors (data-attribute driven, auto-wired on load)
- **Active nav** — highlights the link matching the current filename.
- **Mobile nav** — `.nav-toggle` toggles `.nav-links.show`.
- **Accordions** — `<button class="acc-head" aria-expanded>` + sibling `.acc-body`; first can start `open`.
- **Tabs** — wrap in `[data-tabs]`; `.tab[data-target="x"]` buttons show the matching `[data-panel="x"]`.
  First tab auto-activates. Used by food-plan (weeks) and shopping-list (weeks).
- **`FP.bindChecklist(container, recordKey, onChange?)`** — persists a group of
  `input[type=checkbox][data-item="..."]` to one stored record. Reusable; used by shopping list.

### Page-specific scripts (inline at bottom of those pages)
- **exercises.html** — renders the stylized **core muscle map** into every `.muscle-thumb` from
  `data-primary` / `data-secondary` zone names. Zones: `upper`, `lower`, `obliques`. Primary → `.on`
  (terracotta), secondary → `.on2` (gold). Optional `data-label` adds a caption (used for non-core lifts).
- **shopping-list.html** — binds each `[data-checklist]` block via `FP.bindChecklist`.
- **tracker.html** — daily habits keyed `habits:<YYYY-MM-DD>`; weight log array under `weightlog`
  (`{date,kg,waist,note}`, one entry per date, re-adding a date replaces it); **goal weight is user-entered**
  and stored under `goalkg` (nothing about the user is hard-coded); canvas trend chart with a dashed goal
  line (only drawn once a goal is set); start = first logged weight; export/import/reset via the storage layer.

## Food-plan cell convention (important)
Each meal cell uses this exact structure (so styling and any future regex stay predictable):
```html
<td>
  <ul class="food-list">
    <li class="head"><strong>Dish name</strong> portion</li>  <!-- first line, bold, no bullet -->
    <li>second food</li>                                       <!-- bullet dot, one food per line -->
    ...
  </ul>
  <span class="kcal-tag">~420 kcal</span>
  <span class="alt">alt: a swap option</span>
</td>
```
There are **84 cells** (3 weeks × 7 days × 4 meals). They were generated by splitting the original
"`+`-joined" descriptions onto separate lines. If regenerating in bulk, keep `<ul class="food-list">`,
the `.head` first line, the `.kcal-tag`, and the `.alt` line, in that order.

## Conventions
- **English** copy; **metric** units (kg, g, cm, °C); **Sun–Sat** week (Israeli).
- Keep the **honest-expectations** framing intact (see Part 2) — it appears on `index` and `nutrition`.
- Keep the **spot-reduction myth** note on `exercises` and `nutrition`.
- A "not medical advice" line lives in the footers / index.

## Verifying changes (no test suite)
```bash
node --check assets/app.js                 # JS syntax (+ extract & check inline <script> blocks)
python3 -c "from html.parser import HTMLParser ..."   # HTML tag-balance sweep
open index.html                            # eyeball in a browser; click every nav link
```
Manually: tabs switch, accordions open, muscle maps render, shopping/tracker checkboxes persist across
reload, weight entry updates the chart + progress bar, and print-preview shows all weeks.

---

# Part 2 — Personal goal & content context

> This section is the "why" behind the content. Keep edits consistent with it.

## Who this is for
- A **sedentary adult** (mostly seated outside of workouts), cutting over a short window.
- Lives in **Israel**; built in **late June 2026 = peak summer** (hot; seasonal produce reflects this).
- **No dietary restrictions.** Happy to **cook ~30-minute meals**.
- The site carries **no personal identifiers** (height/age/weight). Body-specific numbers are the user's
  to enter (tracker goal weight) — keep it that way so the site stays shareable.

## The goal (and the honest framing — do not overpromise)
- Lose as much weight as **safely** possible in **3 weeks**, "without injuring health."
- Safe loss is 0.5–1 kg/week → realistic **~2–2.5 kg of actual fat**; the scale may move **3–4 kg** (water +
  glycogen drop early, especially week 1).
- **Framing is intentional:** aim for steady **~0.5–0.75 kg/week**; chasing a bigger drop is the aggressive
  edge and risks muscle loss / rebound. **Health first.** This framing appears on the site.

## The numbers (illustrative — sedentary adult, Mifflin-St Jeor + training)
| Metric | Value |
|---|---|
| BMR | ≈ 1,760 kcal |
| Maintenance (TDEE, ×1.2) | ≈ 2,110 kcal (~2,300 on training days) |
| **Daily intake target** | **≈ 1,650 kcal** (~500–650 deficit) |
| Hard floor | never below 1,500 kcal |
| Protein | **≈ 170 g/day** (~2 g/kg — protects muscle + satiety) |
| Fat | ≈ 50 g/day |
| Carbs | ≈ 130 g/day |
| Water | ≈ 3 L/day (summer) |
- ~1 kg fat ≈ 7,700 kcal is the "exchange rate" used in explanations.

## Food context (drives `food-plan`, `shopping-list`, `nutrition`)
- Style: **Israeli–Mediterranean**, leaning into the classic **big breakfast / lighter dinner** pattern.
- **In-season summer produce (Israel, June–July):** tomatoes, cucumbers, peppers, eggplant, zucchini,
  okra, corn, avocado; fruit: watermelon, melon, peaches, plums, grapes, mango, figs; herbs, lemon.
- **Protein staples:** chicken/turkey breast, eggs, **cottage cheese 5%**, gvina levana (white cheese),
  labneh, Greek yogurt, tuna/sardines, salmon, tilapia (amnoon), denis/sea bream, legumes
  (hummus, lentils, white beans, chickpeas), tofu.
- **Carbs:** whole-wheat pita, oats, bulgur, freekeh, quinoa, brown rice, sweet potato.
- **Fats:** olive oil, tahini, avocado, nuts, olives.
- **Plan shape:** 3 meals + 1 snack/day; each day ≈ 1,600–1,700 kcal & 150–170 g protein. Meals rotate from
  a shared ~14-item library so the **shopping list stays manageable** (Week 1 = full shop; Weeks 2–3 =
  fresh top-ups). **Week 3 trims starches** slightly for a final push. Real-life handling included for
  **Shabbat / family meals** and **eating out / hummusiya**. A "free foods" list covers low-cal fillers.
- Eat **protein + veg first**; every meal has a portion + at least one swap; keep meals in season.

## Exercise context (drives `exercises`)
- Trains at **home**, **3–4×/week**, ~30–40 min, with **one 10 kg and one 15 kg dumbbell**.
- Focus is **abs / belly fat** — but the page leads with the truth: **spot reduction is a myth.** Belly fat
  only falls with an overall calorie deficit. So the program = **deficit + high protein + full-body strength
  (preserve muscle) + direct core work + cardio/steps (NEAT).** Daily **8–10k steps** is emphasized because
  low daily activity burns little.
- **Weekly split:** A) full-body strength + core, B) cardio/HIIT + core, C) full-body strength + core,
  D (optional) core circuit + steady cardio. Warm-up + cool-down provided. Example: Sun/Tue/Thu (+Sat).
- **3-week progression:** Week 1 learn form / lighter; Week 2 add reps or a set; Week 3 heavier or shorter
  rest. Form over load, always.
- **Exercise library** (18 moves) each has: a core **muscle map**, sets×reps, which dumbbell, form cues,
  a YouTube demo link, and a **star** toggle (persisted via `FP.Storage`, shown in the sticky starred bar).
  Cards are grouped into four `.ex-block`s by **primary muscle**, and the quick filter (Upper / Lower / Side
  abs) matches on **`data-primary` only**. Each card has an `id="ex-<slug>"` so the session templates and the
  on-page quick-links can anchor-scroll to it. Blocks: **Upper abs** (crunch, bicycle crunch, serratus jab),
  **Lower & deep core** (reverse crunch, leg raise, ab walkout, plank), **Side abs / obliques** (russian
  twist, high-to-low woodchopper, side plank, suitcase carry), **Full-body strength** (goblet squat, RDL,
  one-arm row, floor press, shoulder press, reverse lunge, hip thrust). Moves adapted from **Jeremy Ethier**
  carry a `.badge.jeremy` "Jeremy pick" tag (there is no longer a separate belly-fat/Jeremy section — his
  circuit lives as **Day D** in "Put it together").
- Summer-training and safety notes included (heat, hydration, never train through sharp pain, expect to feel
  a bit weaker on a cut).
