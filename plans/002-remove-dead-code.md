# Plan 002: Remove dead code — unused deps and orphan files

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**:
> `git diff --stat dca801b..HEAD -- package.json src/index.js src/reportWebVitals.js src/components`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: plans/001-repair-ci-baseline.md
- **Category**: tech-debt
- **Planned at**: commit `dca801b`, 2026-08-28

## Why this matters

The manifest carries four runtime dependencies that nothing imports
(`react-hook-form`, `react-router-dom`, `@emotion/react`, `web-vitals`), and the
repo has four orphan component files plus a `reportWebVitals.js` that is both
unused and broken against the installed `web-vitals` v6 API. Every one of these
unused deps is surface area for Renovate PRs, `bun audit` noise, and reviewer
confusion (there have already been multiple Renovate PRs bumping
`react-router-dom` and `web-vitals` — churn on code that does nothing). Removing
them shrinks the dependency tree, kills the churn, and makes the Vite migration
(plan 003) smaller.

## Current state

### Unused dependencies (verified — zero import sites)

`grep -rn 'from "react-hook-form"\|from "react-router-dom"\|from "@emotion/react"\|from "web-vitals"' src/`
returns **nothing**. Cross-checked: the complete set of bare (non-relative)
imports in `src/` is:

```
@emailjs/browser, @testing-library/react, axios, react, react-awesome-reveal,
react-dom/client, react-scroll, swiper, swiper/react
```

- `react-hook-form` — never imported. `Contact.js` uses a plain `useRef` form;
  `Footer.js` uses `useState`.
- `react-router-dom` — never imported. `src/App.js` renders a flat page, no
  routing.
- `@emotion/react` — never imported. (Was likely a transitive assumption; not
  needed — the project uses Tailwind, not Emotion.)
- `web-vitals` — imported only by `src/reportWebVitals.js` (see below).

`package.json` dependency lines (do not copy versions elsewhere — just delete
these keys):

```json
    "@emotion/react": "^11.11.1",
    "react-hook-form": "^7.44.3",
    "react-router-dom": "^7.0.0",
    "web-vitals": "^6.0.0",
```

### `src/reportWebVitals.js` — unused and broken

Entire file:

```js
const reportWebVitals = (onPerfEntry) => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    import("web-vitals").then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(onPerfEntry)
      getFID(onPerfEntry)
      getFCP(onPerfEntry)
      getLCP(onPerfEntry)
      getTTFB(onPerfEntry)
    })
  }
}

export default reportWebVitals
```

`web-vitals` v6 removed `getCLS/getFID/getFCP/getLCP/getTTFB` (renamed to
`onCLS/onFCP/onLCP/onTTFB`; `getFID` deleted entirely, replaced by `onINP`), so
this code would throw if it ever ran. It never runs: `src/index.js` calls
`reportWebVitals()` with **no argument**, so the `if (onPerfEntry ...)` guard is
always false.

`src/index.js` (entire file):

```js
import React from "react"
import ReactDOM from "react-dom/client"

import "./index.css"

import App from "./App"
import reportWebVitals from "./reportWebVitals"

const root = ReactDOM.createRoot(document.getElementById("root"))
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
```

### Orphan component files (verified — imported nowhere)

`grep -rn "components/404\|components/Sign\|components/Subscribe\|components/Terms" src/`
returns **nothing**.

- `src/components/404.js` — 7 lines, stub.
- `src/components/Terms.js` — 7 lines, stub.
- `src/components/Subscribe.js` — 89 lines, **mostly commented-out code**; a dead
  duplicate of the newsletter form that already lives (working) in
  `src/components/Footer.js`.
- `src/components/Sign.js` — 159 lines, a real login-form UI. **KEEP THIS ONE.**
  The README roadmap lists "User accounts — Patient login"; this file is the
  starting point for that work. It's out of scope for deletion.

### Conventions

- Prettier: no semicolons, double quotes, 2-space indent (`.prettierrc`).
- Commits: Conventional Commits (commitlint). Example: `chore: add knip for dead code review`.
- `knip` is configured (`knip.json`) and available via `bun run knip`.

## Commands you will need

| Purpose               | Command                 | Expected on success                                 |
| --------------------- | ----------------------- | --------------------------------------------------- |
| Install / update lock | `bun install`           | exit 0; only `bun.lock` changes                     |
| Dead-code check       | `bun run knip`          | exit 0 (or pre-existing findings only — see Step 4) |
| Tests                 | `CI=true bun run test`  | all pass, exit 0                                    |
| Lint                  | `bun run lint`          | exit 0                                              |
| Format check          | `bun run format`        | exit 0                                              |
| Build smoke           | `CI=true bun run build` | exit 0                                              |

## Scope

**In scope**:

- `package.json` (remove 4 dependency keys)
- `bun.lock` (regenerated by `bun install`)
- `src/index.js` (remove reportWebVitals import + call + trailing comment)
- delete `src/reportWebVitals.js`
- delete `src/components/404.js`
- delete `src/components/Terms.js`
- delete `src/components/Subscribe.js`

**Out of scope** (do NOT touch):

- `src/components/Sign.js` — keep; it's the seed for the roadmap's patient-portal
  feature.
- Adding a router or a 404 route — when routing is introduced later,
  `react-router-dom` gets re-added deliberately at a known-good version.
- Any other component.
- `web-vitals` re-implementation — if performance monitoring is wanted later,
  it should be added fresh against the current API, not resurrected from this
  file.

## Git workflow

- Branch: `advisor/002-remove-dead-code`
- Conventional Commits. Example messages:
  - `chore: drop unused dependencies (react-hook-form, react-router-dom, @emotion/react, web-vitals)`
  - `chore: remove unused reportWebVitals and orphan component stubs`
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Remove the unused dependencies

Delete these four lines from the `"dependencies"` object in `package.json`:

```json
    "@emotion/react": "^11.11.1",
    "react-hook-form": "^7.44.3",
    "react-router-dom": "^7.0.0",
    "web-vitals": "^6.0.0",
```

Then run `bun install` to update the lockfile.

**Verify**:

- `grep -n "react-hook-form\|react-router-dom\|@emotion/react\|\"web-vitals\"" package.json` → no matches.
- `git diff --stat` shows only `package.json` and `bun.lock` changed.

### Step 2: Delete `reportWebVitals` and clean up `src/index.js`

2a. Delete the file `src/reportWebVitals.js`.

2b. Edit `src/index.js` to remove three things: the import line, the call, and
the trailing comment block. The result should be exactly:

```js
import React from "react"
import ReactDOM from "react-dom/client"

import "./index.css"

import App from "./App"

const root = ReactDOM.createRoot(document.getElementById("root"))
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
```

**Verify**:

- `test ! -f src/reportWebVitals.js && echo gone` → prints `gone`.
- `grep -rn "reportWebVitals" src/` → no matches.

### Step 3: Delete the orphan component stubs

Delete:

- `src/components/404.js`
- `src/components/Terms.js`
- `src/components/Subscribe.js`

Leave `src/components/Sign.js` in place.

**Verify**:

- `ls src/components/ | grep -E "^(404|Terms|Subscribe)\.js$"` → no output.
- `test -f src/components/Sign.js && echo kept` → prints `kept`.
- `grep -rn "components/404\|components/Terms\|components/Subscribe" src/` → no matches.

### Step 4: Run knip and confirm no regression

Run `bun run knip`.

Expected: knip may still report pre-existing issues (for example it will now
flag `src/components/Sign.js` as an unused file — that is **expected and
accepted**; we are deliberately keeping it). What must NOT appear: any _new_
error caused by your edits, e.g. a broken import in `src/index.js`, or a
reference to a file you deleted.

**Verify**: `bun run knip` output contains no "Unresolved import" / "Unlisted
dependency" entries pointing at files or packages you touched. If it does, you
broke a reference — fix it or STOP.

### Step 5: Full verification

Run, in order:

```
bun install
bun run format
bun run lint
CI=true bun run test
CI=true bun run build
```

**Verify**: all exit 0. If `bun run format` fails on `src/index.js`, run
`bun run format:fix src/index.js` and re-check.

## Test plan

- No new tests. This plan only removes code.
- Regression guard: the existing tests from plan 001
  (`src/App.test.js`, `src/components/AnnouncementBar.test.js`) must still pass —
  they exercise the render path through `src/index.js`'s tree.
- `CI=true bun run build` must still succeed — proves nothing that Webpack
  bundles was actually depending on a removed package transitively in a way that
  breaks the build.

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `grep -n "react-hook-form\|react-router-dom\|@emotion/react\|\"web-vitals\"" package.json` returns nothing
- [ ] `test ! -f src/reportWebVitals.js` (file deleted)
- [ ] `grep -rn "reportWebVitals" src/` returns nothing
- [ ] `src/components/404.js`, `Terms.js`, `Subscribe.js` deleted; `Sign.js` still present
- [ ] `CI=true bun run test` exits 0, all pass
- [ ] `CI=true bun run build` exits 0
- [ ] `bun run lint` and `bun run format` exit 0
- [ ] `git status`: only in-scope files changed/deleted
- [ ] `plans/README.md` status row for 002 updated

## STOP conditions

Stop and report back (do not improvise) if:

- Any of the "Current state" grep results differ from what's stated (e.g. one of
  the "unused" deps is actually imported somewhere now → the codebase drifted).
- `CI=true bun run build` fails after the dependency removal (something depended
  on a removed package in a non-obvious way).
- `bun install` wants to change dependencies other than the four you removed.
- Deleting `Subscribe.js` surfaces an import of it you didn't find in Step 3's
  grep.

## Maintenance notes

- If routing is added later (patient portal, a real 404 page, `/terms`),
  re-add `react-router-dom` explicitly and pin a known-good version — don't
  assume the old `^7.0.0` range.
- `src/components/Sign.js` is intentionally retained as dead code. Whoever picks
  up the patient-accounts roadmap item should wire it to a route + auth, or
  delete it if the design changes. `knip` will keep flagging it until then —
  that's fine.
- Plan 003 (Vite) no longer needs to handle `reportWebVitals.js` or the
  `web-vitals` dep once this plan lands.
