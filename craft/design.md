# Design craft

Evidence: winning 3D/visual/interactive hackathon projects scraped 23 Aug 2026, plus the
IncludAI accessibility winners.

## 1. The signature moment
Every memorable visual build has ONE moment people replay. Design it deliberately, first, and
build the rest around it.

> *Last Stand:* "We wanted real physics, real impact, and **a signature moment people would
> replay**." The moment: "the signature clean cleave: real arbitrary-angle bisection with both
> halves tumbling under physics" — implemented with per-frame clipping planes.

> *Tunnel:* "**Zero to Insight in 30 Seconds** — from idea to 200+ persona reactions in under half
> a minute."

Ask at spec time: what is the six seconds a judge will screenshot? If the answer is "the whole
thing is nice", there is no signature moment yet.

## 2. Concept framing: "What if…"
> *Skytinker:* "**What if players could design their own aircraft before playing Flappy Bird?**"

A concept sentence that references a thing the judge already knows, then twists it. Cheaper to
understand than any original metaphor.

## 3. Performance IS design (especially 3D/visual)
Named techniques from winners — cite the specific one in the spec, never "we optimised":
- Custom **WebGL shaders** for smooth **60fps** rendering (Tunnel's globe)
- **Canvas batching + requestAnimationFrame** discipline (NeuroBlocks)
- **Dual collision detection** + trimmed rendering pipeline (Skytinker)
- Lazy loading, image optimisation, memoisation, parallel API calls (Tunnel)
- Cel/toon shading + ink outlines + bloom as a *style* that is also cheap (Last Stand)

Budget rule: name the target (60fps / <2s first paint / works on a ₹8,000 phone) in DESIGN.md, and
name the technique that will hold it. A 3D build that stutters on the judge's laptop scores as
broken, not ambitious.

## 4. Resilience is visible design
> *Last Stand:* "resilient, ensuring **playability even when any one input channel — camera or
> band — fails**."

Every screen ships: empty · loading · error · **degraded** (model/sensor/network off, clearly
labelled, still usable) · and one visible imperfection (playbook rule 8).

## 5. Stacks that won, for 3D/interactive web
- **React Three Fiber + Cannon.js + Zustand + Vite + Vercel** (Skytinker) — the safe, fast path
- **Three.js + custom GLSL shaders + Next.js** (Tunnel) — when the visual IS the product
- Raw **WebGL/GLSL + vanilla** (Last Stand) — max control, max time cost
Pick by how much of the score is Visual Design. Rule 25: the substrate caps the design ceiling —
do not bring default-Streamlit energy to a design-judged event.

## 6. Accessibility is a design decision, made early
> *Prior hackathon winner:* a real user said *"I can't tell if that face is angry or disgusted.
> This is making me more anxious"* — so **every emoji was ripped out of the entire app** and
> replaced with geometric line icons.

Ambiguity is a design bug. Floor for every build: contrast, focus order, reduced-motion toggle,
font scaling, large tap targets, and no meaning carried by colour alone. We also refuse to
look like "special education software" — *"accessibility and beauty are not opposites."*

## 7. The 10-second gallery read
Judges meet the project as a thumbnail plus one line. The first screen must state what this is,
visibly, without scrolling. Design the thumbnail frame deliberately — it is a design deliverable,
not a screenshot taken later.

## 8. Anti-patterns that cost marks
- A 3D scene with no signature moment — pretty, forgettable, mid-table.
- Loading with no progress and no fallback: judges close the tab.
- Motion without a reduced-motion escape (vestibular discomfort is a real failure, not a nitpick).
- Lorem ipsum or placeholder art anywhere reachable.
- Desktop-only when the rubric mentions mobile or "real users".
- Design that needs a second person, a login, or an explanation to make sense (rule 3, N=1).
