# Swiper 9 → 14 upgrade — design

**Date:** 2026-08-29
**Status:** Approved (design)
**Branch:** `advisor/swiper-v14`

## Problem

`swiper` is pinned at `^9.3.2`; latest is `14.2.0`. It is used in exactly one component,
`src/components/Testimonials.jsx` (the reviews carousel).

## Current usage

```jsx
import { Autoplay, Navigation, Pagination } from "swiper"
import { Swiper, SwiperSlide } from "swiper/react"

import "swiper/css"
import "swiper/css/pagination"
import "swiper/css/navigation"
```

`<Swiper>` props: `loop`, `autoplay={{ delay: 4000, disableOnInteraction: false }}`,
`slidesPerView={1}`, `spaceBetween={10}`, `pagination={{ clickable: true }}`,
`navigation={{ nextEl: ".next-button", prevEl: ".prev-button" }}`,
`modules={[Autoplay, Pagination, Navigation]}`, `breakpoints={{ 768: {...}, 1524: {...} }}`.
6 `<SwiperSlide>`s from `testimonials.data.js`. Custom prev/next `<button>`s sit outside the
`<Swiper>` and are wired via the `navigation` selectors.

## The only breaking change that applies

Swiper 11 moved module imports from `"swiper"` to `"swiper/modules"`:

```diff
- import { Autoplay, Navigation, Pagination } from "swiper"
+ import { Autoplay, Navigation, Pagination } from "swiper/modules"
```

`swiper/react`, the three `swiper/css*` imports, and every `<Swiper>` / `<SwiperSlide>`
prop used here are unchanged through v14. Swiper 14 is ESM-only (`.mjs`) — Vite/Vitest
handle that already.

## Decisions

| Question       | Decision                                                                 |
| -------------- | ------------------------------------------------------------------------ |
| Target version | `swiper@^14` (latest). The API surface used here is stable across 11–14. |
| Config changes | None beyond the import path.                                             |

## Loop-mode note

Swiper 11 rewrote loop mode. With 6 slides and `slidesPerView` up to 3, that is exactly the
minimum Swiper wants (`slidesPerView * 2 <= slides`). If the console logs a
"not enough slides" warning or the loop stutters, the fix is `loopAdditionalSlides={2}` on
`<Swiper>`. Decide at verification time; do not add it pre-emptively.

## Files

| File                              | Change                                           |
| --------------------------------- | ------------------------------------------------ |
| `package.json`, `bun.lock`        | `swiper` → `^14` (via `bun add`)                 |
| `src/components/Testimonials.jsx` | one import line: `"swiper"` → `"swiper/modules"` |

## Verification

- `bun run build` / `lint` / `format` / `test` (35 — there is no Swiper test; this only
  confirms nothing else regressed).
- Dev server: the carousel autoplays (4s), pagination bullets render and are clickable, the
  custom prev/next arrow buttons advance it, the 768 / 1524 breakpoints change
  slides-per-view, and `loop` wraps cleanly across the 6 testimonials.
- Browser console: no Swiper deprecation warnings.
- Eyeball the default pagination bullets / theme colour — Swiper's defaults shifted slightly
  between v9 and v14 and this component uses them as-is.
- Vercel preview.

## Out of scope

- Swiper Element / web-component API (not used — this is the React component API).
- Restyling the pagination or navigation.
- Adding a Testimonials component test.
