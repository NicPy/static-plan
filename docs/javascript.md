# Shared JavaScript (`assets/app.js`)

Everything hangs off `window.FP`. Loaded with a plain `<script src="assets/app.js">` at the end of `<body>`.

## Persistence layer — built to swap localStorage → a database
This was an explicit requirement. **All app code talks to `FP.Storage`**, never to `localStorage` directly.
- `FP.Storage` is a `Store` instance: namespaced (`foodplan:`), **Promise-based** async API:
  `get(key, fallback)`, `set(key, val)`, `remove(key)`, `exportAll()`, `importAll(obj)`, `clearAll()`.
- It sits on a swappable **adapter** with 4 methods: `get / set / remove / keys(prefix)`.
- Current adapter: `LocalStorageAdapter` (falls back to in-memory if `localStorage` is blocked).
- **To migrate to a backend:** write one `ApiAdapter` implementing the same 4 async methods (a commented
  template is in `app.js`), then change the single line `FP.Storage = createStorage(LocalStorageAdapter())`.
  **No call sites change** because they already `await`. `exportAll()` is also the migration data dump.

## Generic UI behaviors (data-attribute driven, auto-wired on load)
- **Active nav** — highlights the link matching the current filename.
- **Mobile nav** — `.nav-toggle` toggles `.nav-links.show`.
- **Accordions** — `<button class="acc-head" aria-expanded>` + sibling `.acc-body`; first can start `open`.
- **Tabs** — wrap in `[data-tabs]`; `.tab[data-target="x"]` buttons show the matching `[data-panel="x"]`.
  First tab auto-activates. Used by food-plan (weeks) and shopping-list (weeks).
- **`FP.bindChecklist(container, recordKey, onChange?)`** — persists a group of
  `input[type=checkbox][data-item="..."]` to one stored record. Reusable; used by shopping list.

## Page-specific scripts (inline at bottom of those pages)
- **exercises.html** — renders the stylized **core muscle map** into every `.muscle-thumb` from
  `data-primary` / `data-secondary` zone names. Zones: `upper`, `lower`, `obliques`. Primary → `.on`
  (terracotta), secondary → `.on2` (gold). Optional `data-label` adds a caption (used for non-core lifts).
- **shopping-list.html** — binds each `[data-checklist]` block via `FP.bindChecklist`.
- **tracker.html** — daily habits keyed `habits:<YYYY-MM-DD>`; weight log array under `weightlog`
  (`{date,kg,waist,note}`, one entry per date, re-adding a date replaces it); **goal weight is user-entered**
  and stored under `goalkg` (nothing about the user is hard-coded); canvas trend chart with a dashed goal
  line (only drawn once a goal is set); start = first logged weight; export/import/reset via the storage layer.
