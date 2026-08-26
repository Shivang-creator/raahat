# Deploy craft

## The checklist (every deploy, no exceptions)
1. `date` first — deadline maths uses the real clock.
2. Deploy the **walking skeleton on day one**. A live URL before features exists.
3. **Deployment protection**: check via the Vercel MCP (`get_project_deployment_protection`).
   Vercel's default hides deployment-specific URLs behind SSO.
4. **Verify from outside, signed out:**
   `curl -s -o /dev/null -w "%{http_code}" --no-location <alias>` → must be **200**.
   Then a real headless load and a visible-heading check. **Never grep the bundle for
   `login|sso|auth`** — that false-positived on font filenames and `crossorigin`.
5. **Env parity**: every var the app reads exists in **production** (not only preview). Report
   names, never values.
6. **Submit the alias, never a deployment-specific URL.**
7. Links must stay up through the entire judging window. Teardown only after results.

## Known traps
- The file you edited may not be the file being served (Pitstop: React app in `web/` vs the served
  `web_public/index.html`). Verify the deployed bundle contains your change.
- Case-sensitive Linux builds break on filename casing that works locally on macOS.
- A hosted demo may be torn down after judging for cost — some events explicitly allow the app not
  to be live at judging if the video and repo prove it was deployed (All Things Agentic says this).
  Read the rules before paying for uptime.
- Render is the home for anything Python or long-running that serverless makes awkward; $50 credit
  is banked there.

---

# Added 24 Aug 2026 — three traps hit in one night

## A 200 on an alias proves nothing about whose site it is
`three-d-demo.vercel.app` returned **200** and belonged to **a stranger** — a Cesium app titled
"threed-demo". Our real URLs were both 302s behind Vercel's default deployment protection. A
deployer checking only status codes would have handed judges a link to someone else's project.

**The check is status code AND proof of ownership:**
```bash
curl -s -o /dev/null -w "%{http_code}" --no-location "$URL"          # must be 200
curl -s "$URL" | grep -oE '<title>[^<]*'                             # must be YOUR title
```
Vercel's `ssoProtection` defaults to `all_except_custom_domains`. Check it via the MCP
(`get_project_deployment_protection`) and disable it deliberately; verify from outside afterwards.

## gitignore BEFORE the first `git add`, and verify the published tree
`.gitignore` was written after `git add -A`, so `.crew/` was already tracked — gitignore does not
untrack. **19 internal strategy files, including the rubric analysis, were pushed to a public repo.**
Caught within minutes, but force-pushing orphans commits rather than erasing them.

```bash
gh api "repos/OWNER/REPO/git/trees/BRANCH?recursive=1" \
  --jq '[.tree[].path|select(startswith(".crew") or test("DS_Store|\\.env"))]|length'   # must be 0
```
Run that after every repo creation. Trusting the ignore file is not verification.

## A static host serves your working directory unless told otherwise
`.crew/PLAN.md` was live at **200** on the deployed site for about twenty minutes, containing the
rubric strategy and contradicting the shipped build. Vercel serves everything not excluded.
**Write `.vercelignore` before the first deploy**, not after, and curl the internal paths to confirm
404 rather than assuming.

## Deliverables and tests must not share a path
See verification-craft §1. A test writing mocks to `deliverables/` means whichever of `test` or the
real command ran last decides what ships. Belt-and-braces even after the root-cause fix: **run the
artifact-generating command last, after the final test run**, and hash the artifact before commit.
