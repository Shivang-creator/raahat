# BUILD ORDER

Build in **vertical slices**. Each slice ends with something that runs in a browser and can be shown.
Never build a layer across the whole app and move on — every winner's build narrative at OpenAI's own
Build Week was slice-shaped, and it is also the only way to be safe against the deadline.

**Deadline: 28 August 2026, 20:00 IST. Internal cutoff 17:00.**
If you are behind, cut from the bottom of this list. Never cut Slices 1, 2, 3 or 8.

---

### Slice 0 — foundation
Repository, a page that loads, deploy pipeline working end to end, and the prototype banner visible.
**Deploy on the first slice, not the last.** A live URL that shows one sentence is worth more than a
perfect local build at 19:00 on Friday.
*Done when:* a public URL opens in a private browser window on a phone and shows the Raahat title.

### Slice 1 — Screen 1, the question
"Booking for" · the text input · the language toggle · example chips · the prototype line.
*Done when:* a visitor can type a complaint and press continue, on a phone, with no login.

### Slice 2 — Screen 1b, the body map
Flat front/back silhouette, twelve labelled tappable regions, keyboard reachable, plus the two
follow-up questions. **This is the signature interaction — give it real time.**
*Done when:* a visitor who types nothing at all can still reach Screen 2.

### Slice 3 — Screen 2, the read-back, and the routing
The editable complaint, the confirm step, the rule file, the routing function, its tests, and
Screen 3's two outcomes including the red-flag interstitial.
*Done when:* a red-flag phrase reaches Emergency, an ordinary complaint reaches a named department
with a visible rule id and reason, and both work with the model switched off.

### Slice 4 — the model layer
Speech input, and the model reading free text into a structured complaint. Everything already works
without it; this makes it feel effortless.
*Done when:* speaking a sentence produces the same read-back screen as typing it, and unplugging the
model degrades to the body map with an honest message rather than an error.

### Slice 5 — Screen 4, where honestly
The three hospital cards, sorted by seen-soonest, with the honest wait and the calendar-opens line.
*Done when:* the wait is on screen and reads as a truth the portal currently hides.

### Slice 6 — Screen 5 and 6, carry list, sign-in and the slip
The checklist, the mock sign-in with credentials printed, the one-tap human check, the printable slip
with the honest wait and the rights card on it.
*Done when:* a judge can complete the whole journey and hold a slip.

### Slice 7 — Screen 7, honesty
The what-is-real page, opening with what ORS already does well.
*Done when:* it is linked from every screen.

### Slice 8 — the pass that wins the 2.5% cut
Go back to Screen 1 and Screen 3 and make them beautiful. A judge sees the first screen for fifteen
seconds and may never reach Slice 6. Then: check every screen at 390px, run a keyboard-only pass, run
a screen-reader pass, throttle the network to 3G, and fix what breaks.
*Done when:* the first screen is the best-looking thing in the build.

### Below the line — only if everything above is done
A third language. Saving a person you book for often. A shareable link for the slip.

---

## Definition of done for the whole build

- [ ] A public URL opens in a private window on a phone, with no access request
- [ ] Mock login credentials are printed on the sign-in screen
- [ ] The whole journey works without logging in, until the slip
- [ ] Every input works by speaking, typing **and** tapping
- [ ] With the model switched off, the journey still completes
- [ ] Every red flag reaches Emergency, and one flag is enough
- [ ] Every number on screen carries a tag
- [ ] The prototype line is on every screen; no emblem anywhere
- [ ] The honesty screen is reachable from everywhere
- [ ] Nothing in the demo is described rather than shown

## The first prompt to give

> Read `CONTEXT.md`, then `AGENTS.md`, then `RESEARCH.md`, then `SPEC.md`, `DESIGN.md`, `DATA.md` and
> `BUILD-ORDER.md`. Do not write any code yet.
>
> Then tell me back, in your own words: what we are building, who it is for, the one sentence it
> exists for, and what you are forbidden from doing. List anything in those files that is ambiguous
> or that you think is a mistake.
>
> After I confirm, build **Slice 0** and stop. Do not start Slice 1 in the same turn.

Before Slice 2 read `craft/design.md`, before Slice 3 read `craft/engineering.md`, before every
deploy read `craft/deploy.md`, and at the end of each slice read `craft/verification.md` and check
your own work against it.

Insist on that read-back before any code. It is the cheapest way to catch a misread spec, and it
costs one minute.
