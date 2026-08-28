# Plan 001: Repair CI and establish a green verification baseline

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**:
> `git diff --stat dca801b..HEAD -- .github/workflows/ci.yml src/App.test.js src/setupTests.js package.json CONTRIBUTING.md README.md`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: dx
- **Planned at**: commit `dca801b`, 2026-08-28

## Why this matters

Every push and PR to this repo triggers a CI workflow that **fails in 0 seconds**
because the workflow file is invalid — the `test` job declares `needs:
[lint, typecheck, format]` but there is no `typecheck` job. GitHub Actions
rejects the whole workflow, so lint, format check, security audit, and tests
have **never run**. On top of that, the `test` job invokes `vitest` (not a
dependency) while the project's actual test runner is Create React App's Jest,
and the single test file asserts text ("learn react") that does not exist in the
app — so `bun run test` fails too. After this plan, CI runs and passes on all
four jobs, and there is one real test guarding the app shell. This is the
prerequisite for every later plan.

## Current state

Files:

- `.github/workflows/ci.yml` — 4 jobs: `lint` (line 16), `format` (line 34),
  `audit` (line 51), `test` (line 63). Uses `oven-sh/setup-bun@v2`, bun cache,
  `bun install --frozen-lockfile`.
- `src/App.test.js` — the only test.
- `src/setupTests.js` — Jest DOM matchers setup.
- `package.json` — scripts + deps. Package manager is **bun** (`bun.lock` is the
  only lockfile).
- `CONTRIBUTING.md`, `README.md` — say "React 18"; project is on React 19.

Excerpts as they exist today:

`.github/workflows/ci.yml` lines 63-80:

```yaml
test:
  name: Test
  runs-on: ubuntu-latest
  needs: [lint, typecheck, format]
  steps:
    - uses: actions/checkout@v7
    - uses: oven-sh/setup-bun@v2
      with:
        bun-version: "1.4.0"
    - name: Cache Bun dependencies
      uses: actions/cache@v6
      with:
        path: ~/.bun/install/cache
        key: ${{ runner.os }}-bun-${{ hashFiles('bun.lock') }}
        restore-keys: |
          ${{ runner.os }}-bun-
    - run: bun install --frozen-lockfile
    - run: bunx vitest run --passWithNoTests
```

`src/App.test.js` (entire file):

```js
import { render, screen } from "@testing-library/react"

import App from "./App"

test("renders learn react link", () => {
  render(<App />)
  const linkElement = screen.getByText(/learn react/i)
  expect(linkElement).toBeInTheDocument()
})
```

`src/setupTests.js` (entire file):

```js
// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom"
```

`package.json` scripts block:

```json
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject",
    "lint": "oxlint",
    "lint:fix": "oxlint --fix",
    "format": "prettier --check .",
    "format:fix": "prettier --write .",
    "check": "prettier --write . && oxlint --fix",
    "prepare": "husky",
    "knip": "knip"
  },
```

`src/App.js` renders (no "learn react" text anywhere):

```js
export default function App() {
  return (
    <div>
      <AnnouncementBar />
      <Navbar />
      <Hero />
      <Services />
      <Insurance />
      <Features />
      <Team />
      <Testimonials />
      <FAQs />
      <Contact />
      <Footer />
    </div>
  )
}
```

`src/components/AnnouncementBar.js` (entire file — this is the component we will
test; note it has **no** third-party imports):

```js
import React from "react"

const AnnouncementBar = () => {
  return (
    <div className="fixed top-0 left-0 w-full z-50 bg-blue-600 text-white text-sm text-center py-2 px-4">
      DentRW v4 is here with new features and improvements.{" "}
      <a
        href="https://dentrw.hbapte.com"
        target="_blank"
        rel="noopener noreferrer"
        className="underline font-semibold hover:text-blue-200 transition-colors">
        Explore now &rarr;
      </a>
    </div>
  )
}

export default AnnouncementBar
```

Repo conventions:

- Prettier: no semicolons, double quotes, 2-space indent, `trailingComma: es5`,
  `endOfLine: lf` (see `.prettierrc`). Run `bun run format:fix` on files you edit.
- Commits: Conventional Commits, enforced by commitlint. Types allowed include
  `ci`, `test`, `chore`, `docs`, `fix`. Example from `git log`:
  `chore(deps): update actions/cache action to v6`.
- CRA's `react-scripts test` uses Jest and defaults to **watch mode**; it runs
  once and exits when the `CI` environment variable is set to a truthy value.

## Commands you will need

| Purpose          | Command                 | Expected on success                                   |
| ---------------- | ----------------------- | ----------------------------------------------------- |
| Install          | `bun install`           | exit 0                                                |
| Tests (one-shot) | `CI=true bun run test`  | Jest runs, all tests pass, process exits 0            |
| Lint             | `bun run lint`          | exit 0 (oxlint may print warnings; must not error)    |
| Format check     | `bun run format`        | exit 0 ("All matched files use Prettier code style!") |
| Format fix       | `bun run format:fix`    | exit 0                                                |
| Build (smoke)    | `CI=true bun run build` | exit 0, `build/` directory produced                   |

## Scope

**In scope** (the only files you may modify):

- `.github/workflows/ci.yml`
- `src/App.test.js`
- `src/setupTests.js`
- `package.json` (add ONE script only — see Step 4)
- `CONTRIBUTING.md` (version string + dev-command accuracy only)
- `README.md` (version strings only)

**Out of scope** (do NOT touch, even though they look related):

- Adding a `typecheck` job or any TypeScript config — there is no TS in this
  repo yet; that work belongs to plan 003.
- Adding `vitest` or migrating the test runner — plan 003.
- Any file under `src/components/` **except** creating `src/components/AnnouncementBar.test.js`.
- Any other CI job's build logic beyond the two edits in Step 1.
- Dependency version changes.

## Git workflow

- Branch: `advisor/001-repair-ci-baseline`
- Conventional Commits; commit per logical step is fine. Example messages:
  - `ci: make workflow valid and run the real test runner`
  - `test: replace placeholder App test with real smoke tests`
  - `docs: correct React version and dev command`
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Make the CI workflow valid and point the test job at the real runner

In `.github/workflows/ci.yml`:

1a. Line 66 — change:

```yaml
needs: [lint, typecheck, format]
```

to:

```yaml
needs: [lint, format]
```

1b. Line 80 — change:

```yaml
- run: bunx vitest run --passWithNoTests
```

to:

```yaml
- run: CI=true bun run test
```

Leave `lint`, `format`, and `audit` jobs unchanged.

**Verify**:

- `bunx yaml-lint .github/workflows/ci.yml` if available, otherwise
  `node -e "require('js-yaml')" 2>/dev/null || true` then
  `python -c "import yaml,sys; yaml.safe_load(open('.github/workflows/ci.yml'))"` → exits 0 (valid YAML).
- `grep -n "typecheck" .github/workflows/ci.yml` → **no output** (the phantom
  reference is gone).
- `grep -n "vitest" .github/workflows/ci.yml` → **no output**.

### Step 2: Add browser-API polyfills to the test setup

`src/components/Testimonials.js` uses `swiper` and several components use
`react-awesome-reveal`; both touch browser APIs that jsdom does not implement
(`IntersectionObserver`, `ResizeObserver`, `matchMedia`). Rendering `<App/>` in a
test will throw without polyfills.

Replace the entire contents of `src/setupTests.js` with:

```js
// jest-dom adds custom matchers for asserting on DOM nodes.
// https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom"

// --- jsdom polyfills for browser APIs used by third-party UI libs ---
// (swiper, react-awesome-reveal)

if (!window.matchMedia) {
  window.matchMedia = (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })
}

class MockObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return []
  }
}

if (!window.IntersectionObserver) {
  window.IntersectionObserver = MockObserver
}
if (!window.ResizeObserver) {
  window.ResizeObserver = MockObserver
}
```

**Verify**: `CI=true bun run test` runs (it may still fail on the assertion in
`App.test.js` at this point — that's fixed in Step 3 — but it must **not** error
with `IntersectionObserver is not defined` / `matchMedia is not a function`).

### Step 3: Write real tests

3a. Replace the entire contents of `src/App.test.js` with:

```js
import { render, screen } from "@testing-library/react"

import App from "./App"

test("renders the app shell without crashing", () => {
  render(<App />)
  // AnnouncementBar is always rendered at the top of the tree.
  expect(screen.getByText(/DentRW v4 is here/i)).toBeInTheDocument()
})
```

3b. Create `src/components/AnnouncementBar.test.js`:

```js
import { render, screen } from "@testing-library/react"

import AnnouncementBar from "./AnnouncementBar"

test("shows the v4 announcement", () => {
  render(<AnnouncementBar />)
  expect(screen.getByText(/new features and improvements/i)).toBeInTheDocument()
})

test("links to the v4 site in a new tab", () => {
  render(<AnnouncementBar />)
  const link = screen.getByRole("link", { name: /explore now/i })
  expect(link).toHaveAttribute("href", "https://dentrw.hbapte.com")
  expect(link).toHaveAttribute("target", "_blank")
  expect(link).toHaveAttribute("rel", expect.stringContaining("noopener"))
})
```

**Verify**: `CI=true bun run test` → all tests pass (3 tests across 2 files),
process exits 0.

If `src/App.test.js` fails because `render(<App/>)` throws from inside
`node_modules` (a third-party component crashing in jsdom even with the Step 2
polyfills): delete `src/App.test.js` entirely, keep only
`AnnouncementBar.test.js`, and note this in your status update. Do **not** start
mocking components — that's a rabbit hole for a later coverage plan.

### Step 4: Add a `dev` script alias

`CONTRIBUTING.md` tells contributors to run `bun run dev`, but no such script
exists. In `package.json` `scripts`, add one line after `"start"`:

```json
    "dev": "react-scripts start",
```

(Plan 003 will repoint this at Vite. For now it just makes the documented
command work.)

**Verify**: `grep -n '"dev"' package.json` → shows the new line.
`bun run format:fix package.json` then `bun run format` → exit 0.

### Step 5: Correct the version strings in docs

- `CONTRIBUTING.md`: under `## Stack`, change `React 18` → `React 19`.
- `README.md`: change the "Built with React" badge that reads `React-18` to
  `React-19` (search for `React-18`), and in the Tech Stack table change the
  `[React 18]` row label to `[React 19]`. Do **not** rewrite anything else in
  the README.

**Verify**: `grep -rn "React 18\|React-18" README.md CONTRIBUTING.md` → no matches.

### Step 6: Full local verification

Run, in order:

```
bun install
bun run format
bun run lint
CI=true bun run test
CI=true bun run build
```

**Verify**: every command exits 0. If `bun run format` fails, run
`bun run format:fix` on the files you changed and re-check. If `bun run build`
fails, that is a pre-existing problem unrelated to your changes — STOP and
report (do not try to fix the build here).

## Test plan

- New tests:
  - `src/App.test.js` — one smoke test: `<App/>` renders and the announcement
    text is present.
  - `src/components/AnnouncementBar.test.js` — two unit tests: announcement copy
    is shown; the CTA link has the correct `href`/`target`/`rel`.
- Structural pattern: there is no prior good example in this repo — the shape
  above (import `render`/`screen` from `@testing-library/react`, top-level
  `test(...)`, `getByText`/`getByRole` + jest-dom matchers) is the pattern
  future tests should follow.
- Verification: `CI=true bun run test` → all pass; test count goes from 1
  (failing) to 3 (passing).

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `python -c "import yaml; yaml.safe_load(open('.github/workflows/ci.yml'))"` exits 0
- [ ] `grep -n "typecheck" .github/workflows/ci.yml` returns nothing
- [ ] `grep -n "vitest" .github/workflows/ci.yml` returns nothing
- [ ] `CI=true bun run test` exits 0 with all tests passing
- [ ] `bun run lint` exits 0
- [ ] `bun run format` exits 0
- [ ] `grep -rn "React 18\|React-18" README.md CONTRIBUTING.md` returns nothing
- [ ] `grep -n '"dev"' package.json` shows the new alias
- [ ] `git status` shows only in-scope files modified, plus the new
      `src/components/AnnouncementBar.test.js`
- [ ] `plans/README.md` status row for 001 updated to DONE

## STOP conditions

Stop and report back (do not improvise) if:

- The `.github/workflows/ci.yml` content does not match the "Current state"
  excerpt (workflow was changed since this plan was written).
- `CI=true bun run test` still fails after Step 3 for a reason other than the
  `App.test.js` third-party-crash case explicitly handled in Step 3.
- `CI=true bun run build` fails (pre-existing; not this plan's job to fix).
- `bun install` changes more than `bun.lock` / lockfile metadata (it should make
  no dependency changes at all here).
- Fixing formatting or lint appears to require editing a component source file.

## Maintenance notes

- Plan 003 replaces `react-scripts` with Vite + Vitest. When it does: the `dev`
  script, the `test` job command (`CI=true bun run test`), and
  `src/setupTests.js` all change again. The polyfills added in Step 2 must be
  carried over to the Vitest setup file.
- The `App.test.js` smoke test depends on `AnnouncementBar` rendering the string
  "DentRW v4 is here...". If that copy changes (e.g. plan 005 moves it into i18n
  resources), update the test's matcher to the new source of truth.
- Reviewer should confirm the CI run on the PR actually goes green on all four
  jobs (lint / format / audit / test) — this is the first time it will have.
