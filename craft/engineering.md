# Engineering craft

Evidence: eleven dissected winning writeups + the AI model forensic teardown.

## 1. The one design decision with three named consequences
The strongest architecture paragraph in the corpus (ScriptCast, Social Media Automation winner):

> "The core design decision: **the worker runs exactly one stage, commits it, and re-enqueues
> itself.** That single rule buys **crash safety** (you lose at most one stage), **idempotency**
> (each stage hashes its inputs, so a retry replays stored output instead of paying a vendor
> twice), and **observability** (progress lives in Postgres, so the UI and the API can never
> disagree)."

Then he proved the abstraction by exercising it: *"Swapping a paid TTS vendor for a GPU in the next
room… one new file, one registry line, nothing else touched."* Write your architecture this way:
one rule → three consequences → one migration that proves it.

## 2. The deterministic core, and the test that enforces it
- Core imports **no model, no network, no framework**. Pure functions over data.
- An **import/AST test fails the build** if the core grows a forbidden dependency. This paragraph
  has impressed judges repeatedly; it is cheap and it is real.
- AUGUR's provable form: *"The NEWS2 score is **byte-identical** whether the LLM layer is on or
  off. We don't just claim the AI doesn't touch the math — we can demonstrate it."*
- SmartOptic: *"No language model chose that verdict. It was computed from the interval, the sample
  size and the deferral rate **by a function, not a sentence**."*

## 3. Rules as data, with citations
Domain logic lives in versioned data files carrying a citation to the source rule, not in `if`
branches. The engine evaluates; the data decides. This is what makes every verdict explainable and
lets a non-engineer audit the product.

## 4. Named regression tests (every bug, no exceptions)
AUGUR's challenges section, which is why it won:
> *"A real scoring bug. Our NEWS2 heart-rate band scored 91–100 as zero instead of one, silently
> under-triaging early tachycardia, one of the first signs of deterioration. **It's now a named
> regression test.**"*

Name the test after the bug: `test_hr_91_100_scores_one_not_zero`. The list of these names is a
submission asset. State the count (rule 14).

## 5. Failure modes to check FIRST when debugging
Ordered by how often they have actually bitten this vault:
1. **The file you edited is not the file being served.** (Pitstop: the React app in `web/` was
   edited and deployed while the live page was `pitstop/web_public/index.html`.)
2. **A graceful fallback hiding a total failure.** AUGUR: *"we deployed with a dead model, the app
   looked completely fine. Every request was failing and nothing on screen indicated it… Fault
   tolerance and observability are not the same thing."* → fallbacks must log loudly.
3. **Code below an early return.** (Nirog: the complaint write sat under an `isConfigured()` early
   return, so nothing a patient said was ever stored; seeded data masked it.)
4. **Synchronous mutation double-counting.** (Nirog: `appendTurn` mutated module state, so
   `[...c.history, newTurn]` sent the last sentence twice.)
5. **Retired model IDs.** `legacy-models` 404s for new users; every tutorial still shows it.
   AUGUR hit the same wall. Check the provider's current docs before wiring.
6. **Account-tier blocks that report the wrong cause.** AWS Free Plan blocks Bedrock in every
   region and the error points nowhere near the tier.
7. **Case-sensitivity** that only breaks on Linux CI/Vercel (Kairo lost time to exactly this).
8. **Train/serve skew.** ScanProof: validation stuck at *exactly* the majority-class rate (74.6%)
   because augmentation ran after normalisation and clipped tensors. Reordering two lines took it
   to 98.5%. If a metric equals the base rate, you are predicting one class.
9. **Clock.** Run `date`. Two estimates here were wrong by three days and by seventy minutes.

## 6. Integration doctrine
- Every model call: hard timeout, schema validation, deterministic fallback, loud log on fallback.
- One flag (or absent key) disables the whole model layer; verdicts unchanged; UI shows a degraded
  label. the build will attack this — make it true.
- Secrets only in `.env.local`, gitignored, never printed. Shivang pastes them himself.
- Sponsor SDK bugs → minimal repro + failing test → filed upstream → one writeup line (rule 15).
  A first-run sponsor event usually has feedback prizes waiting.
- Bulk mechanical generation (fixtures, translations) routes through cheap providers via scripts,
  not frontier-model calls.

## 7. Things a hostile reader will find (AI Model teardown)
A community audited a Grand Prize winner's public repo and found: a predecessor repo whose README
named a different competition, an `api_version="2024-02-15-preview"` string proving code predated
the window, a model version visible in the demo UI contradicting the submission, contributors not
listed on the team, and **undisclosed AI-tool config directories**. Second place shipped a
15 ms `setTimeout` commented `// CINEMATIC SMOOTHING` sold as "real-time reasoning", an HMAC
defaulting to `"dev-secret-do-not-use-in-prod"` sold as "Chain of Custody", and ten hardcoded JSON
rows sold as "thousands of signals".

Rules that follow: never ship a delay loop as thinking. Never ship a default secret. Never describe
fixture counts as live volume. **Disclose AI tools by name — the defence is disclosure, not
deletion.** Assume the repo will be cloned, forked and archived before you can change it.

## Provider facts learned the hard way (24 Aug 2026)
- **AI Provider free tier: 20 requests/day** per model per project (`GenerateRequestsPerDayPerProject
  PerModel-FreeTier`), resetting at midnight Pacific ≈ 12:30 IST. A night's development exhausts it
  well before a morning deadline. Classify 429 as retryable; classify a *daily*-quota 429 as
  fail-fast for the rest of the process rather than retrying futilely.
- **Featherless charges 4 concurrency units per request** on a large model (`DeepSeek-V3-0324`)
  against a plan limit of 4 — so the account supports exactly **one in-flight request**, not four.
  Serialize hard: no thread pool, no `asyncio.gather`. 97 sequential calls take ~4.5 minutes.
  *The vault's own resources note said "4 concurrent requests", which reads as four simultaneous
  calls and is wrong for large models.*
- `api.featherless.ai` returns Cloudflare **error 1010** unless a real `User-Agent` header is sent.
  Undocumented; worth filing upstream (rule 15).
- Adding a second provider is the migration that proves the abstraction. One new module plus one
  registry line, `core/` untouched, and the purity test still green — that is the paragraph judges
  remember, and it only works if you actually do it rather than claiming you could.
