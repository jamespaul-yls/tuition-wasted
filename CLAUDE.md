# CLAUDE.md — "Tuition Meter" (unofficial YLS break-cost timer)

## What this is
A single-page **joke** web app for Yale Law School students. You press **Start**
when you take a break, and a counter tolls upward showing the tuition dollars
"burning" while you're not studying. Purely for laughs. It is an **unofficial
parody, not affiliated with Yale University or Yale Law School** — say so in the
footer.

## How it must run (non-negotiable)
- Ship a **static site with no build step**: `index.html`, `styles.css`, `app.js`.
- It must run by **opening `index.html` directly** in a browser (`file://`) — no
  npm, no dev server, no bundler.
- **Vanilla JS only.** No frameworks. **No external CDNs or webfonts** — it must
  work fully offline (that also keeps relative image paths working over `file://`).
- Keep the three files in the repo root; leave the asset folders where they are.

## Assets (already in the repo — names may vary, so detect them)
- There is a **PNG of the YLS logo** in a subfolder. Find it and place it in the
  header. Don't stretch it — constrain by height and keep aspect ratio.
- There is a **folder of screenshots** of YLS web pages. **Open and look at them**,
  then derive the palette, type feel, and spacing from what you see. *Match the
  vibe, don't pixel-copy.* Yale's brand blue is approximately `#00356B` (Yale
  Blue) — treat that as a hint and confirm the real accent / background / link /
  text colors from the actual screenshots.
- Fonts: approximate the screenshots with a **system font stack** (e.g. a serif
  like `Georgia, "Times New Roman", serif` for headings if theirs is serif;
  `system-ui, -apple-system, sans-serif` for body). No downloaded fonts.

## The core math — get this exactly right
- **Input:** total 3-year cost of attendance. **Auto-fill `$338,886`.** The field
  is **editable**; format with `$` and thousands commas; recompute the rate **live**
  as it changes; ignore/strip non-numeric input gracefully.
- **Rate:** `ratePerSecond = totalCOA / PROGRAM_SECONDS`. **Never hardcode the
  rate** — always derive it from the current input value.
- `PROGRAM_SECONDS` default = 3 years, continuous:
  `3 * 365.25 * 24 * 60 * 60` = **94,672,800**. Define it as a **named constant
  with a comment**.
- **Accuracy — do NOT add a fixed amount on every `setInterval` tick.** That drifts
  and browsers throttle background tabs. Drive everything off the wall clock:
  - on **Start**:  `startEpoch = Date.now() - accumulatedMs`
  - each frame:    `elapsedMs = Date.now() - startEpoch`
                   `cost = (elapsedMs / 1000) * ratePerSecond`
  - on **Pause**:  `accumulatedMs = elapsedMs`
  - on **Reset**:  `accumulatedMs = 0`, stop the loop, zero the display
  - This stays correct even if the tab is backgrounded or frames are irregular.
- **Display cadence:** update the DOM roughly every 10 ms (or via
  `requestAnimationFrame`). The "0.01 s" is a *display* granularity only — the true
  value always comes from the timestamps above.

## UI
- **Header:** logo + a title ("Tuition Meter" or similar).
- **Big live counter:** dollars with enough decimals to see motion, e.g.
  `$12.8461`. Use **tabular / monospaced figures** (`font-variant-numeric:
  tabular-nums`) and a fixed width so digits don't jitter horizontally.
- **Elapsed time:** `mm:ss.cs`.
- **Buttons:** Start, Pause, Reset — with clearly disabled/enabled states.
- **COA field:** the editable, prefilled input, labeled something like
  "What you're paying Yale (3 yrs)".
- **Rate line (subtitle):** compute and show it, e.g. "You're incinerating
  **$X.XX/hour** of tuition."
- **Cost-basis selector (include this):** a dropdown that swaps `PROGRAM_SECONDS`
  and recomputes live:
  - "Every second of 3 years" — *default*, `3*365.25*24*3600`
  - "Only waking hours (16h/day)" — `3*365.25*16*3600`
  - "Awake, school year only (~39 wks, 16h/day)" — `3*(39*7)*16*3600`
- **Milestone quips (optional, keep tasteful & short):** as the total crosses
  thresholds, show a wry one-liner — e.g. ~$6 "a large oat latte", ~$85 "a
  casebook", ~$300 "a bar-prep lecture", etc. A handful of tiers is plenty.
- **Footer:** the baked-in assumption ("COA ÷ 3 years, continuous") **and** the
  parody disclaimer.

## Style
- Restrained, "official-ish" law-school gravitas, subverted by the absurd premise.
  Yale-blue accent pulled from the screenshots, generous whitespace, one accent
  color, tabular figures on the counter. **Responsive** (usable on a phone).
  Respect `prefers-reduced-motion`.

## Don't
- No network calls, analytics, telemetry, or webfonts.
- No build tooling or frameworks.
- Don't hardcode the rate; always derive it from the COA input.
- Keep it one self-contained, offline static site.
