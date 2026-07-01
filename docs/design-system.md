# Design system (`assets/styles.css`)

One stylesheet drives all 7 pages.

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
