# Nivadi Competitions — Design System

**Mode:** Operate — a task-oriented app surface: clear hierarchy, scannable status, primary actions obvious, minimal decorative chrome. Warm craft + backgammon identity supports recognition and delight without slowing workflows.

**Visual world:** Arab-inspired craft (geometry, warmth, material honesty) plus backgammon motifs: inlaid triangles and points, pip patterns as subtle texture, wood grain and terracotta warmth with brass accents. **Mobile-first**; layout and touch targets assume narrow screens first, then scale up.

---

## 1. Color tokens (CSS custom properties)

Define on `:root` for light theme. Optionally mirror under `[data-theme="dark"]` or `@media (prefers-color-scheme: dark)` with paired values. Use **solid colors only** for text and UI fills (see Craft floor).

| Token | Hex | Role |
|-------|-----|------|
| `--color-canvas` | `#F6F0E8` | Page background (warm plaster / limewash) |
| `--color-surface` | `#FFFCF7` | Cards, sheets, elevated panels |
| `--color-surface-raised` | `#FFFFFF` | Modals, sticky bars (when needed) |
| `--color-border` | `#E5D9CC` | Hairline borders, dividers |
| `--color-border-strong` | `#C9B8A6` | Focus rings, selected containers |
| `--color-ink` | `#2A241D` | Primary text |
| `--color-ink-muted` | `#5C5349` | Secondary text, helper copy |
| `--color-ink-faint` | `#8A8177` | Tertiary / placeholders |
| `--color-brand` | `#B8613A` | Primary actions, key highlights (terracotta) |
| `--color-brand-hover` | `#9E4F2E` | Hover / pressed for brand |
| `--color-accent` | `#C6A04E` | Secondary emphasis (brass) |
| `--color-accent-muted` | `#A6853F` | Muted brass for icons / chips |
| `--color-inlay-dark` | `#4A3F35` | “Ebony” inlay, dark UI chrome |
| `--color-inlay-mid` | `#6B5B4D` | Secondary dark surfaces |
| `--color-success` | `#3D6B4A` | Positive state |
| `--color-warning` | `#C2873A` | Caution |
| `--color-danger` | `#B23B3B` | Destructive / error |
| `--color-focus` | `#1F6FEB` | Focus ring (keep distinct from brand) |

**Semantic aliases (optional, map to the above):**

- `--color-text-primary` → `var(--color-ink)`
- `--color-text-secondary` → `var(--color-ink-muted)`
- `--color-text-tertiary` → `var(--color-ink-faint)`
- `--color-bg-default` → `var(--color-canvas)`
- `--color-bg-elevated` → `var(--color-surface)`

**Dark theme suggestion:** deepen canvas (`#1C1814`), lift surfaces (`#252019` / `#2E2820`), lighten ink toward `#F2EBE3`, keep `--color-brand` and `--color-accent` readable on dark (test contrast; brass may need `--color-accent-on-dark` adjustment).

---

## 2. Typography

**Primary stack:** **IBM Plex Sans** via `next/font/google` for Latin + extended support.

**Hebrew:** Load IBM Plex Sans with `subsets: ["latin", "hebrew"]` (and `weight`/`style` as needed). If a glyph is missing, system fallback: `"Segoe UI Hebrew", "Noto Sans Hebrew", system-ui, sans-serif`.

**Monospace** (codes, IDs, tournament keys): IBM Plex Mono with matching `next/font` setup, or a single `--font-mono` variable.

**CSS variables (after `next/font` injects):**

- `--font-sans` — IBM Plex Sans  
- `--font-mono` — IBM Plex Mono (optional)

**Scale (Operate mode — calm, readable):**

| Role | Size | Weight | Line height | Notes |
|------|------|--------|-------------|--------|
| Display | `clamp(1.5rem, 4vw, 1.875rem)` | 600 | 1.25 | Page title only |
| Title | `1.25rem` | 600 | 1.3 | Section titles |
| Body | `1rem` | 400 | 1.5 | Default UI |
| Body strong | `1rem` | 600 | 1.5 | Emphasis inside paragraphs |
| Label | `0.875rem` | 500 | 1.4 | Form labels, tabs |
| Caption | `0.8125rem` | 400 | 1.4 | Meta, timestamps |
| Number / stat | `1.5rem`–`2rem` | 600 | 1.1 | Large numerals in stat cards (tabular nums) |

Use `font-feature-settings: "tnum" 1` (or `font-variant-numeric: tabular-nums`) for aligned stats.

**Hebrew-specific:** Allow slightly longer line lengths for readability; avoid justified body text in RTL. Headings and buttons should not hyphenate aggressively; prefer `word-break` / `overflow-wrap` sensible defaults per locale.

---

## 3. Spacing rhythm

**Base unit:** `4px` (`0.25rem`). All spacing steps are multiples.

| Token | Value | Use |
|-------|-------|-----|
| `--space-1` | `4px` | Tight icon gaps |
| `--space-2` | `8px` | Inline gaps, dense lists |
| `--space-3` | `12px` | Default inline padding in chips |
| `--space-4` | `16px` | Card padding (mobile), section gaps |
| `--space-5` | `24px` | Between blocks, card padding (tablet+) |
| `--space-6` | `32px` | Section separation |
| `--space-7` | `48px` | Major section breaks |
| `--space-8` | `64px` | Hero / empty state vertical rhythm |

**Layout:** Mobile default horizontal padding `--space-4`; widen to `--space-5` at `min-width: 640px`. Max content width for readable forms: `min(100%, 40rem)`; for dashboards with cards: `min(100%, 72rem)` with responsive grids.

**Touch targets:** Minimum `44×44px` for tappable rows and icon buttons on small screens.

---

## 4. Radius, shadow, borders

- **Radius:** `--radius-sm` `6px` (inputs), `--radius-md` `10px` (cards), `--radius-lg` `14px` (modals). Soft craft, not pills everywhere.
- **Shadow:** Restrained. Prefer border (`var(--color-border)`) over heavy shadow. Optional `--shadow-soft`: `0 1px 2px rgb(42 36 29 / 0.06), 0 8px 24px rgb(42 36 29 / 0.06)`.
- **Inlay hint:** Very subtle CSS background (low-contrast triangle or point pattern at ~3–5% opacity) on hero or stat band only — never behind dense data tables.

---

## 5. Navigation (Operate mode)

**Purpose:** Persistent wayfinding + account/context without stealing vertical space on mobile.

**Mobile (default):**

- **Bottom bar** or **top app bar** + overflow menu: max **4–5** primary destinations; icon + short label in Hebrew/English as needed.
- Active route: `color: var(--color-brand)` or bottom border `2px solid var(--color-brand)`; **no gradient text** on labels.
- Background: `var(--color-surface-raised)` or `var(--color-surface)` with top border `1px solid var(--color-border)` for separation.

**Desktop:**

- Optional left rail (`280px` max) or compact top nav with secondary items in a “More” pattern.
- Keyboard: roving `tabindex` for bar items; skip link to main.

**RTL:** Mirror bar order when `dir="rtl"`; icons that imply direction (chevrons, back) flip; logo position swaps to **inline-end**.

**Craft floor:** No eyebrow kickers above nav labels; no ultra-small all-caps preface lines. Titles are real titles or omitted.

---

## 6. Stat cards (dashboard)

**Structure:**

- Container: `background: var(--color-surface)`; `border: 1px solid var(--color-border)`; `border-radius: var(--radius-md)`; `padding: var(--space-4)` (mobile) / `var(--space-5)` (desktop).
- **Primary metric:** One large number (`--color-ink`, tabular figures). Optional short unit suffix same line, `font-size` from caption scale, `color: var(--color-ink-muted)`.
- **Label:** Single line under or beside the number — **sentence case** or natural Hebrew; **no eyebrow** line above the number, **no** tiny uppercase prelude.
- **Delta / trend:** Optional second row; use color tokens (`--color-success` / `--color-danger`) and icons; keep text solid, no gradient fills on glyphs.

**Backgammon nod:** Optional faint pip grid or single triangle watermark in card corner at ≤4% opacity of `--color-ink`; must pass contrast for WCAG non-text if interactive.

**Craft floor:** **No gradient text** on metrics or labels. No rainbow or dual-tone fills on numbers; use solid `var(--color-ink)` or `var(--color-brand)` only where emphasis is intended.

---

## 7. Motion: GSAP intro — dice 6 and 5 (“שש בש”)

**Behavior:** On **first load of the app shell** (once per session or once per cold load — choose one consistently), show a minimal dice motif: two faces reading **6** and **5**, with the Hebrew phrase **שש בש** adjacent or as accessible text. Duration **brief** (e.g. under `1.2s` total), then yield to content without blocking interaction (skip or fade when user navigates quickly).

**Implementation notes:**

- Use **GSAP** (`gsap`) with `@gsap/react`/`useGSAP` in a client component mounted at layout or a dedicated intro layer `position: fixed` with `pointer-events: none` after complete (or `none` throughout if purely decorative).
- **Respect `prefers-reduced-motion: reduce`:** Do not run position/scale/rotation tweens; either show static final frame for ~300ms or skip the intro entirely and show main UI. Also honor a `localStorage` flag if user dismisses branding once.
- Motion should not shift layout (no CLS); reserve space or overlay only the safe area.

---

## 8. RTL & Hebrew-capable UI

**Document:** Set `<html lang="he">` or `lang="en"` per route; set `dir="rtl"` or `dir="ltr"` on `<html>` or a wrapping provider based on locale.

**CSS:**

- Prefer **logical properties:** `margin-inline-start` / `end`, `padding-inline`, `inset-inline`, `border-inline-start`, `text-align: start` instead of left/right.
- **Icons:** Mirror directional icons (arrows, chevrons, forward/back) in RTL; do not mirror symmetric or locale-agnostic icons.
- **Numbers:** Tournament scores and IDs may stay LTR inside `dir="ltr"` spans or `unicode-bidi: isolate` when mixed with Hebrew sentences.

**Forms:** Labels align to **start**; error messages follow field block order consistently in both directions.

**Testing:** Exercise longest Hebrew strings in buttons, nav, and stat labels to avoid truncation bugs.

---

## 9. Accessibility & Operate requirements

- Text contrast: aim for **WCAG AA** minimum; brass/terracotta on light surfaces need verification.
- Focus: visible ring using `var(--color-focus)` (or `:focus-visible` with 2px outline and offset).
- Hit areas and form inputs large enough on mobile; errors associated with fields via `aria-describedby`.

---

## 10. Implementation checklist (engineering)

- [ ] Add IBM Plex Sans (+ Hebrew subset) and optional Plex Mono in root `layout` via `next/font`.
- [ ] Map tokens in `globals.css` and align Tailwind v4 `@theme` if used.
- [ ] Introduce nav shell (mobile-first) with RTL mirroring tests.
- [ ] Build stat card primitive per section 6; add Storybook or visual regression later if needed.
- [ ] Ship GSAP intro behind `prefers-reduced-motion` and session guard; ensure “שש בש” + dice 6/5 only once per chosen policy.

---

*This document defines the intended UI direction for Nivadi Competitions (Next.js app). Iterate tokens in code with real content and Hebrew copy.*
