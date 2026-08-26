# AGENTS.md — the boundary this build may not cross

Written before the first line of code, and quoted in the submission. Read it before every session.

**Raahat** helps a citizen get to the right OPD counter at a government hospital. It is not a doctor
and must never behave like one.

---

## 1. The model never decides

The model has exactly one job: read what a person typed or said, in their own words and their own
language, and turn it into a **structured complaint**.

```
model  :  free text        ->  Complaint { region, duration, severity_markers, age_band, unclear[] }
code   :  Complaint        ->  Department + urgency + what to carry
```

The model may not output a diagnosis. It may not output a department. It may not output "you are
fine". Those come from the rule file, through code.

**If the model is unavailable the app still works**, because the body map produces the same
`Complaint` without it. Nothing that changes a destination may depend on the model being up.

## 2. Red flags are code, and one is enough

A defined list of emergency markers routes straight to *"go to Emergency now, do not book an
appointment"*. That list lives in the rule file with an id for each entry.

**One red flag escalates, regardless of everything else.** A calm-sounding sentence that contains
"weakness on one side" still goes to Emergency. Do not average, do not score, do not weigh it against
reassuring signals. This is deliberate over-caution.

The model may raise a flag it read. **The model can never clear a flag.** Only code decides.

## 3. The app never tells anyone they are fine

There is no "no action needed" outcome. The lowest outcome is *"book a routine OPD slot"*, and every
screen has a visible way to reach a human. A wrong reassurance is the one failure this prototype must
not have.

## 4. Every value on screen carries a tag

| Tag | Meaning |
|---|---|
| **Observed** | the citizen entered it in this session |
| **Verified** | a published public fact — carries a source URL and the date it was checked |
| **Rule** | computed by code from the rule file — the rule id is shown next to it |
| **Simulated** | mock data we generated |
| **Generated** | written by the model, prose only, never a decision |

Hospital names and department lists are **Verified**, not Observed. Their availability, waits and
slots are **Simulated**.

No unlabelled number appears anywhere in the interface.

## 5. Nothing is decided without the citizen seeing it first

After the complaint is read back, the citizen edits and confirms it before any routing happens.
Nothing is booked, sent or decided on their behalf without an explicit confirm step.

## 6. It is a prototype and says so

Every screen carries: *independent prototype · mock data · not affiliated with any government body.*
No emblems, no government logos, no `.gov` styling. No real Aadhaar, ABHA, UHID, OTP, phone number or
health record is ever collected or stored. The mock login credentials are printed on the sign-in
screen. A complaint the visitor types is held in their browser for the session and never persisted
server-side.

**The model call is a disclosure, not a silence.** Reading free text means sending that text to a
model provider. Before the first such call, the screen says so in one plain line — *"To read this in
your own words we send this sentence to an AI service. Tap the body map instead if you would rather
not."* — and the body map path never sends anything. This is repeated on the honesty screen. Do not
transmit anything the citizen has not seen and confirmed.

## 7. What this prototype does not do

It does not connect to ORS or any government system. It does not book a real appointment. It cannot
see real slot availability. It is not medical advice and does not replace calling a doctor or going
to a hospital. It covers a limited set of departments at a limited set of hospitals.

## 8. Accessibility is a hard requirement, not a polish pass

**Describing the complaint** always has three routes and none is ever required: **speak · type ·
tap the body map**. Any one of them alone must complete the journey.

This rule is scoped to complaint entry. Controls like the language toggle, the caregiver
relationship, the age band, sign-in and the human check are ordinary form controls — they must be
keyboard reachable, screen-reader labelled and 56px, but they do not need a voice or body-map route.
Details in `DESIGN.md`.
