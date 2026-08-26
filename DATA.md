# DATA — what to create, and how it must be labelled

Everything a visitor could mistake for live availability is **mock and tagged**. Everything that
makes the product feel real is **public fact and tagged**.

---

## Real, because it makes the prototype credible

**Hospital names and their department lists.** Use real government hospitals and the departments they
genuinely run — AIIMS Delhi, Safdarjung, Lady Hardinge, a few large state hospitals, and at least two
district-level hospitals so it is not all metro. These are public facts. Tag them `Observed`.

Include, per hospital: name, city, state, the department list, and whether it has an emergency
department.

**Do not** use any hospital's logo, emblem or crest. The name in plain text only.

**Departments** should be the real OPD department names a citizen would see on a board: General
Medicine, Cardiology, Orthopaedics, Paediatrics, Dermatology, ENT, Ophthalmology, Gynaecology,
Neurology, Gastroenterology, Psychiatry, Dental, General Surgery, Emergency.

## Rule, because code decides with it

**The complaint → department rule file.** Each entry: an id, what it matches (body region, plus
optional duration or severity marker, plus optional age band), the destination department, a plain
one-line reason in English and Hindi, and a severity.

**The red-flag block**, kept separate and always winning. Cover at least: chest pain with
breathlessness or sweating · weakness or numbness on one side, or slurred speech · a baby under two
months not feeding · heavy bleeding · a fever with a stiff neck · a severe headache that came on
suddenly · difficulty breathing · a seizure · thoughts of self-harm. Each gets an id (`RF-01`…).

Write these as data, not as branching code, so a hospital could edit the file without touching the
build. That is the answer to "how would this scale".

**These rules are hand-written and must be labelled as such**, including on the honesty screen: not a
clinical protocol, not reviewed by any medical body.

## Simulated, because it cannot be real

Everything below is generated, plausible, and clearly tagged `Simulated`:

- every appointment slot and its time
- every wait estimate and queue position
- travel time and distance
- every appointment ID, UHID, ABHA and phone number
- every patient record and every account
- the mock login credentials, printed on the sign-in screen

Make the numbers plausible, not flattering. A realistic wait is two to three hours, not fifteen
minutes. A realistic next slot for a busy department is several days out, not tomorrow. The product's
credibility comes from telling an uncomfortable truth accurately.

## Never present anywhere

Real Aadhaar, real ABHA, real UHID, a real OTP, real payment details, a real person's health record,
or anything scraped from a government system.
