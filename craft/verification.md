# Verification craft

## The judge you are simulating
Opens a link on their own machine, signed out, with ~90 seconds and hundreds of other submissions.
Will not clone, will not read the repo, will not create a second account, will not ask you a
question. If it needs explaining, it does not exist.

## Deploy checks that have actually caught failures
- **Alias vs deployment URL.** `nirog-memory.vercel.app` returned 200 while deployment-specific
  URLs 302'd to `vercel.com/sso-api` — Vercel deployment protection is on by default and hides a
  working site from judges. Always submit the alias; always check both.
- **Grep is not a login-wall test.** A grep for `sso|login|authenticate` matched font filenames and
  `crossorigin` in a Next bundle and produced a false positive. Use HTTP status with no-follow,
  plus a real headless load and a visible-heading check.
- **Env parity**: production, not just preview. A var present in preview and missing in production
  is invisible until a judge hits it.
- **Links must survive the whole judging window.** A teardown before judging ends is a zero.

## Attacking your own guarantees (rule 10, 35)
1. **Kill the model**: blank the key, rerun the journey, `diff` the outputs mechanically. Verdicts
   must be byte-identical; the UI must show its degraded label, not an error.
2. **Replay the seed**: same seed twice → identical output, from a fresh clone if reproducibility
   is claimed.
3. **Make it lie**: contradictory inputs, out-of-distribution garbage, inputs engineered to
   produce a confident wrong answer. The passing behaviour is an honest refusal —
   Remembrance: *"I don't have a record of that worth asking."* Its own lesson:
   **"Refusal is a feature you have to engineer, not a prompt you can write."**
4. **Build the control arm against your own best objection.** ScanProof: *"maybe I just built a
   resampling detector. **Nobody was going to catch that but me. I built a control arm anyway.**"*
   The result: *"It's the patients, not the pixels."*
5. **Diff the writeup against the code**, claim by claim. Every number must be reproducible by a
   command you actually ran. *"Anything a judge can disprove by reading the code costs more than
   it earns."*

## Pre-registration (rule 35)
Write the success margin down BEFORE running the experiment so it cannot move afterwards. ScanProof
did, the hypothesis failed, and he published it: *"Two results in that table are bad for me… The
baseline beat me… So the margins stayed, and the failure is printed on the audit page in the app
under a heading that says 'Reported as found.' Not in a footnote. **On the page a judge will
open.**"* That entry won.

## Severity language for findings
- **BLOCKER** — a judge cannot complete the journey, or the claim is false. Fix or disclose.
- **HURTS** — a judge completes it but scores lower (confusion, slow, ugly at a key moment).
- **POLISH** — noticed only on a second pass. Fix only after freeze if time allows.
Always give the finding in the words the confused judge would think, not in engineering terms.

## What survives becomes the demo
The three guarantees that survive attack are the video's beats. The one weakness that does not
survive gets disclosed on purpose (rule 8: keep one visible failure) — perfection reads as staged.

---

# The three shapes that survived code review and died on execution
*Added 24 Aug 2026, from one overnight run that built three projects.*

Every serious defect that night passed inspection and failed the moment something ran it.

## 1. Fixture-shaped defects — the most dangerous class
A value that looks like evidence but was authored, not measured.
- A page's footer read `GENERATED — Written by gemini-3.6-flash` while `data/explanations.js`
  was publicly served with `// PLACEHOLDER. Not yet generated.` as its first line. **No model had
  ever been called in that build.**
- A kill-switch panel computed `buildLedgerHash(report, clean)` **twice with identical arguments**
  and labelled the results ON and OFF. All five of its tests were `assert.equal(f(x), f(x))` with
  `void decoy;`. The invariant was true; the experiment was theatre.
- `deliverables/runs/killswitch.{on,off}.json` were git-tracked and committed containing
  `{"claim_id": "fake-claim-1", "pack_version": "test"}` — because the **test wrote its mocks to
  the real deliverable paths**, so whichever of `test` or `killswitch` ran last decided what
  shipped. It reverted three times in seven minutes while agents worked.

**Rules:**
- **A test that writes to a shipped artifact path is a bug regardless of what it asserts.** Redirect
  to a temp directory, and add a regression test that hashes every file under `deliverables/`
  before and after the whole suite and asserts byte-identity.
- Grep the shipped tree for `fake`, `TBD`, `PLACEHOLDER`, `STUB`, `example`, `test` before ship.
- If a claim can be computed, compute it in the product. A count that a human typed is a count that
  can drift; a count the page measures on load cannot.

## 2. Numbers drifting between documents
Once a fact appears in more than one artifact, the artifacts disagree unless something forces them
together. Caught four times in one night:
- a poster and a per-node doc saying **67 tests** while the suite printed **81**
- a page saying a Russian **sentence** produces **six** findings while the tests and both writeups
  said a Russian **greeting** produces **eleven** (both true of different strings, which is exactly
  how an honest discrepancy looks to someone checking)
- a writeup claiming "one digest, three implementations" and quoting `0c046a5c…` when the live page
  printed `42a2f1…` — two real proofs of two different properties, presented as one number
- a README claiming a guard *"fails the build the moment either constraint breaks"* when a red team
  had already got past it five ways

**Rule:** before ship, list every number that appears in more than one artifact and re-derive each
from a command. Prefer a single generated source (`data/test-results.js` written by the test runner)
over the same figure typed in three places.

## 3. Claims about the world that nobody measured
An "8 ms" analysis time circulated through three briefs before a scribe measured it: the real figure
was **0.105 ms**. A screenshot showed 11 ms where the text said 13.

**Rule:** any number in a deliverable must trace to a command run tonight. "Approximately" is a
smell — it usually means nobody ran it.

## What actually caught these
Not review. Execution, by an agent whose only job was to attack:
- running the CLI in **both orders** and diffing the deliverable
- running the pipeline with **garbage API keys and an unroutable endpoint** — not just the off-flag
- **sabotaging the live deploy** (shifting one expected offset by +7) to prove a self-test strip
  genuinely ran rather than printing a cached number
- cloning the **public repo** and running the suite there, not locally
- checking `ps aux` **mid-run** to confirm which output path a process actually wrote to
