# Plan 003: Migrate from Create React App to Vite + Vitest

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> This is a large plan (effort L). Do it on its own branch. The codebase will be
> briefly non-runnable between Step 3 and Step 8 — that is expected; the gate is
> the full verification in Step 11, not intermediate runs.
>
> **Drift check (run first)**:
> `git diff --stat dca801b..HEAD -- package.json public/ src/ .github/workflows/ci.yml .env.example README.md`
> If in-scope files changed since this plan was written, compare against the
> "Current state" excerpts; on a mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: L
- **Risk**: MED
- **Depends on**: plans/001-repair-ci-baseline.md, plans/002-remove-dead-code.md
- **Category**: migration
- **Planned at**: commit `dca801b`, 2026-08-28

## Why this matters

The app runs on Create React App (`react-scripts` 5.0.1), which the React team
**officially deprecated in February 2025** — no more releases, no React 19
guidance, a slow Webpack dev server, and a large unmaintained transitive
dependency tree that dominates `bun audit` output. Meanwhile this repo's CI,
`CONTRIBUTING.md`, `.prettierignore` (`.vite`, `.vitest`, `dist`), and
`.oxlintrc.json` (`next-env.d.ts`) were **already written for a Vite/Vitest
stack that was never built** — so the tooling and the app disagree. This plan
finishes that migration: Vite for dev/build, Vitest for tests. After it, `bun
run dev` starts in well under a second, the dependency tree shrinks
substantially, and the CI/docs finally match reality.

## Current state

### What is CRA-specific and must change

| Thing                                                        | Where                                                             | Becomes                                          |
| ------------------------------------------------------------ | ----------------------------------------------------------------- | ------------------------------------------------ |
| `react-scripts` dep + `start`/`build`/`test`/`eject` scripts | `package.json`                                                    | `vite` / `vitest`; scripts rewritten             |
| `eslintConfig` block (`react-app`, `react-app/jest`)         | `package.json`                                                    | deleted (CRA-only; repo lints with oxlint)       |
| HTML template with `%PUBLIC_URL%`, lives in `public/`        | `public/index.html`                                               | root `index.html` with `<script type="module">`  |
| JSX inside `.js` files                                       | `src/App.js`, `src/index.js`, `src/components/*.js`               | renamed to `.jsx`                                |
| `process.env.REACT_APP_*`                                    | `src/components/Contact.js` (×3), `src/components/Footer.js` (×2) | `import.meta.env.VITE_*`                         |
| `REACT_APP_*` keys                                           | `.env.example`                                                    | `VITE_*`                                         |
| Jest test setup                                              | `src/setupTests.js`                                               | Vitest setup (jest-dom/vitest import)            |
| No PostCSS config (CRA built-in)                             | —                                                                 | `postcss.config.js` (tailwind + autoprefixer)    |
| CI `test` job                                                | `.github/workflows/ci.yml`                                        | `bun run test` = `vitest run`; add a `build` job |

### Key file excerpts (today)

`package.json` scripts + eslintConfig:

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
  "eslintConfig": {
    "extends": ["react-app", "react-app/jest"]
  },
```

(Also present: `"dev": "react-scripts start"` added by plan 001.)

`src/components/Contact.js` — the EmailJS call (line numbers approximate):

```js
emailjs.sendForm(
  process.env.REACT_APP_EMAILJS_SERVICE_ID,
  process.env.REACT_APP_EMAILJS_TEMPLATE_ID,
  form.current,
  process.env.REACT_APP_EMAILJS_PUBLIC_KEY
)
```

`src/components/Footer.js` — the ConvertKit call:

```js
    const API_KEY = process.env.REACT_APP_CONVERTKIT_API_KEY
    const FORM_ID = process.env.REACT_APP_CONVERTKIT_FORM_ID
    ...
      const response = await axios.post(
        `https://api.convertkit.com/v3/forms/${FORM_ID}/subscribe`,
        { api_key: API_KEY, email }
      )
      console.log("Email sent successfully!", response.data)   // line ~41
    ...
      console.error("Error sending email:", error)             // line ~50
```

`.env.example` (entire file):

```
# ConvertKit — https://app.convertkit.com/account/edit (API Keys section)
REACT_APP_CONVERTKIT_API_KEY=xxxxxxxxxxxxxxxxxxxxxx

# Found under Forms > your form > Settings > Form ID
REACT_APP_CONVERTKIT_FORM_ID=0000000

# EmailJS — https://dashboard.emailjs.com
# Found under Email Services > your service
REACT_APP_EMAILJS_SERVICE_ID=service_xxxxxxx

# Found under Email Templates > your template
REACT_APP_EMAILJS_TEMPLATE_ID=template_xxxxxxx

# Found under Account > API Keys (public key)
REACT_APP_EMAILJS_PUBLIC_KEY=xxxxxxxxxxxxxxxxxxxxxx
```

`src/setupTests.js` (after plan 001 — includes polyfills):

```js
import "@testing-library/jest-dom"

// ... matchMedia / IntersectionObserver / ResizeObserver polyfills ...
```

`public/index.html` — CRA template: `<html lang="en">`, favicon links,
**two** `<meta name="theme-color">` (`#ffffff` then `#000000`), commented-out
manifest link, a Google Analytics `gtag.js` snippet in `<head>`, and a Typebot
ES-module `<script>` in `<body>`. Full file is ~70 lines with CRA boilerplate
comments.

`tailwind.config.js`:

```js
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {/* 50..900 blue scale */},
      },
    },
  },
  plugins: [],
}
```

`.gitignore` contains `/build` (keep — this plan keeps Vite's `outDir` as
`build`). `.prettierignore` already contains `dist`, `.vite`, `.vitest`.

`package.json` has no `"type": "module"` — so `*.config.js` files are CommonJS
(`tailwind.config.js` already uses `module.exports`). Keep it that way.

### Conventions

- Prettier: no semicolons, double quotes, 2-space indent, `trailingComma: es5`,
  `endOfLine: lf`. Run `bun run format:fix` on everything you create/edit.
- Commits: Conventional Commits. Type `build` exists for build-system changes.
- Package manager: **bun** everywhere (CI, husky). Use `bun add` / `bun remove`.

## Commands you will need

| Purpose           | Command                                                                              | Expected on success                                |
| ----------------- | ------------------------------------------------------------------------------------ | -------------------------------------------------- |
| Add dep           | `bun add -d vite @vitejs/plugin-react vitest jsdom autoprefixer @vitest/coverage-v8` | exit 0                                             |
| Remove dep        | `bun remove react-scripts`                                                           | exit 0                                             |
| Dev server        | `bun run dev`                                                                        | Vite starts, serves on `http://localhost:3000`     |
| Build             | `bun run build`                                                                      | exit 0, `build/` contains `index.html` + `assets/` |
| Preview built app | `bun run preview`                                                                    | serves `build/`                                    |
| Tests             | `bun run test`                                                                       | Vitest runs all specs, exits 0                     |
| Lint              | `bun run lint`                                                                       | exit 0                                             |
| Format check      | `bun run format`                                                                     | exit 0                                             |

## Suggested executor toolkit

- If a `vercel:*` or Vite skill is available in your environment, consult it for
  the current recommended `vite.config` shape — but the config below is known to
  work for a CRA-style app with JSX in `.js`-renamed files.
- Reference: Vite "Migration from CRA" community guides; `@vitejs/plugin-react`
  README; Vitest "Configuring Vitest" docs.

## Scope

**In scope**:

- `package.json` (scripts, deps, remove `eslintConfig`)
- `bun.lock`
- new: `vite.config.js`, `postcss.config.js`, root `index.html`
- delete: `public/index.html`
- rename (`git mv`): `src/App.js`→`.jsx`, `src/index.js`→`.jsx`, every
  `src/components/*.js` that contains JSX → `.jsx`, `src/App.test.js`→`.test.jsx`,
  `src/components/AnnouncementBar.test.js`→`.test.jsx`
- edit: `src/components/Contact.jsx`, `src/components/Footer.jsx` (env vars),
  `src/setupTests.js` (jest-dom import), `src/index.jsx` (nothing beyond rename
  unless build complains)
- `.env.example` (rename keys)
- `.github/workflows/ci.yml` (test job command + new build job)
- `README.md` (getting-started commands only)

**Out of scope** (do NOT touch):

- `src/components/*.jsx` internal logic beyond the env-var lines in Contact and
  Footer. Do NOT fix the `class=`/`for=` JSX attributes, do NOT refactor
  `Testimonials.jsx`. (Separate cleanup plans.)
- Tailwind version — stay on v3. Do NOT adopt `@tailwindcss/postcss` / v4.
- Swiper / react-awesome-reveal version bumps.
- Adding TypeScript / a `tsconfig.json` / a `typecheck` CI job.
- SEO meta tags, Open Graph, JSON-LD, PWA — that's plan 004 (it edits the
  `index.html` you create here).
- `src/setupTests.js` polyfills — keep them exactly as plan 001 left them; only
  change the jest-dom import line.
- Deploy configuration (Vercel dashboard) — see `plans/README.md` post-merge
  notes.

## Git workflow

- Branch: `advisor/003-migrate-cra-to-vite`
- Commit in logical chunks. Suggested messages:
  - `build: add vite, vitest, and config`
  - `build: rename JSX modules to .jsx`
  - `build: convert env vars to import.meta.env (VITE_ prefix)`
  - `build: replace CRA html template with vite index.html`
  - `build: drop react-scripts; wire vite/vitest into scripts and CI`
  - `docs: update getting-started commands for vite`
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Install Vite/Vitest, remove react-scripts

```
bun add -d vite @vitejs/plugin-react vitest jsdom autoprefixer @vitest/coverage-v8
bun remove react-scripts
```

**Verify**: `grep -n "react-scripts" package.json` → nothing.
`grep -n '"vite"\|"vitest"' package.json` → both present under devDependencies.

### Step 2: Create `vite.config.js`

New file `vite.config.js` at repo root:

```js
import react from "@vitejs/plugin-react"
import { defineConfig } from "vitest/config"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: "build",
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/setupTests.js",
    css: true,
  },
})
```

### Step 3: Create `postcss.config.js`

New file `postcss.config.js` at repo root (CommonJS, matching
`tailwind.config.js`):

```js
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

### Step 4: Rename JSX modules to `.jsx`

Every file under `src/` that contains JSX must end in `.jsx` (imports don't
reference extensions, so no import edits are needed — Vite resolves `.jsx`).

Run this from the repo root:

```sh
git mv src/App.js src/App.jsx
git mv src/index.js src/index.jsx
git mv src/App.test.js src/App.test.jsx
git mv src/components/AnnouncementBar.test.js src/components/AnnouncementBar.test.jsx
for f in src/components/*.js; do
  case "$f" in
    *.test.js) ;;  # already handled
    *) git mv "$f" "${f%.js}.jsx" ;;
  esac
done
```

Then confirm the only `.js` files left in `src/` are non-JSX:

```sh
find src -name "*.js" -not -name "*.test.js"
```

**Expected output: exactly `src/setupTests.js`** (no JSX in it). If any other
`.js` file is listed, `git mv` it to `.jsx` too. If a `.test.js` remains, rename
it to `.test.jsx`.

**Verify**: `find src -name "*.js"` → only `src/setupTests.js`.

### Step 5: Point the HTML entry at the renamed entry file & create root `index.html`

Create `index.html` at the **repo root** (not in `public/`). Base it on
`public/index.html` but: remove all CRA boilerplate comments and `%PUBLIC_URL%`
references; keep exactly one `<meta name="theme-color" content="#ffffff" />`
(delete the stray `#000000` one); keep the `<html lang="en">`, charset,
viewport, favicon `<link>`s, the description meta, the Google Analytics
`gtag.js` snippet in `<head>`, and the Typebot `<script type="module">` in
`<body>`; keep the manifest `<link>` commented out (plan 004 handles it). Add
the Vite entry script.

Target shape:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
    <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
    <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
    <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#5bbad5" />
    <meta name="msapplication-TileColor" content="#da532c" />
    <meta name="theme-color" content="#ffffff" />
    <!-- <link rel="manifest" href="/site.webmanifest" /> -->
    <meta
      name="description"
      content="DentRW - Dental clinic in Kigali, Rwanda" />
    <title>DentRW - Modern Dental Clinic</title>

    <!-- Google tag (gtag.js) -->
    <script
      async
      src="https://www.googletagmanager.com/gtag/js?id=G-LNXQXQ6CZG"></script>
    <script>
      window.dataLayer = window.dataLayer || []
      function gtag() {
        dataLayer.push(arguments)
      }
      gtag("js", new Date())
      gtag("config", "G-LNXQXQ6CZG")
    </script>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
    <script type="module" src="/src/index.jsx"></script>

    <script type="module">
      import Typebot from "https://cdn.jsdelivr.net/npm/@typebot.io/js@0.0/dist/web.js"

      Typebot.initBubble({
        typebot: "lead-generation-copy-nbr08a6",
        theme: {
          button: { backgroundColor: "#0042DA" },
          chatWindow: { backgroundColor: "#ffffff" },
        },
      })
    </script>
  </body>
</html>
```

Then delete `public/index.html`.

**Verify**: `test -f index.html && test ! -f public/index.html && echo ok` →
prints `ok`. `grep -c "theme-color" index.html` → `1`.

### Step 6: Convert env vars to `import.meta.env`

6a. `src/components/Contact.jsx` — replace the three
`process.env.REACT_APP_EMAILJS_*` with `import.meta.env.VITE_EMAILJS_*`:

```js
      .sendForm(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        form.current,
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      )
```

6b. `src/components/Footer.jsx` — replace the two `process.env.REACT_APP_CONVERTKIT_*`:

```js
const API_KEY = import.meta.env.VITE_CONVERTKIT_API_KEY
const FORM_ID = import.meta.env.VITE_CONVERTKIT_FORM_ID
```

While you are in this file, also delete the two debug logging lines
(`console.log("Email sent successfully!", response.data)` and
`console.error("Error sending email:", error)`) — replace the `console.error`
line with nothing (the `catch` block already sets a user-facing error message).

6c. `.env.example` — rename every key, keeping the comments:

```
# ConvertKit — https://app.convertkit.com/account/edit (API Keys section)
VITE_CONVERTKIT_API_KEY=xxxxxxxxxxxxxxxxxxxxxx

# Found under Forms > your form > Settings > Form ID
VITE_CONVERTKIT_FORM_ID=0000000

# EmailJS — https://dashboard.emailjs.com
# Found under Email Services > your service
VITE_EMAILJS_SERVICE_ID=service_xxxxxxx

# Found under Email Templates > your template
VITE_EMAILJS_TEMPLATE_ID=template_xxxxxxx

# Found under Account > API Keys (public key)
VITE_EMAILJS_PUBLIC_KEY=xxxxxxxxxxxxxxxxxxxxxx
```

**Verify**:

- `grep -rn "process.env.REACT_APP" src/` → nothing.
- `grep -rn "import.meta.env.VITE_" src/` → 5 matches.
- `grep -c "REACT_APP" .env.example` → `0`.

### Step 7: Update the Vitest setup file

In `src/setupTests.js`, change **only** the first import line from:

```js
import "@testing-library/jest-dom"
```

to:

```js
import "@testing-library/jest-dom/vitest"
```

Leave every polyfill below it untouched.

### Step 8: Rewrite `package.json` scripts and drop CRA config

Replace the `scripts` block with:

```json
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest",
    "lint": "oxlint",
    "lint:fix": "oxlint --fix",
    "format": "prettier --check .",
    "format:fix": "prettier --write .",
    "check": "prettier --write . && oxlint --fix",
    "prepare": "husky",
    "knip": "knip"
  },
```

Delete the entire `"eslintConfig": { ... }` block. Leave `browserslist`,
`lint-staged`, `dependencies`, `devDependencies` as they are (aside from the
Step 1 dep changes).

**Verify**: `grep -n "react-scripts\|eslintConfig" package.json` → nothing.
`node -e "JSON.parse(require('fs').readFileSync('package.json','utf8'))"` → exit 0.

### Step 9: Update CI

In `.github/workflows/ci.yml`:

9a. In the `test` job, change the last line from `- run: CI=true bun run test`
to:

```yaml
- run: bun run test
```

9b. Add a new `build` job (place it after the `test` job). Match the existing
jobs' structure exactly:

```yaml
build:
  name: Build
  runs-on: ubuntu-latest
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
    - run: bun run build
```

**Verify**:
`python -c "import yaml; yaml.safe_load(open('.github/workflows/ci.yml'))"` → exit 0.

### Step 10: Update the README getting-started commands

In `README.md`, find the "Getting Started" fenced code block (it currently shows
Create-React-App / `npm start` style commands) and replace the commands with:

```bash
git clone https://github.com/hbapte/dentrw-alx.git
cd dentrw-alx
bun install
cp .env.example .env.local   # fill in your values
bun run dev                  # http://localhost:3000
```

Also replace any prose mention of "Create React App" in the README with "Vite".
Do not rewrite other sections.

**Verify**: `grep -n "react-scripts\|Create React App\|npm start" README.md` → nothing.

### Step 11: Full verification (the real gate)

Create a local `.env.local` with dummy values so the app can boot:

```
VITE_CONVERTKIT_API_KEY=dummy
VITE_CONVERTKIT_FORM_ID=0000000
VITE_EMAILJS_SERVICE_ID=service_dummy
VITE_EMAILJS_TEMPLATE_ID=template_dummy
VITE_EMAILJS_PUBLIC_KEY=dummy
```

(`.env.local` is gitignored — do not commit it.)

Run, in order, and confirm each:

```
bun install
bun run format
bun run lint
bun run test
bun run build
```

- `bun run test` → all 3 tests pass (App smoke + 2 AnnouncementBar), exit 0.
- `bun run build` → exit 0; `build/index.html` and `build/assets/*.js` exist.

Then a manual smoke test:

```
bun run dev
```

Open `http://localhost:3000` and confirm in the browser:

- The page renders: announcement bar, navbar, hero, services, testimonials
  carousel (Swiper), FAQ, the contact/booking form, footer.
- Tailwind styling is applied (the announcement bar is blue, buttons are
  styled) — if the page is unstyled, `postcss.config.js` is wrong.
- Browser console has **no** errors about `import.meta`, `process is not
defined`, or missing modules. (An EmailJS/ConvertKit network error on form
  submit is fine — the dummy keys won't work.)

Stop the dev server.

## Test plan

- No new test files required. The 3 tests from plan 001 (now `App.test.jsx`,
  `AnnouncementBar.test.jsx`) must pass unchanged under Vitest — `globals: true`
  keeps the bare `test()`/`expect()` calls working.
- Optional (nice to have, not required): add `src/components/Contact.test.jsx`
  asserting the booking form renders its fields (`getByLabelText(/full name/i)`
  etc.). Model it on `AnnouncementBar.test.jsx`. Skip if the labels aren't
  properly associated (they use `for=` not `htmlFor=` — a separate plan fixes
  that).
- Verification: `bun run test` → 3 (or 3+) passing, 0 failing.

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `grep -rn "react-scripts" package.json .github/` returns nothing
- [ ] `grep -n "eslintConfig" package.json` returns nothing
- [ ] `find src -name "*.js"` lists only `src/setupTests.js`
- [ ] `test -f index.html && test ! -f public/index.html`
- [ ] `grep -c "theme-color" index.html` is `1`
- [ ] `grep -rn "process.env.REACT_APP" src/` returns nothing
- [ ] `grep -rn "import.meta.env.VITE_" src/` returns 5 matches
- [ ] `grep -c "REACT_APP" .env.example` is `0`
- [ ] `bun run test` exits 0, all pass
- [ ] `bun run build` exits 0 and produces `build/index.html`
- [ ] `bun run lint` and `bun run format` exit 0
- [ ] `bun run dev` serves a styled, error-free page at `localhost:3000` (manual)
- [ ] `python -c "import yaml; yaml.safe_load(open('.github/workflows/ci.yml'))"` exits 0
- [ ] `git status`: no out-of-scope files modified
- [ ] `plans/README.md` status row for 003 updated

## STOP conditions

Stop and report back (do not improvise) if:

- `bun run build` fails with a JSX/parse error → a JSX file was not renamed to
  `.jsx`; find it via the error's file path, `git mv` it, retry once, then STOP
  if it still fails.
- The dev-server page renders but is **completely unstyled** after checking
  `postcss.config.js` and that `tailwindcss` + `autoprefixer` are installed.
- `import.meta.env.VITE_*` values are `undefined` in the browser even with
  `.env.local` present and correctly prefixed.
- `swiper` (`src/components/Testimonials.jsx`) or `react-awesome-reveal` fails
  to bundle or throws at import time under Vite — note the exact error and STOP;
  a dependency upgrade is a separate plan.
- `bun run test` fails for a reason other than a test assertion you can trace to
  the `.jsx` rename.
- Tailwind pushes you toward v4 / `@tailwindcss/postcss` — do not go there in
  this plan.
- `bun remove react-scripts` / `bun add` changes React, react-dom, or other
  unrelated dependency versions.

## Maintenance notes

- **Deploy**: after merge, the Vercel project likely still has "Create React
  App" as its framework preset. Someone must switch it to "Vite" (build command
  `bun run build`, output directory `build`). Output dir was deliberately kept as
  `build` (not Vite's default `dist`) to make this a one-field dashboard change
  and to keep `.gitignore`'s `/build` entry valid.
- Plan 004 edits the `index.html` created here (adds OG/Twitter/JSON-LD, fixes
  the description, wires `vite-plugin-pwa`, re-enables a manifest).
- Plan 005 relies on `import.meta.env` and the Vitest setup.
- The `.oxlintrc.json` still references `next-env.d.ts` and `out/**` (Next.js
  template residue) — harmless, low priority to clean.
- `caniuse-lite` and `baseline-browser-mapping` remain in `dependencies`; they
  were likely added to quiet CRA build warnings and may now be removable — check
  with `knip` in a future cleanup, not here.
- Reviewer should scrutinize: the new `index.html` (nothing dropped from the old
  template that mattered — GA id, Typebot config), the 5 env-var call sites, and
  that the PR's CI run is green on lint/format/audit/test/build.
