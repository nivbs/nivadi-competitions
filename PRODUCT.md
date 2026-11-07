# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Next.js with TypeScript and React; deployed on Vercel (Hobby). Neon Postgres for the database. Shared site password plus signed cookies for player identity (Niv or Gilad). Drizzle ORM for database access.

## Users

**Primary users:** Niv and Gilad (a couple). **Scope:** a two-player-only product—there is no multi-participant or open-audience competitive model; usage is intentionally limited to these two accounts.

## Product Purpose

A web application for logging head-to-head competition results, starting with backgammon (Hebrew name: שש בש). Each recorded match should capture scores, optional notes, the date played, and **per-player clock time used**, where each player has up to **6 minutes** of clock per match. The product should support **analysis derived from cumulative results**, including statistics that incorporate time usage—not only win/loss and scores in isolation.

## Positioning

A **couple-only competition ledger** that treats **clock time** as structured match metadata alongside score, and emphasizes **longitudinal insight** from accumulated games—rather than a public league, tournament platform, or generic social scoreboard.

## Operating Context

- **Recording workflow:** After (or around) play, either user logs the match with the fields above; the system stores history for ongoing review.
- **Primary device posture:** **Mobile-first**—phones are expected to be the main surface for logging and reviewing results (**inferred:** tablets/desktop may exist but are secondary unless later confirmed).
- **Privacy posture:** **Private-ish**—intended for **two accounts** and not positioned as a broadly open or marketing-facing product (see Capabilities and Constraints).

## Capabilities and Constraints

### Confirmed capabilities

- Log **two-player** match results; **initial game:** backgammon (שש בש), with the product structured so additional games could be added later (**inferred:** extensibility is likely but not yet specified in scope detail).
- Capture **scores**, **optional notes**, **date played**, and **per-player clock time used** (budget: **6 minutes per player per match**).
- Provide **analysis** computed from **cumulative** history, explicitly including **time-related** metrics (exact charts and metrics **not** specified here).

### Technical and product constraints

- **Player cardinality:** Only two competitors in the product’s core model (Niv and Gilad); not designed for teams, spectators, or open registration flows unless explicitly expanded later.
- **Deployment and data:** Hosted on **Vercel Hobby** with **Neon Postgres**; **Hobby** plan limits and Neon operational limits apply (**inferred:** standard platform quotas; not enumerated here).
- **Authentication:** A **shared site password** plus **player selection** (Niv or Gilad) stored in signed HTTP-only cookies—not a public sign-up flow; intended for exactly two users.
- **Data access:** Historical matches and analyses are **private to the two accounts** (**inferred** from “private-ish” and two-account intent; exact sharing/export rules are **open**).

### Explicitly inferred (labelled)

- **Game roadmap:** Only backgammon is named at init; other games are **out of scope until explicitly added** (**inferred**).
- **Analysis contents:** Beyond “including time stats,” specific analytics (e.g., Elo-like ratings, streaks, averages, time-over-score correlations) are **not** locked—implementation should remain consistent with “cumulative results including time” (**inferred**).
- **“Private-ish” enforcement:** May combine password gate, no public leaderboards, and no SEO/indexing of scores (**inferred**); exact threat model (link sharing, exports) is **open**.

## Brand Commitments

No formal brand, voice, or marketing claims are recorded at init. The name **nivadi-competitions** reflects a personal/couple context only (**inferred** from repository naming; not a binding brand contract).

## Evidence on Hand

Repository-local documentation and this `PRODUCT.md` are the authoritative product record for init. No third-party testimonials, case studies, or press artifacts are claimed here.

## Product Principles

1. **Honest history:** Records reflect real played matches with consistent fields over time.
2. **Two-player focus:** Features stay coherent for exactly two known users unless the product purpose is explicitly broadened.
3. **Time as signal:** Clock usage is treated as meaningful competitive metadata, not optional trivia.
4. **Insight over snapshots:** The product should reward continued use through cumulative analysis, not only per-match data entry.
5. **Mobile-first practicality:** Logging and reading results should remain efficient on small screens (**stated requirement**).

## Accessibility & Inclusion

No specific accessibility conformance target (for example WCAG level) is established in this record. **Mobile-first** implies touch-appropriate layouts and readability on phones (**inferred**); any formal standard should be chosen and recorded in a later product or design decision.
