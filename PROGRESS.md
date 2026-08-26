# Progress after Slices 1 and 2

## What was built

- Slice 1: a mobile-first question screen with `Booking for` (myself / someone else), caregiver relationship and age-band controls, English/Hindi toggle, speech input with browser fallback, text input, examples, session-only capture feedback, a person-help route, and the prototype banner.
- Slice 2: a flat front/back body map with exactly twelve semantic, keyboard-reachable region buttons, no model or network dependency, and two follow-ups: duration and severity right now.
- The map-only flow ends at an observed summary showing the selected place, duration, and severity. Typed words remain visible verbatim if the citizen opens the map after typing.
- Both checkpoints are deployed to the public stable alias: https://raahat-shivcreates.vercel.app

## Decisions recorded

- Keep the app as one static HTML page with vanilla CSS and JavaScript; no build framework, server state, or model call yet.
- Use browser Web Speech API when available; show an explicit type/body-map fallback when it is not.
- Keep Slice 1's Continue and Slice 2's map completion at a clear “ready for next step” boundary. Do not route, diagnose, or show a department before Slice 3.
- Represent the body as decorative flat SVG silhouettes and make the labelled buttons the actual input surface. Combine upper/lower back into one control so the map has twelve controls including whole body/general.

## What is broken or intentionally incomplete

- No known broken interaction in these slices; local and live axe audits report zero violations and zero incomplete checks.
- The browser speech path depends on the browser's Web Speech API and microphone permission; this is intentionally not a model integration.
- The read-back screen, structured complaint object, rule file, routing function, red-flag handling, and department/hospital journey do not exist yet. The current observed summary is the handoff to Slice 3, not a routing decision.

## Slice 3 should start with

1. Re-read `AGENTS.md`, then `craft/engineering.md`.
2. Turn the map state into the structured `Complaint` shape without allowing free text or a model to choose a department.
3. Build Screen 2's editable read-back and explicit confirm/change step, preserving the observed text and showing Generated/Rule tags correctly.
4. Add the data-only routing rules and tests, with one red flag always winning, then build Screen 3's Emergency and ordinary-department outcomes.
