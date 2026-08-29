# Tailwind CSS v3 → v4 upgrade — design

**Date:** 2026-08-29
**Status:** Approved (design)
**Branch:** `advisor/tailwind-v4`

## Problem

The project is on `tailwindcss ^3.3.2` with a PostCSS pipeline (`postcss`, `autoprefixer`).
Tailwind v4 (`4.3.3`) is a ground-up rewrite with a new engine, CSS-first configuration, and
a dedicated Vite plugin. We want to move to v4 and shed the now-unnecessary build machinery.

Current state worth noting:

- `tailwind.config.js` is effectively dead: the `content` globs are auto-detected in v4, the
  custom `theme.extend.colors.primary` scale is **used nowhere** in `src/`, and `plugins: []`
  is empty.
- `@tailwindcss/forms` is a devDependency but is **not** registered in `plugins`, so it has no
  effect on rendering today.
- `src/index.css` uses the three `@tailwind` directives plus a `:root { --announcement-height }`
  variable and an `@keyframes announcement-slide-down` (added in the announcement-bar work).

## Decisions

| Question              | Decision                                                                                                                                   |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Browser-support floor | Adopt v4's baseline (Safari 16.4+, Chrome 111+, Firefox 128+ — pre-2023 browsers drop). Update the `package.json` `browserslist` to match. |
| Build integration     | `@tailwindcss/vite` plugin. Delete `postcss.config.js`; remove `postcss` + `autoprefixer` (v4 vendor-prefixes via Lightning CSS).          |
| Config file           | Delete `tailwind.config.js` — nothing to migrate. No `@config` directive.                                                                  |
| `@tailwindcss/forms`  | Remove — it was never active.                                                                                                              |

## Approach

1. Run the official `npx @tailwindcss/upgrade` codemod on the clean branch. It:
   - rewrites `@tailwind base/components/utilities` → `@import "tailwindcss";`
   - renames deprecated utilities across `.jsx` files (`shadow-sm`→`shadow-xs`,
     `shadow`→`shadow-sm`, `rounded-sm`→`rounded-xs`, `outline-none`→`outline-hidden`, …)
   - adds a compatibility `@layer base` so bare `border` / `divide` keep the v3 `gray-200`
     colour (v4 defaults to `currentColor`)
   - bumps `tailwindcss` in `package.json`
2. Reconcile the codemod's output to the decisions above (Vite plugin, no config file, drop
   `postcss`/`autoprefixer`/`forms`).
3. Manual review + visual regression pass + Vercel preview.

## Reconciliation details

### `vite.config.mjs`

```js
import tailwindcss from "@tailwindcss/vite"
// ...
plugins: [react(), tailwindcss(), apiDevPlugin(), VitePWA({ ... })]
```

### `src/index.css`

```css
@import "tailwindcss";

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

/* v4 makes <button> default to `cursor: default`; keep the pointer. */
@layer base {
  button:not(:disabled),
  [role="button"]:not(:disabled) {
    cursor: pointer;
  }
}
```

Whatever compatibility `@layer base` block the codemod adds for border colour is kept as-is.

### `.prettierrc`

Add `"tailwindStylesheet": "./src/index.css"` (v4's replacement for the old `tailwindConfig`
option) so `prettier-plugin-tailwindcss` can resolve classes. `prettier-plugin-tailwindcss`
stays at `^0.8.1` (already v4-aware).

### `package.json`

- **add** `tailwindcss@4`, `@tailwindcss/vite@4` (dev)
- **remove** `autoprefixer`, `postcss`, `@tailwindcss/forms`
- `browserslist` → a modern baseline, e.g.
  `["last 2 versions", "not dead", "fully supports es6-module"]` (documentation only — no
  tool consumes it once autoprefixer is gone)

### Deletions

- `postcss.config.js`
- `tailwind.config.js`

## Not migrated / left alone

- `top-[var(--announcement-height)]` / `mt-[calc(var(--announcement-height)+3rem)]` /
  `animate-[announcement-slide-down_200ms_ease-out]` — arbitrary-value syntax still works in
  v4; no need to convert to the `top-(--var)` shorthand.
- `bg-blue-gray-*` / `text-blue-gray-*` classes (5 uses) — `blue-gray` is undefined in v3
  too, so these are already no-ops; v4 changes nothing.
- `@keyframes` stays as plain CSS rather than moving to `@theme { --animate-* }` — it works
  and the arbitrary `animate-[…]` reference resolves to it.

## Verification

- `bun run build` — the Vite build produces a CSS bundle; check its size is comparable.
- `bun run test` (35), `bun run lint`, `bun run format`.
- `npx tailwindcss` is not invoked directly anywhere; the only entry point is the Vite
  plugin.
- **Visual regression** — dev server, before/after screenshots at desktop **and** mobile
  width of: Hero, Services, Contact form, Footer (newsletter input + `focus:ring`),
  Testimonials, the announcement bar. v4's changes to shadows, `ring` default width
  (3px → 1px), and the `space-*` / `divide-*` selector (`> * + *` → `:not(:last-child)`)
  are the things to eyeball.
- Vercel preview deploy green.

## Risks

- **Vite 8** — `@tailwindcss/vite@4.3.3` peer-declares `vite: ^5.2 || ^6 || ^7 || ^8`;
  still, exercise `bun run dev` and `bun run build` immediately after wiring the plugin.
- **`space-*` / `divide-*` selector change** — present in Hero/Footer/FAQs/Navbar. Usually
  transparent; the screenshot pass is the safety net. If something breaks, the fix is
  local (swap to `gap-*` on a flex/grid parent).
- **vitest CSS handling** (`css: true` in `vite.config.mjs` `test`) — the shared Vite config
  means the Tailwind plugin runs during tests too. If it slows the suite or errors on
  `@import "tailwindcss"`, set `test.css = false` (the tests assert on DOM/text, not
  computed styles).
- **`focus:outline-none` → `focus:outline-hidden`** on the Footer newsletter input — the
  codemod handles the rename; verify the focus ring still shows.

## Out of scope

- Re-introducing a custom colour palette or any Tailwind plugin.
- Converting arbitrary values to v4 shorthand syntax.
- The pending i18n "Group 3" sweep.
