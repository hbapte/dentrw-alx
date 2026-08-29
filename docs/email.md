# Email

Appointment emails go through **Resend** with **React Email** templates. The newsletter
signup calls **ConvertKit** server-side.

## How it works

- `POST /api/contact` — `src/components/Contact.jsx` submits the booking form here. The
  handler (`api/_lib/process-contact.ts`) drops honeypot submissions, rate-limits by IP,
  validates, then sends two emails: an **AppointmentRequest** to `ADMIN_EMAIL` (reply-to =
  the patient) and an **AppointmentConfirmation** to the patient.
- `POST /api/subscribe` — `src/components/Footer.jsx` submits the newsletter form here. The
  handler (`api/_lib/process-subscribe.ts`) validates the email and forwards it to the
  ConvertKit form subscribe endpoint using `CONVERTKIT_API_KEY` (never exposed to the
  browser).

Each `/api/*.ts` file is a thin Vercel function wrapper. The logic lives in `api/_lib/` as
pure `processX(body, { ip })` functions. In `bun run dev`, `vite/api-plugin.mjs` mounts the
same functions at `/api/*` via `server.ssrLoadModule` — dev and prod run identical code.

### Why `.ts` / `.tsx`

Vercel's serverless bundler (`@vercel/node`) compiles `.ts` / `.tsx` files but copies
`.jsx` raw, so a JSX React Email template imported by a function would crash at runtime.
`api/`, `emails/`, and `config/` are therefore `.ts` / `.tsx` with a build-only
`tsconfig.json` (`jsx: "react-jsx"`). No type annotations, no `tsc` step in CI —
everything in `src/` stays `.jsx`.

## Templates

Templates live in `emails/`. Preview them with:

```bash
bun run email   # react-email dev server on http://localhost:3001
```

To add a template: create `emails/MyEmail.tsx` exporting a component plus
`MyEmail.PreviewProps`, then `createElement(MyEmail, props)` in a handler and pass it as
`react` to `sendEmail`.

## Environment variables

Server-side only — no `VITE_` prefix, so never bundled into the client. Set them in
`.env.local` for dev and in the Vercel project settings for production:

| var                  | notes                                                         |
| -------------------- | ------------------------------------------------------------- |
| `RESEND_API_KEY`     | from the [Resend dashboard](https://resend.com/api-keys)      |
| `SENDER_EMAIL`       | the `from` address; its domain must be **verified** in Resend |
| `SENDER_NAME`        | display name on the `from` address                            |
| `ADMIN_EMAIL`        | where appointment notifications are delivered                 |
| `CONVERTKIT_API_KEY` | ConvertKit / Kit API key                                      |
| `CONVERTKIT_FORM_ID` | the form subscribers are added to                             |

## Known limitation

The rate limiter (`api/_lib/rate-limit.ts`) is in-memory per serverless instance. It resets
on cold starts and does not coordinate across concurrent instances — it is bot friction,
not a hard quota.
