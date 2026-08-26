# READ THIS FIRST

You are building **राहत · Raahat** — *Point at where it hurts. We'll do the rest.*

A rethink of India's government hospital appointment portal, **ORS** (`ors.gov.in`), from the point
of view of the citizen using it.

This folder contains no code. It contains the decisions. Build from them.

---

## The competition you are building for

**Build What Moves India**, run by Varun Mayya in partnership with OpenAI.

| | |
|---|---|
| **Deadline** | **28 August 2026, 20:00 IST. No grace period.** Work to a 17:00 internal cutoff. |
| Field | 10,000+ entrants. Top 250 go through. A 2.5% cut. |
| Judging | 28 Aug – 1 Sep by Varun's team and the OpenAI India team, reading thousands of entries. Assume **two to three minutes per submission**. |
| Round 2 | The top 250 get a mentorship week and resubmit on 7 Sep. **Round 1 must be striking and working, not finished.** |

### What is submitted
1. A **live public browser link** that opens with no access request. Mock login credentials included.
2. One video, **2 minutes maximum**. Minute 1 is the citizen using it. Minute 2 is how it was built and why those choices.
3. A project summary of **under 250 words**.
4. The partner's registered email (blank — this is a solo entry).

### The six judging criteria
| Criterion | The question |
|---|---|
| Problem | Is this a real and important user problem? |
| Working build | Does the main journey actually work? |
| Usability | Is the experience simpler, clearer and **more accessible**? |
| Product thinking | Are the choices thoughtful and well explained? |
| End-to-end thinking | Does it address the backend, infrastructure and processes, not just the interface? |
| Honesty | Are limitations, mock data and dependencies clearly disclosed? |

### Rules that bind this build
- **Codex must be meaningfully involved, and the submission must explain how.** You are writing every
  line of application code.
- **No old projects.** Every line here is new. Do not import from any other repository.
- **Mock and synthetic data only.** No real Aadhaar, ABHA, UHID, OTP, payment or health data.
- **No live government systems.** Do not call, scrape or integrate with ORS or any government API.
  The research in `RESEARCH.md` came from published pages and citizen guides only.
- **No official logos or emblems** anywhere. No Ashoka lion, no NIC mark, no ABHA mark, no `.gov`
  styling. Every screen carries a visible line: *independent prototype, mock data, not affiliated
  with any government body.*
- **Every feature shown must actually work.** If it is not built, it does not appear in the demo.
- **Reviewers test the citizen experience.** There is no admin panel and none is judged.

### The organiser's own guidance, quoted
> *"Focus on ideas over code… put your energy into the interfaces, interactions, try to build
> something easier, something new."*

> *"Really think from the end consumers who are busy, they're frustrated with these platforms, they
> don't have too much time, and they want a solution quickly."*

> *"You could make a platform that has all the bells and whistles, has crazy 3D content going on, but
> that might not actually be very valuable for the end consumers."*

> *"If it doesn't open on a browser, it doesn't exist."*

**Interpretation for you:** spend your effort on the screens and the interactions. Keep the logic
layer small, correct and honest. Do not build a framework. Do not build 3D.

---

## The one sentence this product exists for

> **ORS asks which department you need. That is the one thing a sick person does not know.**

The government's own FAQ lists the flow as: *1. Verify yourself using Aadhaar Number. **2. Choose
Hospital / Department.** 3. Select date of appointment. 4. Get confirmation sms.*

Choosing the department is step 2 of 4. Before a date. Before anything. A person with chest pain does
not know whether that is Cardiology, General Medicine or Emergency. The portal assumes clinical
triage knowledge as its entry condition.

**Raahat asks where it hurts, and does the rest.**

---

## Read the other files in this order

1. `AGENTS.md` — the boundary this build may not cross. Read before writing anything.
2. `RESEARCH.md` — what is actually wrong with ORS, with sources. This is the *why*.
3. `SPEC.md` — the screens and what each one does.
4. `DESIGN.md` — how it looks and how it stays accessible.
5. `DATA.md` — every piece of data to create, and how it must be labelled.
6. `BUILD-ORDER.md` — the order to build in, and what "done" means for each slice.
