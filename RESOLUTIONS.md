# Resolutions — answers to the eight issues raised in the spec read-back

All eight were correct. Six were genuine errors in the spec and are now fixed in the files. Read this
once, then work from the updated files.

| # | Issue raised | Resolution | Fixed in |
|---|---|---|---|
| 1 | `Observed` tag conflict — hospital names are not entered by the citizen | **A fifth tag, `Verified`**: a published public fact carrying a source URL and the date checked. Hospital names and department lists are `Verified`. Their availability, waits and slots stay `Simulated`. | `AGENTS.md` §4, `DATA.md` |
| 2 | "Three routes" over-broad — cannot apply to a language toggle | **Scoped to complaint entry only.** Any one of speak / type / body map must complete the journey alone. Other controls are ordinary form controls: 56px, keyboard reachable, screen-reader labelled, no voice route needed. | `AGENTS.md` §8, `DESIGN.md` |
| 3 | Model-off typed path underspecified | **Keep their words on screen, verbatim.** Say *"I can't read this right now. Point to where it hurts and I'll carry on."* Then the body map and follow-ups. **Never discard what they typed, never guess a region from it.** | `SPEC.md` Screen 2 |
| 4 | "Nearest Emergency" has no location design | **Location is chosen, never taken.** A locality picker on Screen 4, preset to a demo locality so a judge sees results immediately. No silent geolocation, ever. If offered, it is an explicit button. | `SPEC.md` Screens 3 and 4 |
| 5 | "Seen soonest" has no defined rule | **Deterministic:** estimated seen-time = slot start + simulated wait. Ties break on shorter travel time, then hospital name alphabetically, so the order is stable across reloads. The sort key is shown on the card, tagged `Simulated`. | `SPEC.md` Screen 4 |
| 6 | No-route states have no next action | **New Screen 3b.** Nothing understood → keep their words, offer body map and self-selection. No hospital has that department → widen locality, name the nearest that does. No slots for two weeks → show the honest wait, name when the calendar opens, say walk-in registration still exists. **Every screen carries a "Talk to a person" route.** | `SPEC.md` Screen 3b |
| 7 | Hospital facts need provenance | Each hospital record carries **source URL and date checked**. That is what earns the `Verified` tag. | `DATA.md` |
| 8 | Model call transmits the complaint even if nothing is stored | **Disclose before sending, and offer the way out.** One plain line before the first model call: *"To read this in your own words we send this sentence to an AI service. Tap the body map instead if you would rather not."* The body map path sends nothing. Repeated on the honesty screen. | `AGENTS.md` §6 |

## Two of these are now scoring features, not just fixes

**#8 is the honesty beat.** Almost nobody in this field will admit that "we don't store it" and "we
don't send it" are different claims. Saying it out loud, and shipping a route that genuinely sends
nothing, is exactly what the Honesty criterion rewards.

**#6 is the product.** A portal that dead-ends is the thing being replaced. Every screen having a way
forward is the difference between a redesign and a mockup.
