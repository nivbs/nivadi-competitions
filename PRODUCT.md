# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Next.js with TypeScript and React; deployed on Vercel (Hobby). Neon Postgres for the database. Shared site password plus signed cookies for player identity (Niv or Gilad). Drizzle ORM for database access.

## Users

**Primary users:** Niv and Gilad (a couple). **Scope:** a two-player-only product—there is no multi-participant or open-audience competitive model; usage is intentionally limited to these two accounts (**confirmed:** no plan to broaden the audience at this time).

## Product Purpose

A web application for logging head-to-head competition results, starting with backgammon (Hebrew name: שש בש). A record is a **session** of games played in a row. Each game stores its winner, **win type** (normal = 1 point, Mars/gammon = 2, backgammon = 3) and **per-player clock time used**. The built-in clock has a configurable bank and per-move delay (default 6:00 + 12s) and resets per game. The product should support **analysis derived from cumulative results**, including statistics that incorporate time usage—not only win/loss and scores in isolation.

## Positioning

A **couple-only competition ledger** that treats **clock time** as structured match metadata alongside score, and emphasizes **longitudinal insight** from accumulated games—rather than a public league, tournament platform, or generic social scoreboard.

## Operating Context

- **Recording workflow:** After (or around) play, either user logs the match with the fields above; the system stores history for ongoing review. The **timer** route supports live clock play; confirming a winner from the timer can **auto-save** the game into the current session.
- **Primary device posture:** **Mobile-first**—phones are expected to be the main surface for logging and reviewing results (**inferred:** tablets/desktop may exist but are secondary unless later confirmed).
- **Locales:** **Hebrew and English are both first-class**; **Hebrew is the default**. UI direction follows locale (RTL for Hebrew, LTR for English).
- **Privacy posture:** **Private-ish** via a **shared site password**; not marketed or indexed as a public product. Someone with the URL and password can access the site; no separate per-user accounts beyond picking Niv or Gilad (**confirmed**).

## Capabilities and Constraints

### Confirmed capabilities

- **Routes (Operate surfaces):** home dashboard, session **log** editor, **timer**, cumulative **analysis**, session **history** (list and detail), and **sign-in** (site gate + player pick).
- Log **two-player** match results; **initial game:** backgammon (שש בש). Code is competition-scoped so additional games *could* be added later; **none are planned** (**confirmed**).
- Capture **games per session** with win type, **optional notes**, **date played**, and **per-player clock time used**; full edit and delete (bank and delay are configurable; default 6:00 + 12s per game).
- **Cumulative analysis** (from stored sessions/games), including: session and game totals; per-player tallies; session win counts; game win rate; share of wins that were Mars/backgammon; average clock time used and time advantage; timeout counts; current win streak; estimated games per week (**confirmed** in codebase; presentation may evolve).

### Technical and product constraints

- **Player cardinality:** Only two competitors in the product’s core model (Niv and Gilad); not designed for teams, spectators, or open registration flows unless explicitly expanded later.
- **Deployment and data:** Hosted on **Vercel Hobby** with **Neon Postgres**; **Hobby** plan limits and Neon operational limits apply (**inferred:** standard platform quotas; not enumerated here).
- **Authentication:** A **shared site password** plus **player selection** (Niv or Gilad) stored in signed HTTP-only cookies—not a public sign-up flow; intended for exactly two users.
- **Data access:** Match history is reachable by anyone who can pass the site password; there is no fine-grained sharing model, export policy, or “leaked link” hardening beyond the gate (**confirmed**).

### Explicitly open (not decided)

- **Additional games:** Extensibility is possible in the data model; **no roadmap** of new games (**confirmed**).
- **Exports / read-only sharing / SEO:** Not required today; may be revisited if the product outgrows the couple-only context.

## Brand Commitments

- **World:** a Middle-Eastern backgammon (shesh-besh) board: dark walnut, cream felt, gold inlay, a little burnt red/orange, Arabesque geometry. Playful and a little cheeky, with many small backgammon motifs (points, checkers, dice, doubling cube, stitched seams).
- **Player-color law (confirmed):** Niv is always the dark side (walnut brown / black checkers). Gilad is always the light side (white / beige / cream checkers). This is a fixed identity in every screen and language, and never depends on who is signed in. Brand terracotta, gold and red never represent a player.
- **Dice rule (confirmed):** dice show pips, never numerals. Odd faces (1, 3, 5) have red pips, even faces (2, 4, 6) have black pips. Dice are white with 3D bevel and soft shadow. "6 and 5" in the intro are a 6-pip and a 5-pip die. The doubling cube may show 2 to 64.
- **Motion (confirmed):** GSAP animations on user actions, funny and skippable; concepts are approved by the owner before they are built.
- The name **nivadi-competitions** reflects a personal/couple context only. Product copy is maintained in **Hebrew and English** dictionaries in-repo.

## Evidence on Hand

Repository-local documentation (`README.md`, `PRODUCT.md`), Hebrew README copy, unit tests for scoring/clock/analysis, and seeded competition data are the authoritative artifacts. No third-party testimonials, case studies, or press artifacts are claimed here.

## Product Principles

1. **Honest history:** Records reflect real played matches with consistent fields over time.
2. **Two-player focus:** Features stay coherent for exactly two known users unless the product purpose is explicitly broadened.
3. **Time as signal:** Clock usage is treated as meaningful competitive metadata, not optional trivia.
4. **Insight over snapshots:** The product should reward continued use through cumulative analysis, not only per-match data entry.
5. **Mobile-first practicality:** Logging and reading results should remain efficient on small screens (**stated requirement**).
6. **Bilingual parity:** Hebrew and English both remain usable; default to Hebrew without hiding English (**confirmed**).

## Accessibility & Inclusion

**Confirmed posture:** Optimize for **mobile touch**, readable type, and **`prefers-reduced-motion`** (e.g. GSAP intro respects reduced motion). Given the **two known users** and personal scope, there is **no commitment to formal WCAG certification**; still apply reasonable contrast, focus visibility, and logical structure as the UI evolves (**confirmed** with practical baseline; not a public compliance target).
