---
version: 1
slug: "src-app"
primary_target: "src/app"
related_targets: []
---

# Surface brief: app shell and all authenticated routes

Scope and mode: Operate. Home, log, timer, history, analysis, sign-in for two known players (Niv dark, Gilad light), mobile-first, Hebrew default, RTL.

Audience, job, constraints: log and review backgammon sessions fast on a phone. Data stays scannable. Player-color law and dice rule from PRODUCT.md and DESIGN.md are binding.

Motif density budget: heavy in shell, hero, sheets headers, sign-in and empty states; light in cards; none behind tables, number lists or form fields.

Contrast rule: dark walnut chrome with cream text, cream felt with walnut ink. A Niv checker always carries a gold hairline, a Gilad checker always a walnut hairline.

## Direction contract

THESIS: the whole app is one backgammon board seen from above, a walnut frame around a felt playfield, refusing the category default of a light neutral dashboard with a terracotta button.
OWN-WORLD: walnut #2f1a0e, felt #f2dfbf, tan and dark points, gold #d4a64a inlay, burnt red-orange #b8431f, ivory and brown checkers with rims, white 3D pip dice (red odd, black even), stitched dashed seams, eight-point star dividers, Frank Ruhl Libre display.
STORY: the visitor sees who leads at a glance as two checker stacks, logs a game by picking a checker and a die, and feels a game of shesh-besh is on the table.
FIRST VIEWPORT: walnut header with the 64 cube logo and a points strip, then a felt panel: display title, a score hero with Niv's brown stack versus Gilad's ivory stack, latest session as checker chips, primary action under the thumb.
FORM: board-game surface (skeuomorphic accents inside a flat Operate layout), seed: none (pinned) "I want the website to be in style of backgammon board".
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance.

Unresolved: animation concepts await owner approval before implementation.
