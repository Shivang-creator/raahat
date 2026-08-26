# SPEC — the screens

Seven screens. Build them in the order in `BUILD-ORDER.md`, one working thing at a time.
Mobile first: a judge will open this on a phone. Everything must work at 390px wide.

---

## Screen 1 — What's wrong?

The whole screen is the question. No header, no menu, no login, no captcha, no marketing.

- The title `राहत · Raahat` and the line *Point at where it hurts. We'll do the rest.*
- **Booking for:** two large buttons — `Myself` / `Someone else`. Chosen before anything else,
  because the person holding the phone is usually not the patient.
- One large input with three ways to answer, all visible at once:
  - a **microphone** button (speak it)
  - a **text box** (type it), placeholder in the citizen's voice: *"seene mein dard, kal raat se"*
  - a **body map** button (point at it) — see Screen 1b
- A language toggle: **English / हिंदी**. Placeholder, labels and results all follow it.
- Three tappable example chips so a judge can start without typing.
- The prototype line at the foot of the screen.

If `Someone else` is chosen, one extra question appears: **who?** (`my parent`, `my child`,
`someone else`) and an age band. This changes the department and the red-flag set, so it is asked
here and not buried later.

## Screen 1b — The body map

A **flat, two-dimensional silhouette**, front and back, with about twelve large tappable regions:
head, face/jaw, neck, chest, upper abdomen, lower abdomen, back (upper/lower), arm, hand, leg, foot,
plus a `whole body / general` option for fever and weakness.

This is a **first-class input, not a fallback**. Someone who cannot read can complete the journey
with it alone. Each region is a real, labelled, keyboard-reachable control ("upper right chest"), not
a hotspot on an image.

Do not build a 3D model. It costs sight, fine motor control and a fast device — the three things
this audience is least likely to have.

After a region is tapped, ask at most two follow-ups in plain words: *how long?* and *is it severe
right now?* Both offer large buttons, not free text.

## Screen 2 — This is what I understood

The read-back. Nothing is decided until the citizen confirms it.

- The structured complaint as editable chips: **region · how long · severity markers · who it's for**
- Anything the model could not parse is listed plainly: *"I did not understand: …"* — never guessed
- A visible **Confirm** button and an equally visible **Change something** path
- Tags: the typed or spoken text is `Observed`, the summary is `Generated`, any flag is `Rule`
- If the model is unavailable this screen still appears, built from the body map, and says so

## Screen 3 — Where to go

Two outcomes only, and no third.

**If a red flag fired** — a full-screen result, no other options competing for attention:
> **Go to the Emergency department now. Do not book an appointment.**
The nearest hospital with an emergency department, its address, and one line naming the rule that
fired (`RF-02 · weakness on one side`). A visible line: *this is not a diagnosis.*

**Otherwise** — the department, in plain words, with the reason:
> **General Medicine.** Chest discomfort without breathlessness starts here. They refer you to
> Cardiology if it needs it.
Show the rule id. Below it, always: *Not right? Choose a department yourself* — never trap anyone in
our answer.

## Screen 4 — Where, honestly

Three hospitals that **actually have that department**, sorted by **seen soonest**, not by distance.
Each card shows:

- travel time and distance `Simulated`
- next open slot `Simulated`
- **the honest wait**: *"Slot 10:00. People with this token are usually seen by 12:30."* `Simulated`
- **when the calendar opens**: *"Slots for next week open Monday, 07:00."* `Simulated`

The honest wait is the differentiator. ORS gives a slot time that is not a time, because the doctor
still sees patients in order. Say the true thing.

## Screen 5 — What to carry

A short checklist that changes on one fork: **first visit** (a photo ID, the phone that receives the
OTP) versus **returning** (your UHID, your previous slip). Plus the fee line. Everything `Simulated`.

## Screen 6 — Sign in, then the slip

**This is the first time a login appears.** Everything above is usable without an account, because
identity is needed to hold a slot, not to find out where to go.

- Mock sign-in, **credentials printed on the screen** in large text
- One tap human check here — this is where the scarce thing is. Not at the front door.
- Then the slip: patient, department, hospital, mock appointment ID and UHID, slot time, and **the
  honest wait printed on it**. Watermarked `SPECIMEN — NOT A REAL APPOINTMENT`.
- One line of what the citizen said, for the doctor to read in five seconds:
  *"Patient reports: chest discomfort, 3 days, no breathlessness."*
- **The rights card, on the slip:** *If you are turned away with this slip — note the appointment ID,
  raise a grievance at pgportal.gov.in, or file an RTI asking why a valid online appointment was not
  honoured.* Sourced in `RESEARCH.md`.
- Printable and downloadable.

## Screen 7 — What is real and what is not

Reachable from every screen. In this order:

1. **What ORS already does well** — lab reports, blood availability, cancellation by appointment ID,
   ABHA integration, an official mobile app. Name these first so nobody thinks we claim to have
   invented them.
2. Nothing here connects to ORS. No appointment is real.
3. Every hospital, slot, wait, queue position, appointment ID and UHID is mock.
4. The department mapping is a small hand-written rule file, not a clinical protocol, and has not
   been reviewed by a medical body.
5. This is not medical advice.
6. What was used to build it, and which part each thing did.

---

## The logic layer — keep it small

One rule file and one pure routing function. That is the whole engineering budget.

- **The rule file** — every entry has: an id, what it matches, the destination department, a plain
  reason in English and Hindi, and a severity. Red flags are a separate block and always win.
- **The routing function** — takes a Complaint, returns department, urgency, rule id and reason. No
  network, no interface code inside it.
- **A handful of tests**, covering: every red flag reaches Emergency; a complaint the model could not
  parse never routes to a reassurance; the model cannot clear a flag; the same complaint always
  produces the same department.

Do not build more logic than this. The hours belong to the screens.
