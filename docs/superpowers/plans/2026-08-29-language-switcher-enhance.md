# Language Switcher Enhancement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Rewrite `LanguageSwitcher` with inline SVG flags and two variants — a segmented pill for the navbar and an upward dropdown for the footer — and improve its accessible names.

**Architecture:** One component file exporting `LanguageSwitcher({ variant })`. Shared `LANGUAGES` metadata array pairs each code with its flag component. `variant="pill"` (default) keeps both existing Navbar call sites working untouched; `variant="dropdown"` is new and mounted in the Footer bottom bar.

**Tech Stack:** React 19, Tailwind v4, react-i18next, Vitest 4, `@testing-library/*`. Design: `docs/superpowers/specs/2026-08-29-language-switcher-enhance-design.md`.

---

## Conventions

- Branch is `advisor/language-switcher-enhance` (already created). Do not switch branches.
- One test file: `bunx vitest run src/components/LanguageSwitcher.test.jsx`
- Gates: `bun run format` · `bun run lint` · `bun run test` · `bun run build`.
- Pre-commit `lint-staged` runs `prettier --write` + `oxlint --fix`; let it reformat.
- Conventional Commits.

---

## Task 1: Rewrite the component (TDD)

**Files:**

- Modify: `src/components/LanguageSwitcher.test.jsx`
- Modify: `src/components/LanguageSwitcher.jsx`

- [ ] **Step 1: Write the full new test file**

Replace `src/components/LanguageSwitcher.test.jsx` entirely:

```jsx
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import i18n from "../i18n"
import LanguageSwitcher from "./LanguageSwitcher"

afterEach(async () => {
  await i18n.changeLanguage("en")
})

describe("pill variant", () => {
  test("renders a button per supported language, named in its own language", () => {
    render(<LanguageSwitcher />)
    expect(screen.getByRole("button", { name: "English" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Français" })).toBeInTheDocument()
  })

  test("changes the active language on click", async () => {
    const user = userEvent.setup()
    render(<LanguageSwitcher />)
    await user.click(screen.getByRole("button", { name: "Français" }))
    expect(i18n.resolvedLanguage).toBe("fr")
  })

  test("marks the active language with aria-pressed", () => {
    render(<LanguageSwitcher />)
    expect(screen.getByRole("button", { name: "English" })).toHaveAttribute(
      "aria-pressed",
      "true"
    )
    expect(screen.getByRole("button", { name: "Français" })).toHaveAttribute(
      "aria-pressed",
      "false"
    )
  })

  test("renders a decorative flag for each language", () => {
    const { container } = render(<LanguageSwitcher />)
    const flags = container.querySelectorAll("svg[aria-hidden='true']")
    expect(flags.length).toBeGreaterThanOrEqual(2)
  })
})

describe("dropdown variant", () => {
  test("shows the current language and starts collapsed", () => {
    render(<LanguageSwitcher variant="dropdown" />)
    const trigger = screen.getByRole("button", { expanded: false })
    expect(trigger).toHaveTextContent("English")
    expect(screen.queryByRole("button", { name: "Français" })).toBeNull()
  })

  test("opens on click and lists both languages", async () => {
    const user = userEvent.setup()
    render(<LanguageSwitcher variant="dropdown" />)
    await user.click(screen.getByRole("button", { expanded: false }))
    expect(screen.getByRole("button", { expanded: true })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "English" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Français" })).toBeInTheDocument()
  })

  test("selecting a language changes it and closes the menu", async () => {
    const user = userEvent.setup()
    render(<LanguageSwitcher variant="dropdown" />)
    await user.click(screen.getByRole("button", { expanded: false }))
    await user.click(screen.getByRole("button", { name: "Français" }))
    expect(i18n.resolvedLanguage).toBe("fr")
    expect(screen.getByRole("button", { expanded: false })).toBeInTheDocument()
  })

  test("closes on Escape", async () => {
    const user = userEvent.setup()
    render(<LanguageSwitcher variant="dropdown" />)
    await user.click(screen.getByRole("button", { expanded: false }))
    await user.keyboard("{Escape}")
    expect(screen.getByRole("button", { expanded: false })).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `bunx vitest run src/components/LanguageSwitcher.test.jsx`
Expected: FAIL — the accessible names are still `"en"` / `"fr"`, and there is no dropdown
variant.

- [ ] **Step 3: Write the component**

Replace `src/components/LanguageSwitcher.jsx` entirely:

```jsx
import { useEffect, useRef, useState } from "react"
import { useTranslation } from "react-i18next"

import { SUPPORTED_LANGUAGES } from "../i18n"

// Inline SVGs so the flags render identically on every OS — Windows ships no
// emoji flag glyphs and would show "GB" / "FR" as letters instead.
// Both use a 3:2 viewBox so they share a baseline.
const FLAG_CLASS = "h-3 w-[18px] shrink-0 rounded-[2px] ring-1 ring-black/10"

function FlagGB({ className = FLAG_CLASS }) {
  return (
    <svg viewBox="0 0 60 40" className={className} aria-hidden="true">
      <rect width="60" height="40" fill="#012169" />
      <path d="M0 0 60 40M60 0 0 40" stroke="#fff" strokeWidth="8" />
      <path d="M0 0 60 40M60 0 0 40" stroke="#C8102E" strokeWidth="4" />
      <path d="M30 0v40M0 20h60" stroke="#fff" strokeWidth="13" />
      <path d="M30 0v40M0 20h60" stroke="#C8102E" strokeWidth="8" />
    </svg>
  )
}

function FlagFR({ className = FLAG_CLASS }) {
  return (
    <svg viewBox="0 0 60 40" className={className} aria-hidden="true">
      <rect width="20" height="40" fill="#002395" />
      <rect x="20" width="20" height="40" fill="#fff" />
      <rect x="40" width="20" height="40" fill="#ED2939" />
    </svg>
  )
}

const FLAGS = { en: FlagGB, fr: FlagFR }

function GlobeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4 shrink-0"
      aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2a15.3 15.3 0 0 1 0 20 15.3 15.3 0 0 1 0-20" />
    </svg>
  )
}

function ChevronIcon({ open }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`h-3.5 w-3.5 shrink-0 transition-transform motion-reduce:transition-none ${
        open ? "rotate-180" : ""
      }`}
      aria-hidden="true">
      <path d="m18 15-6-6-6 6" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="ml-auto h-3.5 w-3.5 shrink-0 text-blue-600"
      aria-hidden="true">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}

function PillSwitcher({ current, label, onSelect, nameOf }) {
  const activeIndex = Math.max(0, SUPPORTED_LANGUAGES.indexOf(current))

  return (
    <div
      role="group"
      aria-label={label}
      className="relative inline-flex items-center rounded-full bg-blue-50 p-0.5 ring-1 ring-blue-100">
      <span
        aria-hidden="true"
        className="absolute inset-y-0.5 left-0.5 w-[calc(50%-2px)] rounded-full bg-blue-600 shadow-sm transition-transform duration-200 ease-out motion-reduce:transition-none"
        style={{ transform: `translateX(${activeIndex * 100}%)` }}
      />
      {SUPPORTED_LANGUAGES.map((lng) => {
        const Flag = FLAGS[lng]
        const isActive = current === lng
        return (
          <button
            key={lng}
            type="button"
            onClick={() => onSelect(lng)}
            aria-label={nameOf(lng)}
            aria-pressed={isActive}
            className={`relative z-10 flex flex-1 items-center justify-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold uppercase transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 motion-reduce:transition-none ${
              isActive ? "text-white" : "text-blue-900/70 hover:text-blue-900"
            }`}>
            {Flag ? <Flag /> : null}
            {lng}
          </button>
        )
      })}
    </div>
  )
}

function DropdownSwitcher({ current, label, onSelect, nameOf }) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)
  const triggerRef = useRef(null)
  const CurrentFlag = FLAGS[current]

  useEffect(() => {
    if (!open) return

    const onPointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false)
    }
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        setOpen(false)
        triggerRef.current?.focus()
      }
    }

    document.addEventListener("mousedown", onPointerDown)
    document.addEventListener("keydown", onKeyDown)
    return () => {
      document.removeEventListener("mousedown", onPointerDown)
      document.removeEventListener("keydown", onKeyDown)
    }
  }, [open])

  const select = (lng) => {
    onSelect(lng)
    setOpen(false)
    triggerRef.current?.focus()
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={label}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex items-center gap-2 rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white motion-reduce:transition-none">
        <GlobeIcon />
        {nameOf(current)}
        <ChevronIcon open={open} />
      </button>

      {open && (
        <ul className="absolute bottom-full left-0 z-50 mb-2 min-w-full overflow-hidden rounded-lg bg-white py-1 shadow-lg ring-1 ring-black/5">
          {SUPPORTED_LANGUAGES.map((lng) => {
            const Flag = FLAGS[lng]
            const isActive = current === lng
            return (
              <li key={lng}>
                <button
                  type="button"
                  onClick={() => select(lng)}
                  aria-label={nameOf(lng)}
                  aria-current={isActive ? "true" : undefined}
                  className={`flex w-full items-center gap-2 whitespace-nowrap px-3 py-2 text-left text-sm transition-colors hover:bg-blue-50 focus-visible:bg-blue-50 focus-visible:outline-none motion-reduce:transition-none ${
                    isActive ? "font-semibold text-blue-900" : "text-gray-700"
                  }`}>
                  {Flag ? <Flag /> : null}
                  {nameOf(lng)}
                  {isActive ? <CheckIcon /> : null}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

const LanguageSwitcher = ({ variant = "pill" }) => {
  const { i18n, t } = useTranslation()
  const current = i18n.resolvedLanguage
  const label = t("language.label")
  const nameOf = (lng) => t(`language.${lng}`)
  const onSelect = (lng) => i18n.changeLanguage(lng)

  const props = { current, label, onSelect, nameOf }
  return variant === "dropdown" ? (
    <DropdownSwitcher {...props} />
  ) : (
    <PillSwitcher {...props} />
  )
}

export default LanguageSwitcher
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `bunx vitest run src/components/LanguageSwitcher.test.jsx`
Expected: all 8 tests PASS.

If the "shows the current language and starts collapsed" test fails because
`getByRole("button", { expanded: false })` matches more than one element, the pill variant is
leaking into that render — check that `variant="dropdown"` is being read.

- [ ] **Step 5: Full suite + lint + format**

Run: `bun run test && bun run lint && bun run format`
Expected: 41 tests pass; lint exit 0; format clean (run `bun run format:fix` if not).

- [ ] **Step 6: Commit**

```bash
git add src/components/LanguageSwitcher.jsx src/components/LanguageSwitcher.test.jsx
git commit -m "feat: add flags and pill/dropdown variants to the language switcher"
```

---

## Task 2: Mount the dropdown variant in the Footer

**Files:**

- Modify: `src/components/Footer.jsx`

- [ ] **Step 1: Import the switcher**

At the top of `src/components/Footer.jsx`, after the existing imports, add:

```jsx
import LanguageSwitcher from "./LanguageSwitcher"
```

- [ ] **Step 2: Add it to the bottom bar**

Find the bottom-bar block near the end of the file:

```jsx
        <div className="py-2 border-t text-sm px-1 flex justify-between">
          <div className="text-left dark:text-gray-400">©2023 - DentRW</div>
```

Replace that opening `<div>` and insert the switcher as the first child, so the block reads:

```jsx
        <div className="flex flex-col gap-3 border-t px-1 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
          <LanguageSwitcher variant="dropdown" />
          <div className="text-left dark:text-gray-400">©2023 - DentRW</div>
```

Leave the "Developed by hbapte" block that follows exactly as it is.

- [ ] **Step 3: Verify gates**

Run: `bun run lint && bun run format && bun run test && bun run build`
Expected: all PASS (run `bun run format:fix` if format fails).

- [ ] **Step 4: Commit**

```bash
git add src/components/Footer.jsx
git commit -m "feat: add the language switcher to the footer"
```

---

## Task 3: Browser verification

**Files:** none unless a fix is needed.

- [ ] **Step 1: Start the dev server**

`bun run dev`. **Confirm `window.innerWidth > 0` before trusting any measurement** — this
session's automation window has repeatedly collapsed to 0px, which makes every layout
assertion meaningless. If it is 0, close the tab, open a fresh one and resize it.

- [ ] **Step 2: Navbar pill**

At desktop width: both flags render (Union Jack has visible red/white crosses, not a blue
blob), the active pill sits under `EN`, and clicking `FR` slides the pill and translates the
page. The hairline ring makes each flag distinct from the white navbar.

- [ ] **Step 3: Navbar mobile menu**

At ~390px: open the hamburger; the pill renders inside the menu without overflowing the
48-wide dropdown (`w-48`). If it overflows, that is a real bug — report it rather than
silently restyling.

- [ ] **Step 4: Footer dropdown**

Scroll to the footer: the trigger shows a globe + "English" + chevron on the navy background.
Click it — the menu opens **upward** (not clipped off the bottom of the page), lists both
languages with flags, and shows a check on the active one. Selecting Français translates the
site and closes the menu. Re-open and press Esc — it closes. Re-open and click elsewhere —
it closes.

- [ ] **Step 5: Screenshot the navbar pill and the open footer dropdown for the PR.**
      Stop the dev server.

---

## Task 4: Ship

- [ ] **Step 1: Final gates**

```bash
bun run format && bun run lint && bun run test && bun run build
```

- [ ] **Step 2: Push + PR**

```bash
git push -u origin advisor/language-switcher-enhance
```

PR against `master` using `.github/pull_request_template.md`. Summary: flags + two variants +
footer placement + the accessible-name fix. Attach the screenshots.

- [ ] **Step 3: Confirm CI + the Vercel preview are green.**

---

## Self-review notes

- **`Navbar.jsx` is deliberately untouched.** Both of its call sites use the default `pill`
  variant, so the diff stays contained to the switcher, the footer, and the tests.
- **The accessible-name change is intentional and is the reason the two existing tests
  change.** `"en"` → `"English"` is a genuine screen-reader improvement, not test-fitting.
- The sliding indicator uses an inline `style` transform rather than a Tailwind class because
  the offset is derived from the active index at runtime; Tailwind cannot generate a class
  from a variable.
- `FLAGS` is keyed by language code with a `Flag ? <Flag /> : null` guard, so adding a third
  language to `SUPPORTED_LANGUAGES` degrades to a text-only button instead of crashing.
