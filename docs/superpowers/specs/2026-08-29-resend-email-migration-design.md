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

| Question                           | Decision                                                                       |
| ---------------------------------- | ------------------------------------------------------------------------------ |
| Which emails on booking            | Admin notification **and** patient confirmation                                |
| Language for new server/email code | Plain **JS / JSX** — no TypeScript, no `tsconfig` (matches the repo)           |
| Newsletter (ConvertKit)            | Move the call **server-side**, keep ConvertKit as the provider                 |
| Email branding                     | Text wordmark "DentRW" in brand blue `#2563eb` — no logo image                 |
| Spam protection                    | Hidden honeypot field + best-effort in-memory per-IP rate limit                |
| Email localization                 | English only for now (site is EN/FR; localization is a follow-up)              |
| Server hosting                     | Vercel serverless functions in `/api`, logic shared with a Vite dev middleware |

## Approach (chosen: A)

`/api/contact.js` and `/api/subscribe.js` are Vercel serverless functions. The real logic
lives in `api/_lib/` as framework-agnostic `async (body, { ip }) => { status, json }`
functions. Both the Vercel entry files **and** a small Vite `configureServer` plugin call
those same functions, so `bun run dev` keeps serving `/api/*` locally with no extra tooling
and dev/prod run identical logic.

Rejected:

- **`vercel dev` for local** — requires the Vercel CLI, `vercel link`, and a login; changes
  the documented single-command `bun run dev` workflow the CRA→Vite migration worked to keep.
- **Standalone Hono/Express service** — two endpoints do not justify a second deploy
  target, CORS config, and a separate env surface.

## File layout

```
config/
  brand.js                       # name, url, brand blue, clinic phone/email/address/hours
  services.js                    # [{ value, label }] — single source for <select> + email labels
api/
  contact.js                     # Vercel fn: method + body + IP plumbing -> processContact()
  subscribe.js                   # Vercel fn: -> processSubscribe()
  _lib/
    resend.js                    # Resend client + sendEmail() (adapted from the provided sample)
    process-contact.js           # honeypot, validation, compose + send both emails
    process-subscribe.js         # validation + server-side ConvertKit POST
    rate-limit.js                # in-memory best-effort per-IP limiter
    http.js                      # readJsonBody(req), json(res, status, body), clientIp(req)
emails/
  components/EmailLayout.jsx     # wordmark header + footer + Tailwind pixelBasedPreset
  AppointmentRequest.jsx         # -> clinic (ADMIN_EMAIL)
  AppointmentConfirmation.jsx    # -> patient
vite/
  api-plugin.js                  # configureServer middleware, mounts /api/* onto _lib handlers in dev
docs/
  email.md                       # how the email system works + local dev + env
```

`config/` and `api/` are top level (not under `src/`) because they are shared by the client
build and the server functions. Vite resolves imports from the project root fine; oxlint /
prettier already glob `**/*.{js,jsx}`.

## Module contracts

### `api/_lib/resend.js`

Adapted from the provided sample, converted to `.js` and to this project's config module.

```js
import { Resend } from "resend"

import { brand } from "../../config/brand.js"

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = `${process.env.SENDER_NAME ?? brand.name} <${process.env.SENDER_EMAIL ?? "dentrwrw@updates.hbapte.com"}>`
export const ADMIN = process.env.ADMIN_EMAIL ?? "ijbapte@gmail.com"

// sendEmail({ to, subject, react, replyTo }) -> { success, id?, error? }
// passes `react` straight to resend.emails.send; the SDK renders HTML + plain text.
```

- Errors are returned, not thrown (`{ success: false, error }`).
- No top-level throw when `RESEND_API_KEY` is missing — the send call surfaces the error so
  a misconfigured deploy returns a clean 500 rather than crashing the function on import.

### `api/_lib/http.js`

- `readJsonBody(req)` — returns `req.body` if already parsed (Vercel), else reads and
  `JSON.parse`s the stream (Vite dev). Rejects malformed JSON.
- `json(res, status, body)` — sets status + `content-type: application/json` + ends.
- `clientIp(req)` — first entry of `x-forwarded-for`, else `req.socket.remoteAddress`.

### `api/_lib/rate-limit.js`

- `rateLimit(ip, { max, windowMs })` — module-scoped `Map<ip, timestamps[]>`; returns
  `{ ok: boolean }`. Defaults: `max: 5`, `windowMs: 60_000`.
- **Known limitation:** serverless instances are ephemeral and not shared, so the window
  resets on cold starts and does not coordinate across concurrent instances. This is
  best-effort bot friction, not a hard quota. Documented in `docs/email.md`.

### `api/_lib/process-contact.js`

`processContact(body, { ip }) -> { status, json }`

1. `body.company` (honeypot) non-empty → `{ status: 200, json: { ok: true } }`, send nothing.
2. `rateLimit(ip)` not ok → `{ status: 429, json: { error: "Too many requests…" } }`.
3. Validate: `user_name` and `user_email` required, `user_email` matches a basic email
   regex. Missing/invalid → `{ status: 400, json: { error } }`.
4. `serviceLabel = services.find(s => s.value === body.chosen_service)?.label ?? body.chosen_service ?? "—"`.
5. `sendEmail` **AppointmentRequest** → `ADMIN`, `replyTo: user_email`.
   Not `success` → `{ status: 500, json: { error: "…" } }` (nothing was delivered).
6. `sendEmail` **AppointmentConfirmation** → `user_email`. Not `success` → log a warning,
   continue.
7. `{ status: 200, json: { ok: true } }`.

Fields consumed: `user_name`, `user_email`, `user_phone`, `chosen_service`, `user_date`,
`user_time`, `user_message`, `company` (honeypot). Field names are unchanged from the
current form to keep the diff focused.

### `api/_lib/process-subscribe.js`

`processSubscribe(body, { ip }) -> { status, json }`

1. `rateLimit(ip)` not ok → `429`.
2. `body.email` required + basic email regex → else `400`.
3. `POST https://api.convertkit.com/v3/forms/${CONVERTKIT_FORM_ID}/subscribe` with
   `{ api_key: CONVERTKIT_API_KEY, email }` via `fetch`.
4. ConvertKit non-2xx → `502` with a generic message (detail logged).
5. `{ status: 200, json: { ok: true } }`.

### `api/contact.js` / `api/subscribe.js`

```js
import { clientIp, json, readJsonBody } from "./_lib/http.js"
import { processContact } from "./_lib/process-contact.js"

export default async function handler(req, res) {
  if (req.method !== "POST")
    return json(res, 405, { error: "Method not allowed" })
  let body
  try {
    body = await readJsonBody(req)
  } catch {
    return json(res, 400, { error: "Invalid JSON" })
  }
  const { status, json: payload } = await processContact(body, {
    ip: clientIp(req),
  })
  return json(res, status, payload)
}
```

### `vite/api-plugin.js`

```js
// apiDevPlugin() -> Vite plugin
// configureServer(server): server.middlewares.use(async (req, res, next) => {
//   route /api/contact -> processContact, /api/subscribe -> processSubscribe, else next()
//   reuse readJsonBody / json / clientIp
// })
```

Added to `vite.config.mjs` `plugins` array.

## Client changes

### `src/components/Contact.jsx`

- Remove `import emailjs from "@emailjs/browser"` and the `form` ref usage for EmailJS.
- `sendEmail` handler:
  ```js
  const data = Object.fromEntries(new FormData(e.currentTarget))
  const res = await fetch("/api/contact", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error()
  ```
  Keep the existing `isLoading` / `isSent` / `error` state and the 5s / 8s timeouts.
  On success `e.currentTarget.reset()`.
- Add the honeypot inside the form:
  ```jsx
  <input
    type="text"
    name="company"
    tabIndex={-1}
    autoComplete="off"
    className="hidden"
    aria-hidden="true"
    defaultValue=""
  />
  ```
- Render the service `<select>` options from `config/services.js` via `.map`.

### `src/components/Footer.jsx`

- Remove `import axios from "axios"` (check no other axios use in the file — there is none).
- `handleSubmit` posts to `/api/subscribe` with `fetch`, JSON body `{ email }`.
- Keep the existing `loading` / `subscribed` / `errorMessage` UX and timeouts.
- Drop the `VITE_CONVERTKIT_*` reads.

Note: `axios` stays a dependency — it is still used by other components; only the Footer's
usage is removed. (Verify with a repo-wide `axios` grep during implementation.)

## Email templates

- `react-email` components, `<Tailwind>` with `pixelBasedPreset`, `<Head />` inside
  `<Tailwind>`, `<Preview>` first inside `<Body>`, container ~600px.
- `EmailLayout.jsx` — props `{ preview, children }`. Header: "DentRW" as bold text in
  `#2563eb`. Footer: clinic phone, email, address (`KG 14 Ave - Remera, Rwanda`), all from
  `config/brand.js`. No `<Img>`, no SVG.
- **AppointmentRequest.jsx** — props `{ name, email, phone, service, date, time, message }`.
  Heading "New appointment request". A `<Section>` with label/value rows. Body text notes
  the reply-to goes to the patient.
- **AppointmentConfirmation.jsx** — props `{ name, service, date, time }`. Heading
  "We received your request". Restates service / date / time, clinic hours + phone, and
  that the clinic will reach out to confirm.
- Each exports `PreviewProps` with realistic sample data for `email dev`.

## Config modules

### `config/brand.js`

```js
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

### `config/services.js`

```js
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
```

Values are copied verbatim from the current `Contact.jsx` `<select>` so existing behavior is
unchanged.

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

`.env.example` and `.env.local` are updated to match. The six vars above must be added in the
Vercel project dashboard before the branch is merged.

## Dependencies

- **add** `resend`, `@react-email/components`
- **add dev** `react-email` (the `email` CLI), `@react-email/render` (assertions in tests)
- **remove** `@emailjs/browser`
- new script: `"email": "email dev --dir emails --port 3001"` (3000 is Vite's)
- `knip` config: add `api/**`, `emails/**`, `vite/**` as entry patterns so the new
  entrypoints are not reported as unused

## Testing (vitest)

| file                                      | asserts                                                                                                                                                                                                                                                           |
| ----------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `api/_lib/process-contact.test.js`        | honeypot → 200 + no send; missing `user_name`/`user_email` → 400; bad email → 400; valid → `sendEmail` called twice with expected `to` + `subject`; `chosen_service` slug mapped to label; patient-send failure still returns 200; admin-send failure returns 500 |
| `api/_lib/process-subscribe.test.js`      | mocked `fetch`; correct ConvertKit URL + payload; missing/bad email → 400; ConvertKit failure → 502                                                                                                                                                               |
| `api/_lib/rate-limit.test.js`             | `max` calls ok, next blocked, window resets after `windowMs`                                                                                                                                                                                                      |
| `emails/AppointmentConfirmation.test.jsx` | `render()` HTML contains patient name + service label                                                                                                                                                                                                             |

`sendEmail` and `fetch` are mocked with `vi.mock` / `vi.stubGlobal`. Vitest's default
`include` already picks up `api/**/*.test.js` and `emails/**/*.test.jsx`.

## Rollout / build order

1. deps + `config/brand.js` + `config/services.js`; render `Contact.jsx` `<select>` from
   `services` (no behavior change).
2. `api/_lib/*` (http, resend, rate-limit) + unit tests for rate-limit.
3. email templates + `EmailLayout` + `email` script; eyeball in `bun run email`.
4. `process-contact.js` + `api/contact.js` + `vite/api-plugin.js` wired into `vite.config.mjs`
   - tests.
5. `process-subscribe.js` + `api/subscribe.js` + tests.
6. rewire `src/components/Contact.jsx` (fetch + honeypot), then `src/components/Footer.jsx`
   (fetch).
7. remove `@emailjs/browser` + `VITE_EMAILJS_*`; update `.env.example`, `.env.local`,
   `README.md` (Features / Tech Stack / Environment Variables), add `docs/email.md`,
   update `knip` config.
8. verify: `bun run format` · `bun run lint` · `bun run test` · `bun run build`; manual
   `bun run dev` booking submit against a real Resend test key; `bun run email` preview.
9. **before merge:** add the six env vars in Vercel; confirm `updates.hbapte.com` is a
   verified domain in Resend.

## Risks

- **Resend domain not verified** → production sends fail. Pre-merge checklist item.
- **Rate limit resets on cold start** → accepted; it is bot friction, not a quota.
- **Vercel `/api` auto-detection** → Vercel deploys `/api/*.js` as functions for a Vite
  project with no `vercel.json` needed (consistent with the notes from the CRA→Vite
  migration). If a future Vercel change breaks this, add a minimal `vercel.json`.
- **Function bundle size** → import `render`-only paths from `@react-email/components` /
  `@react-email/render`; keep the `react-email` CLI package a devDependency so chokidar
  etc. are not traced into the function.
- **`config/` imported across the client/server boundary** → keep those modules pure data
  (no `import.meta`, no JSX, no Node built-ins).

## Out of scope

- Localizing emails to French.
- Replacing ConvertKit with Resend Audiences.
- CAPTCHA / Turnstile.
- Any change to Typebot or Google Analytics.
- Persisting bookings to a database.
