# Announcement bar: dismissible + enhanced + fix mobile overlap — design

**Date:** 2026-08-29
**Status:** Approved (design)
**Branch:** `advisor/announcement-bar-enhance`

## Problem

`src/components/AnnouncementBar.jsx` is `fixed top-0` with wrapping text. `src/components/Navbar.jsx`
is hard-coded to `fixed top-8` (32px), assuming the bar is exactly one line tall. On mobile —
and in French, where the copy is longer — the bar wraps to 2+ lines (~56–80px) and the navbar
renders on top of it. `src/components/Hero.jsx` carries a magic `mt-24 md:mt-0` on its `<h2>`
to compensate. The three components are coupled by guessed pixel values, and the bar cannot be
dismissed.

## Decisions

| Question            | Decision                                                                                                                     |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Overlap fix         | AnnouncementBar publishes its measured height as a CSS variable; Navbar and Hero consume it                                  |
| Dismiss persistence | `localStorage`, keyed to an announcement id — closing sticks; bumping the id re-shows it for everyone                        |
| Visual              | Polished: brand-blue gradient, leading megaphone icon, slide-down entrance (reduced-motion aware), accessible dismiss button |
| i18n                | Add `announcement.dismiss` (EN "Dismiss", FR "Fermer") to `common.json`                                                      |

## Layout: the CSS variable

- `src/index.css` — `:root { --announcement-height: 0px; }` as the default, plus a
  `@keyframes announcement-slide-down` used by the bar.
- `AnnouncementBar` — a `ref` on the outer element. A `useLayoutEffect`:
  1. writes `el.offsetHeight + "px"` to `document.documentElement.style` as
     `--announcement-height`,
  2. observes the element with `ResizeObserver` to keep the value current on wrap / viewport
     change,
  3. cleanup (unmount, or `dismissed` flips true) resets the property to `"0px"` and
     disconnects the observer.
- `Navbar` — `fixed top-8` → `fixed top-[var(--announcement-height)]`.
- `Hero` — `<h2>` class `md:mt-0 mt-24` → `md:mt-0 mt-[calc(var(--announcement-height)+3rem)]`.
  Desktop is unchanged (`md:mt-0`; the hero's `md:py-36` already clears the chrome).

When `dismissed` is true the component returns `null`; the layout effect has already set the
variable to `0px`, so the navbar animates up to `top: 0` (it already has `transition-all`).

## Dismissible

```jsx
const ANNOUNCEMENT_ID = "v4-launch" // bump when the message changes
const STORAGE_KEY = "dentrw:announcement"
```

- Initial state: `dismissed = readDismissed() === ANNOUNCEMENT_ID`, where `readDismissed()` is a
  guarded `localStorage.getItem` (wrapped in try/catch — Safari private mode, etc.).
- The dismiss button calls `setDismissed(true)` and `localStorage.setItem(STORAGE_KEY, ANNOUNCEMENT_ID)`
  (also try/catch-guarded).
- Because the stored value is compared against the current `ANNOUNCEMENT_ID`, a previously
  dismissed bar reappears the next time `ANNOUNCEMENT_ID` changes.

## Visual (polished)

- Container: `fixed top-0 left-0 z-50 w-full` (unchanged positioning) +
  `bg-gradient-to-r from-blue-600 to-blue-700 text-white`.
- Layout: `relative flex items-center justify-center gap-x-2 px-10 py-2 text-center text-sm`
  — `px-10` keeps the centered text clear of the absolutely-positioned close button on
  narrow screens.
- Leading icon: inline megaphone SVG, `h-4 w-4 shrink-0`, `aria-hidden`.
- Message + CTA link: unchanged copy/behaviour (`t("announcement.message")`,
  `t("announcement.cta")`, links to `https://dentrw.hbapte.com`, `target="_blank"
rel="noopener noreferrer"`).
- Dismiss button: `absolute right-1 top-1/2 -translate-y-1/2`, `grid h-9 w-9 place-items-center
rounded hover:bg-white/10`, `aria-label={t("announcement.dismiss")}`, contains an `×` SVG
  (`aria-hidden`).
- Entrance: `animate-[announcement-slide-down_200ms_ease-out] motion-reduce:animate-none`.

## i18n

`src/i18n/locales/en/common.json` and `.../fr/common.json` — add under `announcement`:

```json
"dismiss": "Dismiss"   // en
"dismiss": "Fermer"    // fr
```

## Tests (`src/components/AnnouncementBar.test.jsx`)

`ResizeObserver` and `matchMedia` are already mocked in `src/setupTests.js`.

- **Keep** the 3 existing tests (message, external link, French copy).
- Add `beforeEach(() => localStorage.clear())`.
- Add: clicking the dismiss button (found by its `aria-label`) removes the announcement text
  from the document.
- Add: after dismissing and re-rendering a fresh `<AnnouncementBar />`, the announcement text
  is not in the document (persistence via `localStorage`).

## Files

| File                                                    | Change                                                  |
| ------------------------------------------------------- | ------------------------------------------------------- |
| `src/components/AnnouncementBar.jsx`                    | rewrite                                                 |
| `src/components/Navbar.jsx`                             | one class: `top-8` → `top-[var(--announcement-height)]` |
| `src/components/Hero.jsx`                               | one class on the `<h2>`                                 |
| `src/index.css`                                         | `--announcement-height` default + `@keyframes`          |
| `src/i18n/locales/en/common.json`, `.../fr/common.json` | add `announcement.dismiss`                              |
| `src/components/AnnouncementBar.test.jsx`               | +2 tests, `beforeEach`                                  |

## Out of scope

- A generic reusable `<Banner>` / `useDismissible` abstraction (only one consumer — YAGNI).
- Server-driven announcement content.
- Changing the CTA target or the announcement copy itself.
- The pending i18n "Group 3" sweep (Contact/Footer/Testimonials chrome).
