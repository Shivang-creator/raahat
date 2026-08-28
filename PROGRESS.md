# Progress after combined result journey

## What was built

- Slice 1: a mobile-first question screen with `Booking for` (myself / someone else), caregiver relationship and age-band controls, English/Hindi toggle, speech input with browser fallback, text input, examples, session-only capture feedback, a person-help route, and the prototype banner.
- Slice 2: a flat front/back body map whose large figure is the primary input. The figures now fill the phone width, every figure hit area is at least 56px in both dimensions, and each drawn body area is a native, keyboard-reachable button with a visible focus ring, pressed fill, and accessible name. The twelve-region text list remains below as a clearly demoted fallback. A no-location row handles fever, weak all over, or not sure before the map. The selected place is announced in the chosen language, followed by a ten-option picture-led kind question, then duration and severity.
- The map-only flow ends at an observed summary showing optional place, kind, duration, and severity. Typed words remain visible verbatim if the citizen opens the map after typing.
- Slice 3: the map state now becomes a structured `Complaint`; Screen 2 shows editable observed chips with an explicit Confirm / Change something gate; Screen 3 shows the ordinary department or the full Emergency instruction after confirmation.
- The routing table is data-only in `routing-rules.js`, with nine separate red flags that always win. `routing.js` is a pure function with no DOM, model, or network dependency. Five named tests cover the required invariants.
- Combined result journey: ordinary department results now lead to one result screen containing a chosen-locality picker, three verified Delhi government hospitals, deterministic seen-soonest sorting, honest simulated waits, calendar-opening copy, first-visit/returning carry lists, mock sign-in with printed credentials, one-tap human check, printable/downloadable specimen slip, and the rights card.
- Hospital metadata lives in `hospital-data.js`; names, locations and departments carry official source URLs and a 27 Aug 2026 check date. Slots, waits, travel figures, fees and identifiers are simulated and tagged in the interface.
- The final build is deployed to the public stable alias: https://raahat-shivcreates.vercel.app

## Decisions recorded

- Keep the app as one static HTML page with vanilla CSS and JavaScript; no build framework, server state, or model call yet.
- Use browser Web Speech API when available; show an explicit type/body-map fallback when it is not.
- Keep Slice 1's Continue and Slice 2's map completion at a clear “ready for next step” boundary. Do not route, diagnose, or show a department before Slice 3's explicit Confirm.
- Represent the body as a flat SVG silhouette with native HTML buttons over each drawn region. Stack the front and back figures on phones so no hit area is smaller than 56px. Keep upper/lower back as one region and keep whole body/general in the fallback list so the figure remains the primary, no-reading route. Record kind separately from optional region; no UI element chooses a department in Slice 2.
- Keep typed text visible but unparsed in Slice 3. It routes to an honest choose-a-department outcome, never to reassurance. No model call is present in this slice.
- Keep the post-routing journey in one progressive result screen so the citizen sees the department, hospital choice, carry fork, sign-in gate and specimen slip as one continuous path.

## What is broken or intentionally incomplete

- No known broken interaction in these slices; the local browser check confirms the map loads without console errors, every figure control can be clicked, the chest selection fills and announces correctly, and the Hindi label updates.
- The browser speech path depends on the browser's Web Speech API and microphone permission; this is intentionally not a model integration.
- The Screen 7 honesty page is still intentionally incomplete. Emergency results correctly stop before hospital selection or sign-in.

## Slice 3 verification

- Local `npm test`: 8 passed, including hospital count, deterministic sorting, and realistic-wait checks.
- Static 390px-oriented CSS, inline module syntax, and public HTTP checks pass. The prescribed `agent-browser` CLI is not installed in this workspace, so an automated visual/browser walk could not be run here.
- Public alias and deployed `routing.js` / `routing-rules.js` / `hospital-data.js`: HTTP 200; page title `राहत · Raahat`; `.env.local`, `AGENTS.md`, and `PROGRESS.md` are HTTP 404.
