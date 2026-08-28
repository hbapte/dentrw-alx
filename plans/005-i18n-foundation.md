# Plan 005: i18n foundation — react-i18next setup + first slice

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> This is a **foundation / first-slice** plan. It sets up i18n infrastructure
> and converts exactly ONE component as the reference pattern. It does NOT
> translate the whole site — that's a phased follow-up documented in
> `docs/i18n.md` (which this plan creates).
>
> **Drift check (run first)**:
> `git diff --stat dca801b..HEAD -- src/ package.json`
> This plan assumes plan 003 has landed (Vite; components are `.jsx`;
> `import.meta.env`; Vitest). If `src/App.jsx` does not exist, STOP — plan 003
> is a prerequisite.

## Status

- **Priority**: P2
- **Effort**: M
- **Risk**: LOW
- **Depends on**: plans/003-migrate-cra-to-vite.md
- **Category**: direction
- **Planned at**: commit `dca801b`, 2026-08-28

## Why this matters

The README's "Room for Improvement" section explicitly promises _"Multilingual
support — Add Kinyarwanda and French translations for local accessibility."_ The
clinic is in Kigali; a meaningful share of visitors read Kinyarwanda or French
more comfortably than English. Right now every string is hardcoded English JSX
across ~14 components and `<html lang>` is a static `"en"`. This plan lays the
foundation — `react-i18next` wired up, a language switcher, `en`/`rw`/`fr`
resource files, `<html lang>` synced to the active locale — and converts one
component end to end so the rest of the work is mechanical pattern-following.
It deliberately stops there so the maintainer can decide scope and source real
translations before a 14-component sweep.

## Open questions for the maintainer (do not decide these — list them in the PR)

1. **Locale in the URL (`/rw/…`) or a runtime toggle?** There's no router today,
   so this plan uses a **runtime toggle + `localStorage`** (simplest, no routing
   dependency). If SEO per-locale matters later, revisit with routing +
   `hreflang`.
2. **Who supplies the `rw` and `fr` copy?** This plan ships `en` complete for the
   converted component and `rw`/`fr` as **English placeholders** so nothing
   renders blank. Real translation is a content task.
3. **Translate the testimonial quotes in `Testimonials.jsx`?** Recommendation:
   no — translate UI chrome only, leave user quotes in their original language.

## Current state

- Vite + React 19 + Vitest (post plan 003). Components are `src/components/*.jsx`.
- No i18n library. `grep -rn "i18n\|useTranslation\|react-intl" src/` → nothing.
- `src/index.jsx` (post plan 003):

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

- `src/components/AnnouncementBar.jsx` — the component this plan fully converts
  (small, always visible, no third-party deps):

```jsx
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

- `src/components/AnnouncementBar.test.jsx` exists (from plan 001, renamed by 003) and asserts on the strings `new features and improvements` and
  `explore now`.
- `src/components/Navbar.jsx` — ~147 lines; renders the top nav. The executor
  must read it to place the `<LanguageSwitcher>` sensibly (desktop nav + mobile
  menu).
- The other ~13 components with hardcoded copy (for the follow-up doc):
  `Navbar`, `Hero`, `Services`, `Insurance`, `Features`, `Team`, `Testimonials`
  (largest — 821 lines), `FAQs`, `Contact` (form labels, clinic hours, service
  names), `Footer` (largest after Testimonials), `Sign`.

### Conventions

- Prettier: no semicolons, double quotes, 2-space indent, `trailingComma: es5`.
- Vitest with `globals: true` — tests use bare `test()`/`expect()`, no imports
  of the test API. Setup file `src/setupTests.js`.
- Component style: function components, `const X = () => { ... }`, default export.

## Commands you will need

| Purpose       | Command                                                          | Expected                |
| ------------- | ---------------------------------------------------------------- | ----------------------- |
| Add deps      | `bun add i18next react-i18next i18next-browser-languagedetector` | exit 0                  |
| Dev           | `bun run dev`                                                    | serves `localhost:3000` |
| Tests         | `bun run test`                                                   | all pass                |
| Build         | `bun run build`                                                  | exit 0                  |
| Lint / format | `bun run lint` / `bun run format`                                | exit 0                  |

## Scope

**In scope**:

- `package.json` / `bun.lock` (add 3 deps)
- new: `src/i18n/index.js`, `src/i18n/locales/en/common.json`,
  `src/i18n/locales/rw/common.json`, `src/i18n/locales/fr/common.json`
- new: `src/components/LanguageSwitcher.jsx` (+ `LanguageSwitcher.test.jsx`)
- edit: `src/index.jsx` (import i18n), `src/App.jsx` (sync `<html lang>`, or do
  it in `src/i18n/index.js` — see Step 3)
- edit: `src/components/AnnouncementBar.jsx` (+ update its `.test.jsx`)
- edit: `src/components/Navbar.jsx` (mount `<LanguageSwitcher>` only — do NOT
  translate Navbar's own strings in this plan)
- new: `docs/i18n.md`

**Out of scope** (do NOT touch):

- Translating any component other than `AnnouncementBar`. `Navbar` gets the
  switcher mounted but its labels stay hardcoded — converting them is the first
  task of the follow-up sweep.
- URL/route-based locales.
- Real Kinyarwanda / French translations (placeholders only).
- `Testimonials.jsx` content.

## Git workflow

- Branch: `advisor/005-i18n-foundation`
- Conventional Commits. Suggested:
  - `feat: set up react-i18next with en/rw/fr and a language switcher`
  - `feat: localize the announcement bar as the i18n reference pattern`
  - `docs: document the i18n extraction convention`
- Do NOT push or open a PR unless instructed.

## Steps

### Step 1: Install i18next

```
bun add i18next react-i18next i18next-browser-languagedetector
```

**Verify**: `grep -n "react-i18next" package.json` → present in `dependencies`.

### Step 2: Create the locale resource files

`src/i18n/locales/en/common.json`:

```json
{
  "announcement": {
    "message": "DentRW v4 is here with new features and improvements.",
    "cta": "Explore now"
  },
  "language": {
    "label": "Language",
    "en": "English",
    "rw": "Kinyarwanda",
    "fr": "Français"
  }
}
```

`src/i18n/locales/rw/common.json` and `src/i18n/locales/fr/common.json`: **copy
the `en` file verbatim** (same keys, English values as placeholders). Add a
top-of-file note is not possible in JSON — instead the follow-up doc (Step 7)
records that `rw` and `fr` values are untranslated placeholders.

**Verify**: all three files `JSON.parse` cleanly; `en` and `rw` and `fr` have
identical key sets (`node -e "const a=require('./src/i18n/locales/en/common.json'); const b=require('./src/i18n/locales/rw/common.json'); const ka=Object.keys(a.announcement).concat(Object.keys(a.language)).sort(); const kb=Object.keys(b.announcement).concat(Object.keys(b.language)).sort(); if(JSON.stringify(ka)!==JSON.stringify(kb)) throw new Error('key mismatch'); console.log('ok')"`).

### Step 3: Create the i18n init module

`src/i18n/index.js`:

```js
import i18n from "i18next"
import LanguageDetector from "i18next-browser-languagedetector"
import { initReactI18next } from "react-i18next"

import enCommon from "./locales/en/common.json"
import frCommon from "./locales/fr/common.json"
import rwCommon from "./locales/rw/common.json"

export const SUPPORTED_LANGUAGES = ["en", "rw", "fr"]

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { common: enCommon },
      rw: { common: rwCommon },
      fr: { common: frCommon },
    },
    fallbackLng: "en",
    supportedLngs: SUPPORTED_LANGUAGES,
    defaultNS: "common",
    interpolation: { escapeValue: false },
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
    },
  })

// Keep <html lang> in sync with the active language.
const applyHtmlLang = (lng) => {
  if (typeof document !== "undefined") {
    document.documentElement.lang = lng
  }
}
applyHtmlLang(i18n.resolvedLanguage || "en")
i18n.on("languageChanged", applyHtmlLang)

export default i18n
```

Then in `src/index.jsx`, add the import **before** the `App` import so i18n is
initialized before first render:

```js
import "./index.css"
import "./i18n"

import App from "./App"
```

**Verify**: `bun run dev` starts with no console error; `bun run build` exits 0.

### Step 4: Build the `<LanguageSwitcher>` component

`src/components/LanguageSwitcher.jsx`:

```jsx
import React from "react"
import { useTranslation } from "react-i18next"

import { SUPPORTED_LANGUAGES } from "../i18n"

const LanguageSwitcher = () => {
  const { i18n, t } = useTranslation()
  const current = i18n.resolvedLanguage

  return (
    <div
      className="flex items-center gap-1"
      role="group"
      aria-label={t("language.label")}>
      {SUPPORTED_LANGUAGES.map((lng) => (
        <button
          key={lng}
          type="button"
          onClick={() => i18n.changeLanguage(lng)}
          aria-current={current === lng ? "true" : undefined}
          className={
            "rounded px-2 py-1 text-xs font-semibold uppercase transition-colors " +
            (current === lng
              ? "bg-blue-600 text-white"
              : "text-gray-600 hover:bg-gray-100")
          }>
          {lng}
        </button>
      ))}
    </div>
  )
}

export default LanguageSwitcher
```

Then mount it in `src/components/Navbar.jsx`: read the file, find the desktop nav
actions area (near the existing nav links / any CTA button) and the mobile menu
panel, and render `<LanguageSwitcher />` in both. Import it at the top:
`import LanguageSwitcher from "./LanguageSwitcher"`. Do not change any other
Navbar markup or text.

**Verify**: `bun run dev` → the switcher shows EN / RW / FR buttons in the
navbar (desktop and mobile); clicking one sets `aria-current` and persists
across reload (check `localStorage` key `i18nextLng`).

### Step 5: Localize `AnnouncementBar` (the reference pattern)

Rewrite `src/components/AnnouncementBar.jsx`:

```jsx
import React from "react"
import { useTranslation } from "react-i18next"

const AnnouncementBar = () => {
  const { t } = useTranslation()

  return (
    <div className="fixed top-0 left-0 w-full z-50 bg-blue-600 text-white text-sm text-center py-2 px-4">
      {t("announcement.message")}{" "}
      <a
        href="https://dentrw.hbapte.com"
        target="_blank"
        rel="noopener noreferrer"
        className="underline font-semibold hover:text-blue-200 transition-colors">
        {t("announcement.cta")} &rarr;
      </a>
    </div>
  )
}

export default AnnouncementBar
```

### Step 6: Update the affected tests

`src/components/AnnouncementBar.test.jsx` — it now renders a component that calls
`useTranslation()`, so it needs i18n initialized. Import the init module at the
top of the test (side-effect import), and assert on the `en` strings (which are
the default):

```jsx
import { render, screen } from "@testing-library/react"

import "../i18n"

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
})
```

`src/App.test.jsx` (the smoke test) — it renders `<App/>` which now includes
`<AnnouncementBar/>` (needs i18n) and `<Navbar/>` (now includes
`<LanguageSwitcher/>`, needs i18n). Add `import "./i18n"` near the top so the
provider is ready. The existing assertion (`/DentRW v4 is here/i`) still matches
the `en` placeholder text — keep it.

Add `src/components/LanguageSwitcher.test.jsx`:

```jsx
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import i18n from "../i18n"
import LanguageSwitcher from "./LanguageSwitcher"

test("renders a button per supported language", () => {
  render(<LanguageSwitcher />)
  expect(screen.getByRole("button", { name: "en" })).toBeInTheDocument()
  expect(screen.getByRole("button", { name: "rw" })).toBeInTheDocument()
  expect(screen.getByRole("button", { name: "fr" })).toBeInTheDocument()
})

test("changes the active language on click", async () => {
  const user = userEvent.setup()
  render(<LanguageSwitcher />)
  await user.click(screen.getByRole("button", { name: "fr" }))
  expect(i18n.resolvedLanguage).toBe("fr")
  // reset for other tests
  await i18n.changeLanguage("en")
})
```

(`@testing-library/user-event` is already a dependency.)

**Verify**: `bun run test` → all pass (App smoke + 2 AnnouncementBar + 2
LanguageSwitcher = 5).

### Step 7: Write `docs/i18n.md`

Create `docs/i18n.md` documenting the convention so the follow-up sweep is
mechanical:

- **Stack**: `i18next` + `react-i18next`, runtime language toggle, persisted in
  `localStorage` (`i18nextLng`). Init in `src/i18n/index.js`.
- **Locales**: `en` (complete, source of truth), `rw` and `fr` (currently
  English placeholders — real copy needed).
- **Namespaces**: one file per feature area under
  `src/i18n/locales/<lng>/<namespace>.json`. Start with `common`; add e.g.
  `contact.json`, `services.json` as components are converted. Register new
  namespaces in `src/i18n/index.js`.
- **Key naming**: `section.element` or `section.element.variant`, lowercase,
  dot-separated. Example: `contact.form.fullNameLabel`.
- **Converting a component**: import `useTranslation`, replace each hardcoded
  string with `t("key")`, add the key+English value to the matching
  `en/<ns>.json`, mirror the key into `rw` and `fr` with the English value as a
  placeholder.
- **Finding untranslated keys**: run the app in dev; i18next logs missing keys
  to the console. Optionally set `saveMissing: true` + a `missingKeyHandler` in
  dev.
- **Remaining components** (rough string counts to scope the effort), in
  suggested order: `Navbar` (~15), `Hero` (~10), `Services` (~20),
  `Insurance` (~5), `Features` (~15), `Team` (~10), `FAQs` (~20),
  `Contact` (~30 — form labels, hours, service names), `Footer` (~40),
  `Testimonials` (UI chrome only, ~10 — leave quotes as-is), `Sign` (~15).
- **`<html lang>`**: synced automatically by the `languageChanged` handler in
  `src/i18n/index.js` — nothing to do per component.
- **Do not translate**: user-generated content (testimonial quotes), brand name
  "DentRW", external URLs.

**Verify**: `test -f docs/i18n.md`.

### Step 8: Full verification

```
bun install
bun run format
bun run lint
bun run test
bun run build
```

All exit 0.

Manual (`bun run dev`): switch language in the navbar → the announcement bar
text is driven by `t()` (with `rw`/`fr` selected it shows the English
placeholder, which is expected), `<html lang>` attribute updates (check the
Elements panel), choice persists across reload, no "missing key" console errors
for `announcement.*` or `language.*`.

## Test plan

- New tests: `LanguageSwitcher.test.jsx` (2 — renders 3 buttons; click changes
  `i18n.resolvedLanguage`).
- Updated tests: `AnnouncementBar.test.jsx` (import i18n; assertions unchanged
  since `en` placeholder text matches), `App.test.jsx` (import i18n).
- Pattern to follow for future component tests: side-effect `import "../i18n"`
  at the top, then assert on `en` strings.
- Verification: `bun run test` → 5 passing, 0 failing.

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `grep -n "react-i18next" package.json` → present
- [ ] `src/i18n/index.js` exists; `src/i18n/locales/{en,rw,fr}/common.json` exist and `JSON.parse`
- [ ] `en`, `rw`, `fr` `common.json` have identical key sets
- [ ] `grep -n 'import "./i18n"' src/index.jsx` → present
- [ ] `src/components/LanguageSwitcher.jsx` exists and is imported by `src/components/Navbar.jsx`
- [ ] `grep -n "useTranslation" src/components/AnnouncementBar.jsx` → present; no hardcoded "DentRW v4 is here" string literal remains in that file
- [ ] `docs/i18n.md` exists
- [ ] `bun run test` exits 0 with 5 passing tests
- [ ] `bun run build`, `bun run lint`, `bun run format` exit 0
- [ ] `bun run dev`: language switch updates `<html lang>` and persists (manual)
- [ ] `git status`: only in-scope files changed
- [ ] `plans/README.md` status row for 005 updated

## STOP conditions

Stop and report back (do not improvise) if:

- `src/App.jsx` / `.jsx` components don't exist (plan 003 not landed).
- `react-i18next` `useTranslation` throws "provider not found" in tests even
  after the side-effect `import "../i18n"` — note the version and error.
- Mounting `<LanguageSwitcher>` in `Navbar.jsx` requires restructuring Navbar's
  markup more than adding one element in two places — STOP and describe what
  Navbar looks like; a Navbar refactor is out of scope.
- `bun run test` fails for the pre-existing tests in a way tied to i18n init
  order (e.g. tests interfere via shared `i18n` singleton language state) — note
  it; the `changeLanguage("en")` reset in the LanguageSwitcher test is meant to
  prevent this.

## Maintenance notes

- This is a foundation. The 14-component sweep is tracked in `docs/i18n.md` —
  each component is an independent, low-risk PR following the documented pattern.
- Real `rw` / `fr` translations are a content deliverable, not code — until they
  land, non-English users see English placeholders (acceptable; better than
  blank).
- If routing is added later, reconsider URL-based locales (`/rw/…`) + `hreflang`
  tags for SEO; the runtime toggle can coexist.
- Shared facts (clinic hours, phone, services) will end up duplicated between
  `src/i18n/locales/*/contact.json`, `src/components/Contact.jsx`, and the
  JSON-LD in `index.html` (plan 004). A future refactor should centralize them.
- Reviewer should check: no `en` string was changed in meaning during
  extraction, key names follow the doc's convention, and the switcher is
  keyboard-accessible.
