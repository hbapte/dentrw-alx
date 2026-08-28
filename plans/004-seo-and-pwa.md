# Plan 004: SEO essentials + installable PWA

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**:
> `git diff --stat dca801b..HEAD -- index.html vite.config.js public/ package.json`
> This plan assumes plan 003 has landed (there is a root `index.html` and a
> `vite.config.js`). If `index.html` does not exist at the repo root, STOP —
> plan 003 is a hard prerequisite.

## Status

- **Priority**: P2
- **Effort**: M
- **Risk**: LOW-MED
- **Depends on**: plans/003-migrate-cra-to-vite.md
- **Category**: direction
- **Planned at**: commit `dca801b`, 2026-08-28

## Why this matters

DentRW is a marketing site for a **local dental clinic** — its entire job is to
be found by people in Kigali searching for a dentist and to look credible when
its link is shared. Today it ships almost none of the signals that make that
work: a thin one-line `<meta description>` (with a typo), **two conflicting
`theme-color` tags**, no `<link rel="canonical">`, no Open Graph or Twitter Card
tags (so shared links render as a bare URL with no title/image), and no
structured data — Google has a dedicated `Dentist`/`LocalBusiness` rich-result
that this site is a textbook case for and doesn't use. The web manifest exists
in `public/` but its `<link>` is commented out, so the site isn't installable.
This plan adds the standard SEO head content, a `Dentist` JSON-LD block built
from the clinic's real details, and turns the site into an installable PWA with
an offline shell via `vite-plugin-pwa`.

## Current state

### `index.html` (created by plan 003) — the head is thin

Relevant parts as plan 003 leaves them:

```html
<meta name="msapplication-TileColor" content="#da532c" />
<meta name="theme-color" content="#ffffff" />
<!-- <link rel="manifest" href="/site.webmanifest" /> -->
<meta name="description" content="DentRW - Dental clinic in Kigali, Rwanda" />
<title>DentRW - Modern Dental Clinic</title>
```

No canonical, no `og:*`, no `twitter:*`, no JSON-LD.

### The clinic's real details (source of truth: `src/components/Contact.jsx`)

- **Name**: DentRW
- **Phone**: `+250727108418`
- **Email shown on site**: `ijbapte@gmail.com`
- **Address**: `KG 14 Ave - Remera`, Kigali, Rwanda
- **Hours**: Monday–Friday 06:00–17:00; Saturday 10:00–16:00; Sunday closed
- **Services** (from the booking form `<select>`): dental check-ups & consultation,
  X-rays, fillings, crowns & bridges, root canal treatment, cleaning & teeth
  whitening, orthodontic treatment, periodontal treatment, dental implants
- **Primary domain**: `https://dentrw.hbapte.com` (README; the v4 site).
  Secondary: `https://dentrw.vercel.app`.
- **Brand color**: `#2563eb` (Tailwind `primary-600` in `tailwind.config.js`).

### Assets that exist in `public/`

- `android-chrome-192x192.png`, `android-chrome-512x512.png`, `apple-touch-icon.png`,
  `favicon-16x16.png`, `favicon-32x32.png`, `safari-pinned-tab.svg`,
  `robots.txt`, `manifest.json`, `site.webmanifest`, `browserconfig.xml`,
  various `mstile-*.png`.
- `manifest.json` (has content) and `site.webmanifest` (empty `name`/`short_name`
  stub) are **duplicated and inconsistent**. `manifest.json`:

```json
{
  "short_name": "Dental Rw",
  "name": "DentRW - Modern Clinic",
  "icons": [
    {
      "src": "/android-chrome-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/android-chrome-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ],
  "theme_color": "#ffffff",
  "background_color": "#ffffff",
  "display": "standalone"
}
```

- There is **no** social share image. `src/components/Images/screenshot.jpg`
  exists (used in the README) and will be used as a placeholder OG image.

### `public/robots.txt`

Exists; contents unknown to this plan — the executor must read it and ensure it
allows crawling and declares a sitemap (Step 4).

### Conventions

- Prettier: no semicolons, double quotes, 2-space indent. `bun run format:fix`
  what you touch. HTML and JSON are formatted by Prettier too.
- `vite.config.js` is ESM (`export default defineConfig(...)`).

## Commands you will need

| Purpose          | Command                                                        | Expected                                                           |
| ---------------- | -------------------------------------------------------------- | ------------------------------------------------------------------ |
| Add PWA plugin   | `bun add -d vite-plugin-pwa`                                   | exit 0                                                             |
| Build            | `bun run build`                                                | exit 0; `build/` has `index.html`, `manifest.webmanifest`, `sw.js` |
| Tests            | `bun run test`                                                 | all pass                                                           |
| Lint             | `bun run lint`                                                 | exit 0                                                             |
| Format check     | `bun run format`                                               | exit 0                                                             |
| Validate JSON-LD | `node -e "JSON.parse(process.argv[1])" "<the ld+json string>"` | exit 0                                                             |

## Scope

**In scope**:

- `index.html` (add head content; fix description; one theme-color)
- `vite.config.js` (add `vite-plugin-pwa`)
- `package.json` / `bun.lock` (add `vite-plugin-pwa`)
- `public/robots.txt` (ensure sitemap + allow)
- add `public/og-image.jpg` (copied placeholder)
- delete `public/manifest.json` and `public/site.webmanifest` (replaced by the
  plugin-generated `manifest.webmanifest`)

**Out of scope** (do NOT touch):

- Server-side rendering / prerendering / `react-helmet` — there is one route and
  no router; per-page meta isn't needed yet. A future routing change revisits
  this.
- Designing a real branded 1200×630 OG image (follow-up task — placeholder only
  here).
- Component source under `src/` — no JSX changes.
- `browserconfig.xml`, `mstile-*` — leave as-is.
- Analytics/Typebot scripts in `index.html` — leave as-is.

## Git workflow

- Branch: `advisor/004-seo-and-pwa`
- Conventional Commits. Suggested:
  - `feat: add SEO meta tags, Open Graph, and Dentist JSON-LD`
  - `feat: make the site an installable PWA with offline shell`
- Do NOT push or open a PR unless instructed.

## Steps

### Step 1: Fix and expand the `<head>` in `index.html`

Replace the thin meta section. Keep charset, viewport, favicons, GA snippet, and
the Vite entry script exactly as they are. The head should contain, in a sensible
order:

- `<title>DentRW — Dental Clinic in Kigali, Rwanda</title>`
- A real description (150–160 chars), e.g.:
  `<meta name="description" content="DentRW is a dental clinic in Kigali, Rwanda offering check-ups, fillings, root canal treatment, teeth whitening, orthodontics, and implants. Book an appointment online." />`
- `<link rel="canonical" href="https://dentrw.hbapte.com/" />`
- Exactly **one** `<meta name="theme-color" content="#2563eb" />` (brand color;
  remove the `#ffffff` one plan 003 kept).
- Open Graph:

```html
<meta property="og:type" content="website" />
<meta property="og:site_name" content="DentRW" />
<meta property="og:title" content="DentRW — Dental Clinic in Kigali, Rwanda" />
<meta
  property="og:description"
  content="Book a dental appointment online with DentRW — check-ups, fillings, root canal, whitening, orthodontics, and implants in Kigali, Rwanda." />
<meta property="og:url" content="https://dentrw.hbapte.com/" />
<meta property="og:image" content="https://dentrw.hbapte.com/og-image.jpg" />
<meta property="og:locale" content="en_US" />
```

- Twitter card:

```html
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="DentRW — Dental Clinic in Kigali, Rwanda" />
<meta
  name="twitter:description"
  content="Book a dental appointment online with DentRW in Kigali, Rwanda." />
<meta name="twitter:image" content="https://dentrw.hbapte.com/og-image.jpg" />
```

**Verify**: `grep -c "theme-color" index.html` → `1`.
`grep -c 'property="og:' index.html` → `7`.

### Step 2: Add `Dentist` JSON-LD

Add this `<script type="application/ld+json">` block in `<head>`, filled with the
real details from "Current state":

```html
<script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Dentist",
    "name": "DentRW",
    "url": "https://dentrw.hbapte.com/",
    "image": "https://dentrw.hbapte.com/og-image.jpg",
    "telephone": "+250727108418",
    "email": "ijbapte@gmail.com",
    "priceRange": "$$",
    "medicalSpecialty": "Dentistry",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "KG 14 Ave, Remera",
      "addressLocality": "Kigali",
      "addressCountry": "RW"
    },
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        "opens": "06:00",
        "closes": "17:00"
      },
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": "Saturday",
        "opens": "10:00",
        "closes": "16:00"
      }
    ]
  }
</script>
```

**Verify**: extract the JSON between the script tags and run it through
`node -e "JSON.parse(require('fs').readFileSync(0,'utf8'))"` (or
`python -m json.tool`) → exits 0 / pretty-prints. `grep -c 'application/ld.json' index.html` → `1`.

### Step 3: Add a placeholder OG image

Copy the existing screenshot to a root-served path:

```sh
cp src/components/Images/screenshot.jpg public/og-image.jpg
```

(Vite serves `public/` at `/`, so it resolves to `/og-image.jpg` in production.)

**Verify**: `test -f public/og-image.jpg && echo ok` → `ok`.

Note in your PR description: _"OG image is a placeholder (the README screenshot).
A purpose-built 1200×630 image should replace it."_

### Step 4: Fix `public/robots.txt`

Read the current file. Ensure it (a) allows all user agents to crawl and (b)
declares the sitemap. Minimum acceptable content:

```
User-agent: *
Allow: /

Sitemap: https://dentrw.hbapte.com/sitemap.xml
```

If it already allows crawling, just add the `Sitemap:` line if missing. Do not
add `Disallow` rules.

Note: this plan does not generate `sitemap.xml` (a one-page site barely needs
one, and generating it well needs the route list). Declaring it is harmless and
ready for when routing lands. If you want, add a trivial static
`public/sitemap.xml` with just the homepage `<url>` — optional.

**Verify**: `grep -i "sitemap" public/robots.txt` → one match.

### Step 5: Wire up `vite-plugin-pwa`

5a. `bun add -d vite-plugin-pwa`

5b. In `vite.config.js`, import and register the plugin:

```js
import react from "@vitejs/plugin-react"
import { VitePWA } from "vite-plugin-pwa"
import { defineConfig } from "vitest/config"

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: [
        "favicon-16x16.png",
        "favicon-32x32.png",
        "apple-touch-icon.png",
        "safari-pinned-tab.svg",
      ],
      manifest: {
        name: "DentRW — Dental Clinic",
        short_name: "DentRW",
        description:
          "Book a dental appointment online with DentRW in Kigali, Rwanda.",
        theme_color: "#2563eb",
        background_color: "#ffffff",
        display: "standalone",
        start_url: "/",
        icons: [
          {
            src: "/android-chrome-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/android-chrome-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "/android-chrome-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
    }),
  ],
  server: { port: 3000, open: true },
  build: { outDir: "build" },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/setupTests.js",
    css: true,
  },
})
```

(Preserve whatever `test`/`server`/`build` config plan 003 actually left — only
add the plugin.)

5c. In `index.html`, replace the commented-out manifest line with a live one
pointing at the plugin's output:

```html
<link rel="manifest" href="/manifest.webmanifest" />
```

5d. Delete the now-redundant hand-maintained manifests:

```sh
git rm public/manifest.json public/site.webmanifest
```

**Verify**: `bun run build` → exit 0. `ls build/` contains `manifest.webmanifest`
and `sw.js` (or `registerSW.js` + a workbox file). `grep -c "manifest.webmanifest" index.html` → `1`.

### Step 6: Full verification

```
bun install
bun run format
bun run lint
bun run test
bun run build
```

All exit 0.

Then:

```
bun run preview
```

Open the previewed URL and check in DevTools:

- Application → Manifest: shows "DentRW — Dental Clinic", icons load, no errors.
- Application → Service Workers: one registered, activated.
- Elements → `<head>`: exactly one `theme-color`, the OG/Twitter tags present,
  one `ld+json` block.
- View source → copy the `ld+json` content → paste into
  <https://validator.schema.org/> (manual) → no errors, recognized as `Dentist`.

## Test plan

- No new unit tests (this is HTML/config, not component logic). The existing
  Vitest suite must still pass (`bun run test`).
- Manual validation as in Step 6: manifest, service worker, schema validator.
- Add to the PR description: Lighthouse SEO + PWA scores before/after (run
  `bunx lighthouse http://localhost:4173 --only-categories=seo,pwa` against
  `bun run preview`, or use Chrome DevTools Lighthouse).

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `grep -c "theme-color" index.html` is `1`
- [ ] `grep -c 'property="og:' index.html` is `7`; `grep -c 'name="twitter:' index.html` is `4`
- [ ] `grep -c "rel=\"canonical\"" index.html` is `1`
- [ ] `index.html` has one valid `application/ld+json` block that `JSON.parse`s and has `"@type": "Dentist"`
- [ ] `test -f public/og-image.jpg`
- [ ] `public/manifest.json` and `public/site.webmanifest` are deleted
- [ ] `grep -i sitemap public/robots.txt` returns a match
- [ ] `bun run build` exits 0 and `build/` contains `manifest.webmanifest` + a service worker file
- [ ] `bun run test`, `bun run lint`, `bun run format` all exit 0
- [ ] Manifest + service worker verified in DevTools (manual)
- [ ] `git status`: only in-scope files changed
- [ ] `plans/README.md` status row for 004 updated

## STOP conditions

Stop and report back (do not improvise) if:

- There is no root `index.html` / no `vite.config.js` (plan 003 hasn't landed).
- `vite-plugin-pwa` build fails or its API differs materially from the config
  shape above (note the version and the error).
- The service worker aggressively caches and the previewed page won't update
  even on hard-refresh — note it; `registerType: "autoUpdate"` should prevent
  this, but if not, that's worth reporting rather than fighting.
- Removing `public/manifest.json` / `site.webmanifest` breaks a reference you
  find elsewhere (`grep -rn "manifest.json\|site.webmanifest" .` first).

## Maintenance notes

- The OG image is a placeholder. Replacing it with a real 1200×630 asset is a
  one-file follow-up (`public/og-image.jpg`).
- When routing is added (patient portal, blog, service pages), per-route `<title>`
  / `<meta>` / canonical need a real solution (`react-helmet-async` or the
  router's document APIs), and `sitemap.xml` should be generated from the route
  list.
- The JSON-LD lives in static HTML — if the clinic's hours/phone/address change
  in `src/components/Contact.jsx`, update the JSON-LD in `index.html` to match.
  Consider extracting these facts to a shared JSON module in a future refactor
  so there's one source of truth.
- Reviewer should confirm: schema validator passes, the Twitter/OG preview looks
  right (use <https://www.opengraph.xyz/> against a deploy preview), and the PWA
  installs on mobile.
