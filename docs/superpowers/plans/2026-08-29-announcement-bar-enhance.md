# Announcement Bar Enhancement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the announcement bar dismissible and visually polished, and fix the mobile/French overlap by having the bar publish its height as a CSS variable that the navbar and hero consume.

**Architecture:** `AnnouncementBar` measures its own rendered height and writes it to `--announcement-height` on `<html>` (via `useLayoutEffect` + `ResizeObserver`); `Navbar` and `Hero` position themselves with `var(--announcement-height)` instead of hard-coded pixels. Dismissal is a `localStorage` flag keyed to an announcement id.

**Tech Stack:** React 19, Tailwind 3.3, react-i18next, Vitest 4, `@testing-library/*`. Design: `docs/superpowers/specs/2026-08-29-announcement-bar-enhance-design.md`.

---

## Conventions

- Branch is `advisor/announcement-bar-enhance` (already created). Do not switch branches.
- Run one test file: `bunx vitest run src/components/AnnouncementBar.test.jsx`
- Full suite: `bun run test`. Gates: `bun run format` · `bun run lint` · `bun run test` · `bun run build`.
- Pre-commit `lint-staged` runs `prettier --write` + `oxlint --fix`; let it reformat and re-stage.
- Conventional Commits.

---

## Task 1: i18n string + CSS scaffold

**Files:**

- Modify: `src/i18n/locales/en/common.json`
- Modify: `src/i18n/locales/fr/common.json`
- Modify: `src/index.css`

- [ ] **Step 1: Add the `dismiss` label to English**

In `src/i18n/locales/en/common.json`, the `announcement` object becomes:

```json
  "announcement": {
    "message": "DentRW v4 is here with new features and improvements.",
    "cta": "Explore now",
    "dismiss": "Dismiss"
  },
```

- [ ] **Step 2: Add the `dismiss` label to French**

In `src/i18n/locales/fr/common.json`, the `announcement` object becomes:

```json
  "announcement": {
    "message": "DentRW v4 est arrivé, avec de nouvelles fonctionnalités et améliorations.",
    "cta": "Découvrir",
    "dismiss": "Fermer"
  },
```

- [ ] **Step 3: Add the CSS variable default and the entrance keyframe**

In `src/index.css`, after the `@tailwind utilities;` line (and before the commented-out block), add:

```css
:root {
  --announcement-height: 0px;
}

@keyframes announcement-slide-down {
  from {
    transform: translateY(-100%);
  }
  to {
    transform: translateY(0);
  }
}
```

- [ ] **Step 4: Verify build + format**

Run: `bun run build && bun run format`
Expected: build PASSES; format PASSES (run `bun run format:fix` and re-check if not).

- [ ] **Step 5: Commit**

```bash
git add src/i18n/locales/en/common.json src/i18n/locales/fr/common.json src/index.css
git commit -m "feat: add announcement dismiss label and layout css variable"
```

---

## Task 2: Rewrite `AnnouncementBar` (TDD)

**Files:**

- Modify: `src/components/AnnouncementBar.test.jsx`
- Modify: `src/components/AnnouncementBar.jsx`

- [ ] **Step 1: Add the failing tests**

Replace the top of `src/components/AnnouncementBar.test.jsx` (the imports + the `afterEach`)
with:

```jsx
import { render, screen } from "@testing-library/react"
import { userEvent } from "@testing-library/user-event"

import i18n from "../i18n"
import AnnouncementBar from "./AnnouncementBar"

beforeEach(() => {
  localStorage.clear()
})

afterEach(async () => {
  localStorage.clear()
  await i18n.changeLanguage("en")
})
```

Then append these two tests to the end of the file:

```jsx
test("can be dismissed with the close button", async () => {
  const user = userEvent.setup()
  render(<AnnouncementBar />)
  await user.click(screen.getByRole("button", { name: /dismiss/i }))
  expect(
    screen.queryByText(/new features and improvements/i)
  ).not.toBeInTheDocument()
})

test("stays dismissed after a remount", async () => {
  const user = userEvent.setup()
  const first = render(<AnnouncementBar />)
  await user.click(screen.getByRole("button", { name: /dismiss/i }))
  first.unmount()

  render(<AnnouncementBar />)
  expect(
    screen.queryByText(/new features and improvements/i)
  ).not.toBeInTheDocument()
})
```

- [ ] **Step 2: Run the tests to verify the new ones fail**

Run: `bunx vitest run src/components/AnnouncementBar.test.jsx`
Expected: the 3 original tests PASS; the 2 new tests FAIL (no button with an accessible
name matching `/dismiss/i` exists yet).

- [ ] **Step 3: Rewrite the component**

Replace the entire contents of `src/components/AnnouncementBar.jsx` with:

```jsx
import { useLayoutEffect, useRef, useState } from "react"
import { useTranslation } from "react-i18next"

const ANNOUNCEMENT_ID = "v4-launch" // bump this when the message changes
const STORAGE_KEY = "dentrw:announcement"

function readDismissed() {
  try {
    return localStorage.getItem(STORAGE_KEY) === ANNOUNCEMENT_ID
  } catch {
    return false
  }
}

const AnnouncementBar = () => {
  const { t } = useTranslation()
  const [dismissed, setDismissed] = useState(readDismissed)
  const barRef = useRef(null)

  useLayoutEffect(() => {
    const root = document.documentElement
    if (dismissed) {
      root.style.setProperty("--announcement-height", "0px")
      return
    }
    const el = barRef.current
    if (!el) return

    const measure = () =>
      root.style.setProperty("--announcement-height", `${el.offsetHeight}px`)
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(el)

    return () => {
      observer.disconnect()
      root.style.setProperty("--announcement-height", "0px")
    }
  }, [dismissed])

  if (dismissed) return null

  const dismiss = () => {
    try {
      localStorage.setItem(STORAGE_KEY, ANNOUNCEMENT_ID)
    } catch {
      // storage unavailable (private mode, disabled) — dismiss for this session only
    }
    setDismissed(true)
  }

  return (
    <div
      ref={barRef}
      className="fixed left-0 top-0 z-50 w-full animate-[announcement-slide-down_200ms_ease-out] bg-gradient-to-r from-blue-600 to-blue-700 text-white motion-reduce:animate-none">
      <div className="relative flex items-center justify-center gap-x-2 px-10 py-2 text-center text-sm">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4 shrink-0"
          aria-hidden="true">
          <path d="m3 11 18-5v12L3 14v-3z" />
          <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
        </svg>
        <span>
          {t("announcement.message")}{" "}
          <a
            href="https://dentrw.hbapte.com"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold underline transition-colors hover:text-blue-200">
            {t("announcement.cta")} &rarr;
          </a>
        </span>
        <button
          type="button"
          onClick={dismiss}
          aria-label={t("announcement.dismiss")}
          className="absolute right-1 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded transition-colors hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
            aria-hidden="true">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  )
}

export default AnnouncementBar
```

- [ ] **Step 4: Run the tests to verify all pass**

Run: `bunx vitest run src/components/AnnouncementBar.test.jsx`
Expected: all 5 tests PASS.

- [ ] **Step 5: Lint + format**

Run: `bun run lint && bun run format` (run `bun run format:fix` if format fails, then re-check).
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/components/AnnouncementBar.jsx src/components/AnnouncementBar.test.jsx
git commit -m "feat: make the announcement bar dismissible and publish its height"
```

---

## Task 3: Consume the CSS variable in Navbar and Hero

**Files:**

- Modify: `src/components/Navbar.jsx`
- Modify: `src/components/Hero.jsx`

- [ ] **Step 1: Navbar — position below the announcement bar**

In `src/components/Navbar.jsx`, in the `<header>` `className` template literal, change
`fixed top-8` to `fixed top-[var(--announcement-height)]`. The line currently reads:

```jsx
      className={`fixed top-8 w-full flex items-center justify-between px-4 py-3 text-blue-900 transition-all ${
```

and becomes:

```jsx
      className={`fixed top-[var(--announcement-height)] w-full flex items-center justify-between px-4 py-3 text-blue-900 transition-all ${
```

- [ ] **Step 2: Hero — replace the magic top margin**

In `src/components/Hero.jsx`, the `<h2>` currently reads:

```jsx
                <h2 className="md:mt-0 mt-24  mb-6 max-w-lg text-5xl font-light leading-snug tracking-tight text-blue-600 sm:text-8xl">
```

Change `mt-24` to `mt-[calc(var(--announcement-height)+3rem)]`:

```jsx
                <h2 className="md:mt-0 mt-[calc(var(--announcement-height)+3rem)] mb-6 max-w-lg text-5xl font-light leading-snug tracking-tight text-blue-600 sm:text-8xl">
```

- [ ] **Step 3: Verify gates**

Run: `bun run lint && bun run format && bun run test && bun run build`
Expected: all PASS (33+ tests; the 2 new ones included).

- [ ] **Step 4: Manual browser check**

Run `bun run dev`. In the browser at a mobile width (~390px):

- The navbar (`DentRW` + hamburger) sits **below** the announcement bar, not on top of it —
  check in English and after switching to French (longer copy, wraps to 2 lines).
- Click the `×`: the bar disappears and the navbar slides up to the very top; the hero
  headline still has clear space above it.
- Reload: the bar stays gone.
- In DevTools, temporarily set `localStorage["dentrw:announcement"]` to a different value (or
  clear it) and reload: the bar is back.
  Stop the dev server.

- [ ] **Step 5: Commit**

```bash
git add src/components/Navbar.jsx src/components/Hero.jsx
git commit -m "fix: position navbar and hero from the announcement-height variable"
```

---

## Task 4: Final verification + PR

- [ ] **Step 1: All gates**

Run:

```bash
bun run format
bun run lint
bun run test
bun run build
```

Expected: all PASS.

- [ ] **Step 2: Push and open the PR**

```bash
git push -u origin advisor/announcement-bar-enhance
```

Open a PR against `master` following `.github/pull_request_template.md`. Summary: dismissible
announcement bar, polished styling, and a CSS-variable layout that fixes the mobile/French
navbar overlap. Note the manual browser verification from Task 3 Step 4.

- [ ] **Step 3: Confirm CI is green**

Wait for `lint`, `format`, `test`, `build` to pass on the PR.

---

## Self-review notes

- **`useLayoutEffect` + SSR** — this is a client-only Vite SPA (`ReactDOM.createRoot`), so
  `useLayoutEffect` is safe; there is no server render to warn about.
- **jsdom** — `ResizeObserver` and `matchMedia` are already mocked in `src/setupTests.js`, so
  the component mounts cleanly in tests. The `ResizeObserver` mock never fires its callback;
  the component's initial synchronous `measure()` call is what matters and it is covered by
  the mount in every test.
- **Tailwind arbitrary values** — `top-[var(--announcement-height)]` and
  `mt-[calc(var(--announcement-height)+3rem)]` are valid Tailwind 3.3 arbitrary values; no
  `tailwind.config.js` change needed. `animate-[announcement-slide-down_200ms_ease-out]`
  references the keyframe added to `index.css` in Task 1.
- **`motion-reduce:animate-none`** — Tailwind's built-in `prefers-reduced-motion` variant;
  no extra config.

---

## As-built deviations

- **Session-only dismiss** (user follow-up) — dropped `localStorage` / `ANNOUNCEMENT_ID` /
  `STORAGE_KEY` entirely. `useState(false)`; a refresh brings the bar back. Task 1's
  `announcement.dismiss` i18n key and Task 2's dismiss button are unchanged; the persistence
  test became "comes back on a fresh mount".
- **`window.resize` listener added** alongside the `ResizeObserver` in the layout effect —
  belt-and-braces so the height stays correct after an orientation/viewport change even when
  the tab is backgrounded (rAF-throttled, which starves `ResizeObserver` delivery).
- **No `src/setupTests.js` change** — the localStorage polyfill from an earlier draft was
  reverted with the session-only pivot.
- **Browser-verified** (dev server, JS measurement): 1-line bar → `--announcement-height: 36px`,
  navbar `top: 36px`, no overlap; forced 2-line bar (56px) + `resize` → var tracks to `56px`,
  navbar follows; dismiss → bar removed, var `0px`, navbar `top: 0`. A true narrow viewport
  could not be rendered in the automation environment, but the mechanism is width-agnostic
  (the initial `useLayoutEffect` measures whatever height the bar renders at).
