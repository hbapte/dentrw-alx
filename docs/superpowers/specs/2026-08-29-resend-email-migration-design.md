# Resend + React Email migration — design

**Date:** 2026-08-29
**Status:** Approved (design)
**Branch:** `advisor/resend-email-migration`

## Problem

The appointment form (`src/components/Contact.jsx`) sends email from the browser via
`@emailjs/browser` (`emailjs.sendForm`). The newsletter form (`src/components/Footer.jsx`)
posts directly to the ConvertKit API from the browser with `VITE_CONVERTKIT_API_KEY`
bundled into the client.

We want to move appointment email to **Resend** with **React Email** templates. Resend's
API key is a secret and cannot be called from the browser, so this requires introducing
server-side code — which the project (a client-only Vite SPA on Vercel) does not have today.

## Decisions

| Question                               | Decision                                                                                                                             |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Which emails on booking                | Admin notification **and** patient confirmation                                                                                      |
| Language for the new server/email code | **`.ts` / `.tsx`** for `api/`, `emails/`, `config/` only — no type annotations, no CI type-check. Everything in `src/` stays `.jsx`. |
| Newsletter (ConvertKit)                | Move the call **server-side**, keep ConvertKit as the provider                                                                       |
| Email branding                         | Text wordmark "DentRW" in brand blue `#2563eb` — no logo image                                                                       |
| Spam protection                        | Hidden honeypot field + best-effort in-memory per-IP rate limit                                                                      |
| Email localization                     | English only for now (site is EN/FR; localization is a follow-up)                                                                    |
| Server hosting                         | Vercel serverless functions in `/api`, logic shared with a Vite dev middleware                                                       |

### Why a TS surface

Vercel's serverless bundler (`@vercel/node`) compiles imported `.ts` / `.tsx` files but
copies `.jsx` files **raw** — a `.jsx` React Email template imported by an `/api` function
would crash at runtime (Node cannot parse JSX). The transform also needs a `tsconfig.json`
with `jsx: "react-jsx"`. So the email/API layer must be `.ts` / `.tsx`.

This is **not** a TypeScript adoption: the files carry no type annotations (they are the
same JS with an `x`/`ts` extension), the repo's existing `typescript` + `@types/node`
devDependencies already cover it, and **no `tsc` / type-check step is added to any npm
script or to CI**. The added `tsconfig.json` is a build-tool hint consumed by Vercel's
bundler, Vite/esbuild, and editors — nothing runs it.

## Approach (chosen: A)

`/api/contact.ts` and `/api/subscribe.ts` are Vercel serverless functions. The real logic
lives in `api/_lib/` as framework-agnostic `async (body, { ip }) => { status, json }`
functions. Both the Vercel entry files **and** a small Vite `configureServer` plugin call
those same functions, so `bun run dev` keeps serving `/api/*` locally with no extra tooling
and dev/prod run identical logic.

Rejected:

- **`vercel dev` for local** — requires the Vercel CLI, `vercel link`, and a login; changes
  the documented single-command `bun run dev` workflow the CRA→Vite migration worked to keep.
- **Standalone Hono/Express service** — two endpoints do not justify a second deploy
  target, CORS config, and a separate env surface.
- **`.jsx` templates + a prebuild esbuild step** — makes dev import source while prod
  imports compiled output, plus a build script to maintain.
- **`.js` templates with `React.createElement`** — portable but verbose and inconsistent
  with how the rest of the repo writes components.

## File layout

```text
tsconfig.json                    # build-only: jsx + module resolution for the TS surface
config/
  brand.ts                       # name, url, brand blue, clinic phone/email/address/hours
  services.ts                    # [{ value, label }] — single source for <select> + email labels
api/
  contact.ts                     # Vercel fn: method + body + IP plumbing -> processContact()
  subscribe.ts                   # Vercel fn: -> processSubscribe()
  _lib/
    resend.ts                    # Resend client + sendEmail() (adapted from the provided sample)
    process-contact.ts           # honeypot, validation, compose + send both emails
    process-subscribe.ts         # validation + server-side ConvertKit POST
    rate-limit.ts                # in-memory best-effort per-IP limiter
    http.ts                      # readJsonBody(req), sendJson(res, status, body), clientIp(req)
    process-contact.test.ts
    process-subscribe.test.ts
    rate-limit.test.ts
emails/
  components/EmailLayout.tsx     # wordmark header + footer + Tailwind pixelBasedPreset
  AppointmentRequest.tsx         # -> clinic (ADMIN_EMAIL)
  AppointmentConfirmation.tsx    # -> patient
  AppointmentConfirmation.test.tsx
vite/
  api-plugin.mjs                 # configureServer middleware, mounts /api/* onto _lib handlers in dev
docs/
  email.md                       # how the email system works + local dev + env
```

- `config/` and `api/` are top level (not under `src/`) because both the client build and
  the server functions import them.
- **Relative imports inside `api/`, `emails/`, `config/` use an explicit `.js` suffix**
  (`import { sendJson } from "./http.js"` from a `.ts` file). This is the `NodeNext`
  convention: TS resolves `.js` → the `.ts`/`.tsx` source, and the name Vercel emits and
  Node runs at runtime is `.js`. Vite/esbuild resolve it too.
- `vite/api-plugin.mjs` is `.mjs` (ESM) — it is only ever loaded by Vite's config, and it
  uses `server.ssrLoadModule` (below) so it needs no compilation of its own. (`.mjs` rather
  than `.js` because the repo has no `"type": "module"`; a `.js` here triggers a Vite
  config-loader warning.)

## `tsconfig.json`

```json
{
  "compilerOptions": {
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "jsx": "react-jsx",
    "allowJs": true,
    "checkJs": false,
    "noEmit": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "isolatedModules": true
  },
  "include": ["api", "emails", "config"]
}
```

Deliberately minimal: `module` / `moduleResolution` do not affect Vite/esbuild transforms,
so the client build is unchanged, and `jsx: "react-jsx"` already matches
`@vitejs/plugin-react`. Not referenced by any script — `bun run build` stays `vite build`;
CI stays `format` / `lint` / `test` / `build`. Vercel's `@vercel/node` compiles the
functions to CommonJS (a `.ts` entrypoint with no `"type": "module"`), which the plain
`import` / `export` source emits to cleanly.

## Module contracts

### `config/brand.ts`

```ts
export const brand = {
  name: "DentRW",
  url: "https://dentrw.hbapte.com",
  blue: "#2563eb",
  phone: "+250727108418",
  email: "ijbapte@gmail.com",
  address: "KG 14 Ave - Remera, Rwanda",
  hours: [
    "Monday - Friday: 06:00 - 17:00",
    "Saturday: 10:00 - 16:00",
    "Sunday: Closed",
  ],
}
```

### `config/services.ts`

```ts
export const services = [
  { value: "checkup_Consultation", label: "Dental Check-ups and Consultation" },
  { value: "x-rays", label: "X-rays" },
  { value: "fillings", label: "Fillings" },
  { value: "crowns_Bridges", label: "Crowns and Bridges" },
  { value: "RCT", label: "Root Canal Treatment" },
  { value: "teethWhitening", label: "Cleaning and Teeth Whitening" },
  { value: "orthodontic", label: "Orthodontic Treatment" },
  { value: "periodontal", label: "Periodontal Treatment" },
  { value: "dentalImplants", label: "Dental Implants" },
]

export function serviceLabel(value) {
  return services.find((s) => s.value === value)?.label ?? value ?? "—"
}
```

Values copied verbatim from the current `Contact.jsx` `<select>` so behavior is unchanged.

### `api/_lib/resend.ts`

Adapted from the provided sample.

```ts
import { Resend } from "resend"

import { brand } from "../../config/brand.js"

const resend = new Resend(process.env.RESEND_API_KEY)
const senderName = process.env.SENDER_NAME ?? brand.name
const senderEmail = process.env.SENDER_EMAIL ?? "dentrwrw@updates.hbapte.com"
const FROM = `${senderName} <${senderEmail}>`

export const ADMIN = process.env.ADMIN_EMAIL ?? "ijbapte@gmail.com"

// sendEmail({ to, subject, react, replyTo }) -> { success, id?, error? }
// `react` is passed straight to resend.emails.send; the SDK renders HTML + plain text.
```

- Errors are returned, not thrown (`{ success: false, error }`).
- No top-level throw when `RESEND_API_KEY` is missing — the send call surfaces the error so
  a misconfigured deploy returns a clean 500 instead of crashing on import.

### `api/_lib/http.ts`

- `readJsonBody(req)` — returns `req.body` if already an object (Vercel pre-parses JSON),
  else reads the stream and `JSON.parse`s it (Vite dev). Throws on malformed JSON.
- `sendJson(res, status, body)` — sets status + `content-type: application/json`, ends.
- `clientIp(req)` — first entry of `x-forwarded-for`, else `req.socket?.remoteAddress ?? ""`.

### `api/_lib/rate-limit.ts`

- `rateLimit(key, { max = 5, windowMs = 60_000 } = {})` — module-scoped
  `Map<string, number[]>` of timestamps; prunes entries older than `windowMs`; returns
  `{ ok: boolean }`. `key` is `"<route>:<ip>"`.
- **Known limitation:** serverless instances are ephemeral and not shared, so the window
  resets on cold starts and does not coordinate across concurrent instances. Best-effort
  bot friction, not a hard quota. Stated in `docs/email.md`.

### `api/_lib/process-contact.ts`

`processContact(body, { ip }) -> { status, json }`

1. `body.company` (honeypot) non-empty → `{ status: 200, json: { ok: true } }`, send nothing.
2. `rateLimit("contact:" + ip)` not ok → `{ status: 429, json: { error: "Too many requests. Please try again in a minute." } }`.
3. Validate: `user_name` non-empty, `user_email` matches `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`.
   Fail → `{ status: 400, json: { error: "Please provide your name and a valid email." } }`.
4. `label = serviceLabel(body.chosen_service)`.
5. `sendEmail` **AppointmentRequest** → `ADMIN`, `replyTo: body.user_email`.
   Not `success` → `{ status: 500, json: { error: "Could not send your request. Please try again later." } }` (nothing delivered).
6. `sendEmail` **AppointmentConfirmation** → `body.user_email`. Not `success` →
   `console.warn` and continue.
7. `{ status: 200, json: { ok: true } }`.

Fields consumed: `user_name`, `user_email`, `user_phone`, `chosen_service`, `user_date`,
`user_time`, `user_message`, `company` (honeypot). Field names unchanged from the current
form to keep the diff focused.

### `api/_lib/process-subscribe.ts`

`processSubscribe(body, { ip }) -> { status, json }`

1. `rateLimit("subscribe:" + ip)` not ok → `429`.
2. `body.email` matches the email regex → else `{ status: 400, json: { error: "Please provide a valid email." } }`.
3. `POST https://api.convertkit.com/v3/forms/${process.env.CONVERTKIT_FORM_ID}/subscribe`
   with JSON `{ api_key: process.env.CONVERTKIT_API_KEY, email: body.email }` via `fetch`.
4. Response not ok → `console.error` the detail, return
   `{ status: 502, json: { error: "Subscription service is unavailable. Please try again later." } }`.
5. `{ status: 200, json: { ok: true } }`.

### `api/contact.ts` / `api/subscribe.ts`

```ts
import { clientIp, readJsonBody, sendJson } from "./_lib/http.js"
import { processContact } from "./_lib/process-contact.js"

export default async function handler(req, res) {
  if (req.method !== "POST")
    return sendJson(res, 405, { error: "Method not allowed" })
  let body
  try {
    body = await readJsonBody(req)
  } catch {
    return sendJson(res, 400, { error: "Invalid JSON" })
  }
  const { status, json } = await processContact(body, { ip: clientIp(req) })
  return sendJson(res, status, json)
}
```

`subscribe.ts` is identical with `processSubscribe`.

### `vite/api-plugin.mjs`

```js
// apiDevPlugin() -> Vite plugin
// configureServer(server) {
//   server.middlewares.use(async (req, res, next) => {
//     const url = (req.url || "").split("?")[0]
//     const route = { "/api/contact": "process-contact", "/api/subscribe": "process-subscribe" }[url]
//     if (!route || req.method !== "POST") return next()
//     const { processContact, processSubscribe } = await server.ssrLoadModule(`/api/_lib/${route}.ts`)
//     ... readJsonBody(req) via ssrLoadModule("/api/_lib/http.ts"), pick handler, sendJson
//   })
// }
```

Loading handlers through `server.ssrLoadModule` means Vite transpiles the `.ts`/`.tsx`
chain (including the email templates) on demand — the plugin itself needs no build step.
Added to `vite.config.mjs` `plugins` after `react()`.

## Client changes

### `src/components/Contact.jsx`

- Remove `import emailjs from "@emailjs/browser"`. Drop the `form` ref (use `e.currentTarget`).
- `sendEmail` handler body:
  ```js
  const data = Object.fromEntries(new FormData(e.currentTarget))
  const res = await fetch("/api/contact", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error()
  ```
  Keep the `isLoading` / `isSent` / `error` state and the 5s / 8s timeouts. On success
  `e.currentTarget.reset()`.
- Add the honeypot inside the form:
  ```jsx
  <input
    type="text"
    name="company"
    tabIndex={-1}
    autoComplete="off"
    aria-hidden="true"
    className="hidden"
    defaultValue=""
  />
  ```
- Render the service `<select>` options from `config/services.ts` via `.map`.

### `src/components/Footer.jsx`

- Remove `import axios from "axios"` (no other axios use in this file).
- `handleSubmit` posts to `/api/subscribe` with `fetch`, JSON body `{ email }`; keep the
  existing `loading` / `subscribed` / `errorMessage` UX and timeouts.
- Drop the `VITE_CONVERTKIT_*` reads.

**As-built:** the Footer was the only `axios` consumer in the repo, so `axios` was removed
from `package.json` in the same step that drops `@emailjs/browser`.

## Email templates

- `@react-email/components`, `<Tailwind>` with `pixelBasedPreset`, `<Head />` inside
  `<Tailwind>`, `<Preview>` first inside `<Body>`, container ~600px, no images.
- `EmailLayout.tsx` — props `{ preview, children }`. Header: "DentRW" bold text in
  `#2563eb`. Footer: clinic phone, email, address from `config/brand.ts`.
- **AppointmentRequest.tsx** — props `{ name, email, phone, service, date, time, message }`.
  "New appointment request" + a `<Section>` of label/value rows.
- **AppointmentConfirmation.tsx** — props `{ name, service, date, time }`. "We received
  your request" + restates service/date/time, clinic hours + phone, "the clinic will
  contact you to confirm".
- Each exports `PreviewProps` with realistic sample data for `bun run email`.

## Environment variables

All server-side — **no `VITE_` prefix**, so never bundled into the client.

| var                  | default in code               | notes                                                                  |
| -------------------- | ----------------------------- | ---------------------------------------------------------------------- |
| `RESEND_API_KEY`     | —                             | already in `.env.local`; **rotate** — it was exposed in a chat session |
| `SENDER_EMAIL`       | `dentrwrw@updates.hbapte.com` | domain must be verified in Resend                                      |
| `SENDER_NAME`        | `DentRW`                      |                                                                        |
| `ADMIN_EMAIL`        | `ijbapte@gmail.com`           | booking notifications land here                                        |
| `CONVERTKIT_API_KEY` | —                             | renamed from `VITE_CONVERTKIT_API_KEY`                                 |
| `CONVERTKIT_FORM_ID` | —                             | renamed from `VITE_CONVERTKIT_FORM_ID`                                 |

Removed: `VITE_EMAILJS_SERVICE_ID`, `VITE_EMAILJS_TEMPLATE_ID`, `VITE_EMAILJS_PUBLIC_KEY`.

`.env.example` updated to match (committed). `.env.local` is the developer's own file —
set the same six vars there for local dev. The six vars must also be added in the Vercel
project dashboard before the branch is merged.

## Dependencies

- **add** `resend`, `@react-email/components`
- **add dev** `react-email` (the `email` CLI)
- **remove** `@emailjs/browser`, and `axios` (as-built — it was already dead after the
  Footer change)
- already present, reused: `typescript`, `@types/node`, `react`, `react-dom`
- `render` for tests is imported from `@react-email/components` (it re-exports
  `@react-email/render`) — no separate dep
- new script: `"email": "email dev --dir emails --port 3001"` (3000 is Vite's)
- `knip.json` (as-built): `entry` = `api/**/*.ts`, `emails/**/*.tsx`, `vite/api-plugin.mjs`;
  `ignoreDependencies` = `["@react-email/ui"]` (a phantom import knip finds inside
  `@react-email/components`). Pre-existing knip findings (`Sign.jsx`,
  `baseline-browser-mapping`, `caniuse-lite`, `@tailwindcss/forms`) are untouched.

## Testing (vitest)

| file                                      | asserts                                                                                                                                                                                                                                                                                                                                 |
| ----------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `api/_lib/rate-limit.test.ts`             | `max` calls `ok`, next blocked; after `windowMs` (fake timers) `ok` again; different keys independent                                                                                                                                                                                                                                   |
| `api/_lib/process-contact.test.ts`        | `vi.mock("./resend.js")`: honeypot → 200 + `sendEmail` not called; missing name → 400; bad email → 400; valid → `sendEmail` called twice with `to` = `ADMIN` then the patient, subjects as specified; `chosen_service` slug → label in the props; admin send `{success:false}` → 500; patient send `{success:false}` but admin ok → 200 |
| `api/_lib/process-subscribe.test.ts`      | `vi.stubGlobal("fetch", …)`: bad email → 400, no fetch; valid → fetch called with the ConvertKit URL containing `CONVERTKIT_FORM_ID` and body `{ api_key, email }`; fetch resolves `{ ok: false }` → 502                                                                                                                                |
| `emails/AppointmentConfirmation.test.tsx` | `render(<AppointmentConfirmation {...PreviewProps} />)` HTML contains the patient name and the service label                                                                                                                                                                                                                            |

`process-*` tests set `process.env` values in a `beforeEach`. Vitest's default `include`
already matches `api/**/*.test.ts` and `emails/**/*.test.tsx`; `vite.config.mjs` `test`
block is unchanged.

## Rollout / build order

1. `tsconfig.json`; deps (`resend`, `@react-email/components`, dev `react-email`); remove
   `@emailjs/browser`; `email` script; `config/brand.ts` + `config/services.ts`; render
   `Contact.jsx` `<select>` from `services` (no behavior change). Commit.
2. `api/_lib/http.ts` + `api/_lib/rate-limit.ts` + `rate-limit.test.ts`. Commit.
3. `api/_lib/resend.ts`; `emails/components/EmailLayout.tsx`; `emails/AppointmentRequest.tsx`;
   `emails/AppointmentConfirmation.tsx` + its test; eyeball with `bun run email`. Commit.
4. `api/_lib/process-contact.ts` + test; `api/contact.ts`; `vite/api-plugin.js` wired into
   `vite.config.mjs`; manual `bun run dev` submit. Commit.
5. `api/_lib/process-subscribe.ts` + test; `api/subscribe.ts`. Commit.
6. Rewire `src/components/Contact.jsx` (fetch + honeypot); then `src/components/Footer.jsx`
   (fetch). Manual `bun run dev` check of both forms. Commit.
7. `.env.example`, `.env.local`, `README.md` (Features / Tech Stack / Environment
   Variables), `docs/email.md`, `knip.json`, `tailwind.config.js` `content` glob. Commit.
8. Full verify: `bun run format` · `bun run lint` · `bun run test` · `bun run build` ·
   `bun run knip`.
9. **Before merge:** add the six env vars in Vercel; confirm `updates.hbapte.com` is a
   verified domain in Resend; deploy the branch preview and submit a real test booking.

## Risks

- **Resend domain not verified** → production sends fail. Pre-merge checklist item.
- **Rate limit resets on cold start** → accepted; bot friction, not a quota.
- **Vercel `/api` auto-detection** → Vercel deploys `/api/*.ts` as functions for a Vite
  project with no `vercel.json` needed. If a future platform change breaks this, add a
  minimal `vercel.json`.
- **`typescript` v7 in the repo** → `@vercel/node` resolves the project's `typescript` to
  compile the functions. If v7's compiler API diverges, pin a known-good `typescript` in
  devDependencies or add `vercel.json` `installCommand`. Verified working at preview-deploy
  time in step 9.
- **`config/` imported across the client/server boundary** → keep those modules pure data
  (no `import.meta`, no JSX, no Node built-ins).
- **Function bundle size** → keep the `react-email` CLI a devDependency so chokidar etc.
  are not traced into the deployed function; runtime imports come only from
  `@react-email/components`.

## Out of scope

- Localizing emails to French.
- Replacing ConvertKit with Resend Audiences.
- CAPTCHA / Turnstile.
- Any change to Typebot or Google Analytics.
- Persisting bookings to a database.
