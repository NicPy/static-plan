# Exercise content

Drives `exercises.html`. Keep consistent with the [goal & numbers](goal-context.md).

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
