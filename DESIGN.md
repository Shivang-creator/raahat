# DESIGN — how it looks, and how it stays usable for everyone

The Usability criterion reads: *"Is the experience simpler, clearer and **more accessible**?"*
Accessibility is scored. Treat every rule below as a requirement, not a preference.

---

## The feeling

A worried person, often at night, often holding the phone on behalf of someone older. Calm, plain,
large, unhurried. Nothing flashes, nothing counts down, nothing moves on its own.

Not a government site. Not a startup landing page. Closer to a well-made form at a good clinic.

## Tokens

| | |
|---|---|
| Body text | never below **18px**. Primary question 28–32px. |
| Tap targets | minimum **56px**, with 8px between them |
| Contrast | every text/background pair at least **4.5:1**; large text at least 3:1 |
| Line length | 60–70 characters maximum |
| Type | system font stack. No web fonts — they cost a round trip on a slow connection. Devanagari must use the OS Hindi font and get 1.6 line-height. |
| Colour | a calm neutral ground, one accent for actions, one red reserved **only** for emergency. Red appears nowhere else. |
| Motion | one 150ms fade at most. Everything disabled under `prefers-reduced-motion`. |

## The three input routes

```
speak   ·   type   ·   tap the body map
                ↓
        the same structured complaint
```

**Scoped to describing the complaint.** Any one of speak, type or body map must complete the journey
on its own. Ordinary controls — language toggle, caregiver relationship, age band, locality picker,
sign-in, the human check — are normal form controls: 56px, keyboard reachable, screen-reader
labelled, but they need no voice or body-map route. This single rule covers most of the audience at once: a non-literate user taps, a Deaf
user types, a user with a tremor taps large targets, a blind user speaks and listens, and someone in
a noisy corridor types.

## Who this has to work for

| Who | What it means here |
|---|---|
| **Elders** | 18px floor, 56px targets, Hindi first if the device is Hindi, no timers anywhere, and the caregiver flow below |
| **Children** | never the operator. `Booking for: someone else` → age band → Paediatrics and a different red-flag set |
| **Low literacy** | the body map alone completes the journey. Every label has an icon. Plain words at roughly class-5 reading level. No acronym is used without expanding it once. |
| **Blind / low vision** | real semantic HTML, one `h1` per screen, body regions are labelled buttons not image hotspots, the routing result is announced in a live region, the full journey is keyboard-reachable, visible focus rings |
| **Deaf / hard of hearing** | voice is never the only route; no audio-only cue anywhere |
| **Motor impairment** | large targets, no drag, no hover-only behaviour, no double-tap, one-handed reach, no time limit on any input |
| **Neurodivergent** | **no countdowns, no auto-advance, no surprise modals, nothing disappears.** Every screen states what happens next. The read-back screen exists so nothing is decided unseen. |
| **Slow network, low-end phone** | small payload, no 3D, no web fonts, no heavy libraries. It should be usable on 3G. |

## Two accessibility decisions that are also product decisions

**1. There is no captcha at the front door.** Distorted-text captchas are a known barrier for
dyslexic and low-vision users, and ORS places one on the login screen of a health portal. The abuse
control is real and necessary — appointment touting is a genuine problem — so it moves to slot
confirmation, where the scarce thing actually is, as a single tap.

**2. Caregiver mode is accessibility.** A 61-year-old is served by their son holding the phone. ORS
opens with *"verify yourself"*. Raahat opens with *"who is this for?"*

## Severity is never colour alone

Every urgency level carries **a word, an icon and a colour**. Emergency reads "Go now" with an icon
and red. Someone who cannot distinguish red still gets the message.

## States to design, not improvise

Empty · loading · model unavailable · no network · nothing understood · no hospital has that
department · no slots for two weeks · signed out · print view.

Each gets real copy. "Model unavailable" says so plainly and shows the body map instead — it never
shows a confident department it did not compute.

## What not to build

No 3D. No avatar. No chatbot with a turn-taking conversation — one shot and a read-back is the
interaction. No carousel. No splash screen. No cookie banner. No government emblem, seal, or
`.gov`-style blue header.
