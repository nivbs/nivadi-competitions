# Nivadi Competitions — Design System

**Mode:** Operate — a task-oriented app. Scanability, obvious primary actions and a calm data surface come first. The backgammon board world lives in the shell, the dice, the checkers and the empty states; it never sits behind dense data.

**Visual world:** A Middle-Eastern backgammon board (shesh-besh) seen from above. Dark walnut frame, cream felt playfield, alternating dark and tan triangular points with stitched dashed seams, ivory and brown checkers, white pip dice, a doubling cube, gold inlay and a little burnt red/orange. Arabesque geometry (eight-point stars, stitched borders) decorates dividers and frames. Playful and a little cheeky, never childish. **Mobile-first.**

---

## 1. Color tokens

Defined on `:root` in `src/app/globals.css`. Solid colors only for text and UI fills (no gradient text). Gradients are allowed only on non-text surfaces (wood, checkers, dice faces).

### Board palette

| Token | Hex | Role |
|-------|-----|------|
| `--color-walnut-deep` | `#1f0f07` | Shell background, darkest wood |
| `--color-walnut` | `#2f1a0e` | Header, nav, timer chrome |
| `--color-walnut-frame` | `#4d2f1b` | Board frame, side borders |
| `--color-point-dark` | `#4a2616` | Dark triangle points |
| `--color-point-tan` | `#b07c4c` | Light triangle points |
| `--color-canvas` | `#f2dfbf` | Cream felt: page background of the playfield |
| `--color-surface` | `#fbf0da` | Cards and sheets on the felt |
| `--color-surface-raised` | `#fff8e8` | Modals, sticky bars |
| `--color-border` | `#dcc197` | Hairlines on felt |
| `--color-border-strong` | `#b48f58` | Selected containers |
| `--color-gold` / `--color-accent` | `#d4a64a` | Inlay, active states on walnut, win-type accents |
| `--color-accent-muted` | `#7a5714` | Brass for text and icons on felt (AA on felt) |
| `--color-brand` / `--color-brand-hover` | `#b8431f` / `#94341a` | Primary actions: burnt orange-red |
| `--color-pip-red` | `#c0261d` | Odd-face dice pips only |
| `--color-pip-black` | `#16110d` | Even-face dice pips |
| `--color-die` | `#fffdf7` | Die body |

### Text

| Token | Hex | Role |
|-------|-----|------|
| `--color-ink` | `#26140a` | Primary text on felt |
| `--color-ink-muted` | `#5a4331` | Secondary text |
| `--color-ink-faint` | `#6f563b` | Tertiary, placeholders (AA on felt) |
| `--color-cream` | `#f6e8cc` | Primary text on walnut |
| `--color-cream-muted` | `#d9c39a` | Secondary text on walnut |

### Status

`--color-success #3d6b4a`, `--color-warning #c2873a`, `--color-danger #b23b3b`, `--color-focus #1f6feb` (focus stays blue so it is distinct from every brand hue).

---

## 2. Player-color law

**Niv is always the dark side: walnut brown / black checkers. Gilad is always the light side: white / beige / cream checkers.** It is a fixed identity, never a theme option. It is identical in Hebrew and English, on walnut and on felt, and for whoever is signed in. Colors never swap based on the viewer.

| Token | Hex | Role |
|-------|-----|------|
| `--player-niv-fill` | `#3a2012` | Niv checker, bar and chip fill |
| `--player-niv-edge` | `#d4a64a` | Niv rim (gold hairline keeps it visible on walnut) |
| `--player-niv-ink` | `#f6e8cc` | Text on Niv fill |
| `--player-gilad-fill` | `#efe6d2` | Gilad checker, bar and chip fill |
| `--player-gilad-edge` | `#8a6a45` | Gilad rim (walnut hairline keeps it visible on felt) |
| `--player-gilad-ink` | `#2a170c` | Text on Gilad fill |

Rules:

- A player's name is always shown with a checker (`PlayerMark`) or a fill in that player's color. A score, bar, badge, row or button owned by a player is tinted by its owner.
- Terracotta (`--color-brand`), gold and red never represent a player. Gold and red mean emphasis, win type, and odd dice pips.
- All player styling comes from `src/lib/player-style.ts` and the `Checker` / `PlayerMark` primitives. Never hardcode a player color elsewhere.

---

## 3. Dice rule

Dice never show numerals. Faces show pips: two dots means two. Odd faces (1, 3, 5) have **red** pips, even faces (2, 4, 6) have **black** pips. Dice are white with a bevel, an inner highlight and a soft offset drop shadow so they read as 3D. The "6 and 5" in "שש בש" appear as a 6-pip face and a 5-pip face. The `Die` primitive is the only way to draw a die.

The doubling cube (`DoublingCube`) is the one place a numeral is allowed, because the real cube shows 2 to 64.

---

## 4. Motifs

Small and many, but budgeted: heavy in the shell, hero and empty states; light in data areas.

- **Points:** a `PointsRow` strip of alternating dark and tan triangles under the header, above the nav and on sheet tops.
- **Checkers:** owner marks, win-type indicators (gammon is 2 checkers, backgammon is 3), the stack in the score hero.
- **Dice:** win-type pickers (1, 2, 3 pips), intro, sign-in, empty states.
- **Doubling cube:** the logo, loading and the winner moment.
- **Stitching:** `.stitched` dashed inner border on boards and sheets, echoing the dashed seam on every point.
- **Arabesque:** `StarDivider` (eight-point star between two rules) replaces plain horizontal rules in cards.
- **Bar and frame:** `BoardFrame` (walnut frame, cream felt panel, gold hairline).

Motifs never go behind tables, lists of numbers, or form fields.

---

## 5. Typography

- **Display:** Suez One (Hebrew + Latin display serif) via `next/font`, `--font-display`, for page titles and big player names. Editorial and sturdy, fits the Middle-Eastern board direction and renders Hebrew natively.
- **Body and UI:** Rubik (`--font-sans-rubik` → `--font-sans`), one family for Hebrew and Latin UI copy.
- **Numbers and clock:** IBM Plex Mono, tabular figures.

| Role | Size | Weight | Notes |
|------|------|--------|-------|
| Display | `clamp(1.75rem, 5vw, 2.5rem)` | 400 | Suez One, page title only (single weight) |
| Title | `1.25rem` | 600 | Sections |
| Body | `1rem` | 400 | 1.5 line height |
| Label | `0.875rem` | 500 | Form labels |
| Caption | `0.8125rem` | 400 | Meta |
| Stat | `1.5rem`–`3rem` | 600 | Mono, tabular |

Hebrew: no justified text, no aggressive hyphenation. No eyebrow kickers above headings.

---

## 6. Spacing, radius, shadow

Base unit `4px`: `--space-1` 4, `-2` 8, `-3` 12, `-4` 16, `-5` 24, `-6` 32. Mobile horizontal padding 16px; touch targets at least 44×44px.

Radius: `--radius-sm` 6px, `--radius-md` 10px, `--radius-lg` 14px. Checkers are circles, dice use ~18% corner radius.

Shadows always have an offset and a soft blur: `--shadow-soft` for cards on felt, `--shadow-die` and `--shadow-checker` for 3D pieces. No hard offset shadows, no zero-offset colored glow.

---

## 7. Shell and navigation

- **Header** (3.75rem): walnut with a gold hairline, a small doubling-cube logo, game name in cream, language switcher, current player as a `PlayerMark`. A `PointsRow` runs along its lower edge.
- **Board:** the page sits on walnut; content is a cream felt panel with walnut side borders from `sm` upward.
- **Mobile nav:** walnut bar, gold top hairline, cream labels. Active item is gold with a gold point triangle above it.
- **Cards on felt:** `--color-surface`, 1px `--color-border`, `--radius-md`, `--shadow-soft`. No nested cards, no identical icon-heading-text card grids.
- **Timer:** full-bleed. Niv's half is walnut-dark with cream text, Gilad's half is cream with walnut text. Active side gets a gold ring, flagged side a red ring.

RTL: logical properties, mirror directional icons, keep numerals in `dir="ltr"`.

---

## 8. Motion (GSAP)

Funny, quick, skippable, and always tied to a user action. GSAP only (`gsap` + `@gsap/react`), via `useGSAP` with cleanup. One authored moment per action, exponential ease-out, transforms and opacity first.

- `prefers-reduced-motion: reduce` gets a static final frame, never a tween.
- No layout shift: animate overlays and transforms only.
- Every animation is skippable and never blocks input.

Approved moments (all in `src/components/motion/` and `SheshBeshIntro.tsx`):

- **Intro (about 2.8s, tap to skip):** dice are thrown from off-screen and bounce onto 6 and 5, the first thud knocks the title in, a checker rolls along the frame and falls off the edge, then a Hebrew/English quip.
- **Save game:** the winner's checkers (1, 2 or 3) hop to the winner's side while the loser's checker is flicked off with a BONK (sound included). Gammon and backgammon shake the header and nav.
- **Winner:** the doubling cube spins 2 to 64 and slams down, a crown drops on it, the loser's checker wobbles sadly. Backgammon rains checkers. Triggered on gammon/backgammon saves and when a session is finished.
- **Timer:** dice rattle on the first tap, a nervous checker pile and trembling digits under 10 seconds, a heavy flag drop with a cymbal crash on timeout.
- **Analysis:** hero scoreboard counts up, stacks and split bar settle; stat cards batch in on scroll; row bars scrub with scroll; stat tap and score tap get a checker hop or gold pulse.
- **Navigation and presses:** buttons and links press down like checkers, pages flip up into place (not on the timer).
- **Language and player switch:** a die is re-rolled.

---

## 9. Accessibility

- AA text contrast: cream on walnut, ink on felt, gold on walnut for large or bold text only; use `--color-accent-muted` for gold text on felt.
- Dice and checkers carry `role="img"` and an `aria-label`; they never carry meaning that is not also in text.
- Visible `:focus-visible` ring in `--color-focus`.
- Reduced motion honored everywhere.

---

## 10. Primitives (engineering)

`src/components/board/`: `Die`, `DoublingCube`, `Checker`, `PlayerMark`, `PointsRow`, `StarDivider`, `BoardFrame`. Helpers: `src/lib/player-style.ts`. Global classes in `globals.css`: `.wood`, `.felt`, `.stitched`.
