# Resend + React Email Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace browser-side EmailJS with server-side Resend + React Email templates for the appointment form, and move the newsletter's ConvertKit call server-side, via Vercel serverless functions that also run under `bun run dev`.

**Architecture:** New top-level `api/` (Vercel functions), `emails/` (React Email templates), and `config/` (shared data) directories, all `.ts`/`.tsx`. Each `/api/*.ts` function is a thin HTTP wrapper around a pure `processX(body, { ip })` handler in `api/_lib/`. A Vite `configureServer` plugin mounts the same handlers at `/api/*` in dev via `server.ssrLoadModule`, so dev and prod run identical logic. Everything in `src/` stays `.jsx`.

**Tech Stack:** Vite 8, React 19, Vitest 4, `resend`, `@react-email/components`, `react-email` (CLI, dev only), bun. Design spec: `docs/superpowers/specs/2026-08-29-resend-email-migration-design.md`.

---

## Conventions for every task

- Branch is `advisor/resend-email-migration` (already created). Do not switch branches.
- Run a single test file with: `bunx vitest run <path>`
- Run all tests with: `bun run test`
- Commit messages are Conventional Commits (`feat:`, `test:`, `chore:`, `docs:`, `refactor:`).
- The pre-commit hook runs `lint-staged` (`prettier --write` + `oxlint --fix` on staged files). Let it reformat; re-stage if it does.
- **Relative imports inside `api/`, `emails/`, `config/` always use a `.js` suffix** even though the source file is `.ts`/`.tsx` (NodeNext convention — TS resolves `.js` → the real source, and `.js` is what Vercel emits and Node runs).
- Never write JSX in a `.ts` file. `api/_lib/process-contact.ts` builds elements with `createElement`, not JSX.
- Do not commit `.env.local` (gitignored).

---

## Task 1: Scaffold — tsconfig, dependencies, shared config

**Files:**

- Create: `tsconfig.json`
- Create: `config/brand.ts`
- Create: `config/services.ts`
- Modify: `package.json` (dependencies + `email` script)
- Modify: `bun.lock` (via `bun add`)

- [ ] **Step 1: Add dependencies**

Run:

```bash
bun add resend @react-email/components
bun add -d react-email
```

Expected: `package.json` gains `resend` and `@react-email/components` under `dependencies`, `react-email` under `devDependencies`; `bun.lock` updates.

- [ ] **Step 2: Add the `email` preview script**

In `package.json` `"scripts"`, add after `"knip": "knip"`:

```json
    "email": "email dev --dir emails --port 3001"
```

- [ ] **Step 3: Create `tsconfig.json`**

Deliberately minimal — `module`/`moduleResolution` do not affect Vite/esbuild transforms
(so the client build is unchanged), and `jsx: "react-jsx"` already matches what
`@vitejs/plugin-react` does. Vercel's `@vercel/node` layers its own defaults on top.

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

- [ ] **Step 4: Create `config/brand.ts`**

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

- [ ] **Step 5: Create `config/services.ts`**

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

- [ ] **Step 6: Verify the build still passes**

Run: `bun run build`
Expected: PASS — `dist/` is produced, no errors. (The new `tsconfig.json` only affects `jsx`/`target`, which already match `@vitejs/plugin-react`.)

- [ ] **Step 7: Verify lint + format**

Run: `bun run lint && bun run format`
Expected: PASS. If `format` fails, run `bun run format:fix` and re-check.

- [ ] **Step 8: Commit**

```bash
git add tsconfig.json config/ package.json bun.lock
git commit -m "chore: add resend, react-email deps and shared config"
```

---

## Task 2: `api/_lib/validate.ts` — email validation helper

**Files:**

- Create: `api/_lib/validate.ts`
- Test: `api/_lib/validate.test.ts`

- [ ] **Step 1: Write the failing test**

`api/_lib/validate.test.ts`:

```ts
import { describe, expect, it } from "vitest"

import { isEmail } from "./validate.js"

describe("isEmail", () => {
  it("accepts a normal address", () => {
    expect(isEmail("amara@example.com")).toBe(true)
    expect(isEmail("  a@b.co  ")).toBe(true)
  })

  it("rejects malformed or non-string input", () => {
    expect(isEmail("nope")).toBe(false)
    expect(isEmail("a@b")).toBe(false)
    expect(isEmail("")).toBe(false)
    expect(isEmail(null)).toBe(false)
    expect(isEmail(undefined)).toBe(false)
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `bunx vitest run api/_lib/validate.test.ts`
Expected: FAIL — `Cannot find module './validate.js'`.

- [ ] **Step 3: Write the implementation**

`api/_lib/validate.ts`:

```ts
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function isEmail(value) {
  return typeof value === "string" && EMAIL_RE.test(value.trim())
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `bunx vitest run api/_lib/validate.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add api/_lib/validate.ts api/_lib/validate.test.ts
git commit -m "feat: add isEmail validation helper"
```

---

## Task 3: `api/_lib/http.ts` — request/response plumbing

**Files:**

- Create: `api/_lib/http.ts`
- Test: `api/_lib/http.test.ts`

- [ ] **Step 1: Write the failing test**

`api/_lib/http.test.ts`:

```ts
import { Readable } from "node:stream"
import { describe, expect, it, vi } from "vitest"

import { clientIp, readJsonBody, sendJson } from "./http.js"

const streamOf = (s) => Readable.from([Buffer.from(s)])

describe("readJsonBody", () => {
  it("returns req.body when it is already an object", async () => {
    expect(await readJsonBody({ body: { a: 1 } })).toEqual({ a: 1 })
  })

  it("parses req.body when it is a JSON string", async () => {
    expect(await readJsonBody({ body: '{"a":1}' })).toEqual({ a: 1 })
  })

  it("parses a JSON stream", async () => {
    expect(await readJsonBody(streamOf('{"a":1}'))).toEqual({ a: 1 })
  })

  it("returns an empty object for an empty body", async () => {
    expect(await readJsonBody(streamOf(""))).toEqual({})
  })

  it("throws on malformed JSON", async () => {
    await expect(readJsonBody(streamOf("{oops"))).rejects.toThrow()
  })
})

describe("sendJson", () => {
  it("sets status, content-type and body", () => {
    const res = { setHeader: vi.fn(), end: vi.fn() }
    sendJson(res, 201, { ok: true })
    expect(res.statusCode).toBe(201)
    expect(res.setHeader).toHaveBeenCalledWith(
      "content-type",
      "application/json; charset=utf-8"
    )
    expect(res.end).toHaveBeenCalledWith('{"ok":true}')
  })
})

describe("clientIp", () => {
  it("takes the first x-forwarded-for entry", () => {
    expect(
      clientIp({ headers: { "x-forwarded-for": "1.2.3.4, 5.6.7.8" } })
    ).toBe("1.2.3.4")
  })

  it("falls back to the socket address", () => {
    expect(
      clientIp({ headers: {}, socket: { remoteAddress: "9.9.9.9" } })
    ).toBe("9.9.9.9")
  })

  it("returns an empty string when nothing is available", () => {
    expect(clientIp({ headers: {} })).toBe("")
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `bunx vitest run api/_lib/http.test.ts`
Expected: FAIL — `Cannot find module './http.js'`.

- [ ] **Step 3: Write the implementation**

`api/_lib/http.ts`:

```ts
export async function readJsonBody(req) {
  if (req.body != null && typeof req.body === "object") return req.body
  if (typeof req.body === "string" && req.body.trim() !== "") {
    return JSON.parse(req.body)
  }
  const chunks = []
  for await (const chunk of req) chunks.push(chunk)
  const raw = Buffer.concat(chunks).toString("utf8").trim()
  return raw === "" ? {} : JSON.parse(raw)
}

export function sendJson(res, status, body) {
  res.statusCode = status
  res.setHeader("content-type", "application/json; charset=utf-8")
  res.end(JSON.stringify(body))
}

export function clientIp(req) {
  const fwd = req.headers?.["x-forwarded-for"]
  if (typeof fwd === "string" && fwd.trim() !== "") {
    return fwd.split(",")[0].trim()
  }
  return req.socket?.remoteAddress ?? ""
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `bunx vitest run api/_lib/http.test.ts`
Expected: PASS (9 tests).

- [ ] **Step 5: Commit**

```bash
git add api/_lib/http.ts api/_lib/http.test.ts
git commit -m "feat: add http body/response helpers for api functions"
```

---

## Task 4: `api/_lib/rate-limit.ts` — best-effort in-memory limiter

**Files:**

- Create: `api/_lib/rate-limit.ts`
- Test: `api/_lib/rate-limit.test.ts`

- [ ] **Step 1: Write the failing test**

`api/_lib/rate-limit.test.ts`:

```ts
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { _resetRateLimit, rateLimit } from "./rate-limit.js"

beforeEach(() => {
  _resetRateLimit()
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

describe("rateLimit", () => {
  it("allows up to max calls, then blocks", () => {
    for (let i = 0; i < 5; i++) {
      expect(rateLimit("k", { max: 5 }).ok).toBe(true)
    }
    expect(rateLimit("k", { max: 5 }).ok).toBe(false)
  })

  it("allows again after the window elapses", () => {
    for (let i = 0; i < 5; i++) rateLimit("k", { max: 5, windowMs: 1000 })
    expect(rateLimit("k", { max: 5, windowMs: 1000 }).ok).toBe(false)
    vi.advanceTimersByTime(1001)
    expect(rateLimit("k", { max: 5, windowMs: 1000 }).ok).toBe(true)
  })

  it("tracks keys independently", () => {
    for (let i = 0; i < 5; i++) rateLimit("a", { max: 5 })
    expect(rateLimit("a", { max: 5 }).ok).toBe(false)
    expect(rateLimit("b", { max: 5 }).ok).toBe(true)
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `bunx vitest run api/_lib/rate-limit.test.ts`
Expected: FAIL — `Cannot find module './rate-limit.js'`.

- [ ] **Step 3: Write the implementation**

`api/_lib/rate-limit.ts`:

```ts
const hits = new Map()

export function rateLimit(key, { max = 5, windowMs = 60_000 } = {}) {
  const now = Date.now()
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs)
  recent.push(now)
  hits.set(key, recent)
  return { ok: recent.length <= max }
}

// Test-only: clears the module-level state between test cases.
export function _resetRateLimit() {
  hits.clear()
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `bunx vitest run api/_lib/rate-limit.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add api/_lib/rate-limit.ts api/_lib/rate-limit.test.ts
git commit -m "feat: add in-memory per-key rate limiter"
```

---

## Task 5: `api/_lib/resend.ts` — Resend client + sendEmail

**Files:**

- Create: `api/_lib/resend.ts`
- Test: `api/_lib/resend.test.ts`

This module wraps the Resend SDK. It is glue over an external service, so the test only
guards against import-time crashes and checks the `ADMIN` fallback. Behavior is covered
end-to-end by `process-contact.test.ts` (Task 8), which mocks this module.

- [ ] **Step 1: Write the failing test**

`api/_lib/resend.test.ts`:

```ts
import { describe, expect, it } from "vitest"

describe("resend module", () => {
  it("imports without throwing and exposes sendEmail + ADMIN", async () => {
    const mod = await import("./resend.js")
    expect(typeof mod.sendEmail).toBe("function")
    expect(typeof mod.ADMIN).toBe("string")
    expect(mod.ADMIN.length).toBeGreaterThan(0)
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `bunx vitest run api/_lib/resend.test.ts`
Expected: FAIL — `Cannot find module './resend.js'`.

- [ ] **Step 3: Write the implementation**

`api/_lib/resend.ts`:

```ts
import { Resend } from "resend"

import { brand } from "../../config/brand.js"

const resend = new Resend(process.env.RESEND_API_KEY)

const senderName = process.env.SENDER_NAME ?? brand.name
const senderEmail = process.env.SENDER_EMAIL ?? "dentrwrw@updates.hbapte.com"
const FROM = `${senderName} <${senderEmail}>`

export const ADMIN = process.env.ADMIN_EMAIL ?? "ijbapte@gmail.com"

// sendEmail({ to, subject, react, replyTo }) -> { success, id?, error? }
export async function sendEmail({ to, subject, react, replyTo }) {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM,
      to,
      replyTo: replyTo ?? ADMIN,
      subject,
      react,
    })
    if (error) return { success: false, error: error.message }
    return { success: true, id: data?.id }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : String(err),
    }
  }
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `bunx vitest run api/_lib/resend.test.ts`
Expected: PASS (1 test). No network call happens — nothing invokes `sendEmail`.

- [ ] **Step 5: Commit**

```bash
git add api/_lib/resend.ts api/_lib/resend.test.ts
git commit -m "feat: add resend client wrapper"
```

---

## Task 6: Email layout + appointment-request template

**Files:**

- Create: `emails/components/EmailLayout.tsx`
- Create: `emails/AppointmentRequest.tsx`
- Modify: `.gitignore`, `.prettierignore`, `.oxlintrc.json` (ignore `.react-email/`)

- [ ] **Step 1: Ignore the react-email build dir**

In `.gitignore`, add under `# production`:

```
/.react-email
```

In `.prettierignore`, add a line:

```
.react-email
```

In `.oxlintrc.json`, change `"ignorePatterns": ["dist/**", "next-env.d.ts"]` to:

```json
  "ignorePatterns": ["dist/**", ".react-email/**", "next-env.d.ts"],
```

- [ ] **Step 2: Create `emails/components/EmailLayout.tsx`**

```tsx
import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  pixelBasedPreset,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components"

import { brand } from "../../config/brand.js"

export function EmailLayout({ preview, children }) {
  return (
    <Html lang="en">
      <Tailwind
        config={{
          presets: [pixelBasedPreset],
          theme: { extend: { colors: { brand: brand.blue } } },
        }}>
        <Head />
        <Body className="bg-gray-100 font-sans">
          <Preview>{preview}</Preview>
          <Container className="mx-auto my-[24px] max-w-[600px] rounded-[8px] bg-white p-[32px]">
            <Text className="m-0 text-[20px] font-bold text-brand">
              {brand.name}
            </Text>
            <Hr className="my-[20px] border-none border-t border-solid border-gray-200" />
            {children}
            <Hr className="my-[20px] border-none border-t border-solid border-gray-200" />
            <Section>
              <Text className="m-0 text-[12px] leading-[18px] text-gray-500">
                {brand.name} &middot; {brand.phone} &middot; {brand.email}
              </Text>
              <Text className="m-0 text-[12px] leading-[18px] text-gray-500">
                {brand.address}
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}

export default EmailLayout
```

- [ ] **Step 3: Create `emails/AppointmentRequest.tsx`**

```tsx
import { Column, Heading, Row, Section, Text } from "@react-email/components"

import { EmailLayout } from "./components/EmailLayout.js"

function DetailRow({ label, value }) {
  return (
    <Row>
      <Column className="w-[120px] align-top">
        <Text className="m-0 py-[4px] text-[13px] font-semibold text-gray-500">
          {label}
        </Text>
      </Column>
      <Column className="align-top">
        <Text className="m-0 py-[4px] text-[14px] text-gray-900">
          {value || "—"}
        </Text>
      </Column>
    </Row>
  )
}

export function AppointmentRequest({
  name,
  email,
  phone,
  service,
  date,
  time,
  message,
}) {
  return (
    <EmailLayout preview={`New appointment request from ${name}`}>
      <Heading as="h1" className="m-0 mb-[8px] text-[18px] text-gray-900">
        New appointment request
      </Heading>
      <Text className="mb-[16px] mt-0 text-[14px] text-gray-600">
        Reply to this email to reach {name} directly.
      </Text>
      <Section>
        <DetailRow label="Name" value={name} />
        <DetailRow label="Email" value={email} />
        <DetailRow label="Phone" value={phone} />
        <DetailRow label="Service" value={service} />
        <DetailRow label="Date" value={date} />
        <DetailRow label="Time" value={time} />
        <DetailRow label="Note" value={message} />
      </Section>
    </EmailLayout>
  )
}

AppointmentRequest.PreviewProps = {
  name: "Amara Uwase",
  email: "amara@example.com",
  phone: "+250 788 123 456",
  service: "Root Canal Treatment",
  date: "2026-09-03",
  time: "10:30",
  message: "Some sensitivity on the lower-left molar.",
}

export default AppointmentRequest
```

- [ ] **Step 4: Eyeball the template in the preview server**

Run: `bun run email`
Expected: react-email dev server starts on `http://localhost:3001`. Open it, select **AppointmentRequest**, confirm the wordmark header, the detail rows, and the footer render. Stop the server (Ctrl+C).

- [ ] **Step 5: Verify lint + format**

Run: `bun run lint && bun run format`
Expected: PASS (run `bun run format:fix` if needed and re-check).

- [ ] **Step 6: Commit**

```bash
git add emails/ .gitignore .prettierignore .oxlintrc.json
git commit -m "feat: add email layout and appointment-request template"
```

---

## Task 7: Appointment-confirmation template (patient-facing)

**Files:**

- Create: `emails/AppointmentConfirmation.tsx`
- Test: `emails/AppointmentConfirmation.test.tsx`

- [ ] **Step 1: Write the failing test**

`emails/AppointmentConfirmation.test.tsx`:

```tsx
import { render } from "@react-email/components"
import { describe, expect, it } from "vitest"

import { AppointmentConfirmation } from "./AppointmentConfirmation.js"

describe("AppointmentConfirmation", () => {
  it("renders the patient name and the chosen service", async () => {
    const html = await render(
      <AppointmentConfirmation
        name="Amara"
        service="Root Canal Treatment"
        date="2026-09-03"
        time="10:30"
      />
    )
    expect(html).toContain("Amara")
    expect(html).toContain("Root Canal Treatment")
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `bunx vitest run emails/AppointmentConfirmation.test.tsx`
Expected: FAIL — `Cannot find module './AppointmentConfirmation.js'`.

- [ ] **Step 3: Write the implementation**

`emails/AppointmentConfirmation.tsx`:

```tsx
import { Heading, Section, Text } from "@react-email/components"

import { brand } from "../config/brand.js"
import { EmailLayout } from "./components/EmailLayout.js"

export function AppointmentConfirmation({ name, service, date, time }) {
  return (
    <EmailLayout preview="We received your appointment request">
      <Heading as="h1" className="m-0 mb-[8px] text-[18px] text-gray-900">
        Thanks, {name} — we received your request
      </Heading>
      <Text className="mb-[16px] mt-0 text-[14px] leading-[22px] text-gray-700">
        Our team will contact you shortly to confirm your appointment. Here is
        what you asked for:
      </Text>
      <Section className="mb-[16px]">
        <Text className="m-0 text-[14px] text-gray-900">
          <strong>Service:</strong> {service || "—"}
        </Text>
        <Text className="m-0 text-[14px] text-gray-900">
          <strong>Preferred date:</strong> {date || "—"}
        </Text>
        <Text className="m-0 text-[14px] text-gray-900">
          <strong>Preferred time:</strong> {time || "—"}
        </Text>
      </Section>
      <Text className="m-0 text-[14px] leading-[22px] text-gray-700">
        Clinic hours — {brand.hours.join(" · ")}. Questions? Call {brand.phone}.
      </Text>
    </EmailLayout>
  )
}

AppointmentConfirmation.PreviewProps = {
  name: "Amara",
  service: "Root Canal Treatment",
  date: "2026-09-03",
  time: "10:30",
}

export default AppointmentConfirmation
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `bunx vitest run emails/AppointmentConfirmation.test.tsx`
Expected: PASS (1 test).

- [ ] **Step 5: Commit**

```bash
git add emails/AppointmentConfirmation.tsx emails/AppointmentConfirmation.test.tsx
git commit -m "feat: add patient appointment-confirmation template"
```

---

## Task 8: `api/_lib/process-contact.ts` — contact handler logic

**Files:**

- Create: `api/_lib/process-contact.ts`
- Test: `api/_lib/process-contact.test.ts`

- [ ] **Step 1: Write the failing test**

`api/_lib/process-contact.test.ts`:

```ts
import { beforeEach, describe, expect, it, vi } from "vitest"

import { processContact } from "./process-contact.js"
import { _resetRateLimit } from "./rate-limit.js"
import { sendEmail } from "./resend.js"

vi.mock("./resend.js", () => ({
  ADMIN: "admin@dentrw.test",
  sendEmail: vi.fn(),
}))

const validBody = {
  user_name: "Amara Uwase",
  user_email: "amara@example.com",
  user_phone: "0788000000",
  chosen_service: "RCT",
  user_date: "2026-09-03",
  user_time: "10:30",
  user_message: "hello",
  company: "",
}

beforeEach(() => {
  _resetRateLimit()
  vi.mocked(sendEmail).mockReset()
  vi.mocked(sendEmail).mockResolvedValue({ success: true, id: "e_1" })
})

describe("processContact", () => {
  it("silently accepts a filled honeypot and sends nothing", async () => {
    const res = await processContact(
      { ...validBody, company: "bot" },
      { ip: "1.1.1.1" }
    )
    expect(res.status).toBe(200)
    expect(sendEmail).not.toHaveBeenCalled()
  })

  it("rejects a missing name with 400", async () => {
    const res = await processContact(
      { ...validBody, user_name: "  " },
      { ip: "1.1.1.2" }
    )
    expect(res.status).toBe(400)
    expect(sendEmail).not.toHaveBeenCalled()
  })

  it("rejects an invalid email with 400", async () => {
    const res = await processContact(
      { ...validBody, user_email: "nope" },
      { ip: "1.1.1.3" }
    )
    expect(res.status).toBe(400)
  })

  it("blocks after too many requests from one ip", async () => {
    for (let i = 0; i < 5; i++) {
      await processContact(validBody, { ip: "1.1.1.9" })
    }
    const res = await processContact(validBody, { ip: "1.1.1.9" })
    expect(res.status).toBe(429)
  })

  it("sends the admin notification then the patient confirmation", async () => {
    const res = await processContact(validBody, { ip: "1.1.1.4" })
    expect(res.status).toBe(200)
    expect(sendEmail).toHaveBeenCalledTimes(2)
    const [first, second] = vi.mocked(sendEmail).mock.calls
    expect(first[0].to).toBe("admin@dentrw.test")
    expect(first[0].replyTo).toBe("amara@example.com")
    expect(first[0].subject).toContain("Amara Uwase")
    expect(second[0].to).toBe("amara@example.com")
    expect(second[0].subject).toBe("We received your appointment request")
  })

  it("maps the service slug to its label in the email props", async () => {
    await processContact(validBody, { ip: "1.1.1.5" })
    const props = vi.mocked(sendEmail).mock.calls[0][0].react.props
    expect(props.service).toBe("Root Canal Treatment")
  })

  it("returns 500 when the admin email fails", async () => {
    vi.mocked(sendEmail).mockResolvedValueOnce({
      success: false,
      error: "boom",
    })
    const res = await processContact(validBody, { ip: "1.1.1.6" })
    expect(res.status).toBe(500)
    expect(sendEmail).toHaveBeenCalledTimes(1)
  })

  it("still returns 200 when only the confirmation email fails", async () => {
    vi.mocked(sendEmail)
      .mockResolvedValueOnce({ success: true, id: "e_1" })
      .mockResolvedValueOnce({ success: false, error: "boom" })
    const res = await processContact(validBody, { ip: "1.1.1.7" })
    expect(res.status).toBe(200)
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `bunx vitest run api/_lib/process-contact.test.ts`
Expected: FAIL — `Cannot find module './process-contact.js'`.

- [ ] **Step 3: Write the implementation**

`api/_lib/process-contact.ts`:

```ts
import { createElement } from "react"

import { serviceLabel } from "../../config/services.js"
import { AppointmentConfirmation } from "../../emails/AppointmentConfirmation.js"
import { AppointmentRequest } from "../../emails/AppointmentRequest.js"
import { rateLimit } from "./rate-limit.js"
import { ADMIN, sendEmail } from "./resend.js"
import { isEmail } from "./validate.js"

export async function processContact(body, { ip }) {
  if (typeof body?.company === "string" && body.company.trim() !== "") {
    return { status: 200, json: { ok: true } }
  }

  if (!rateLimit(`contact:${ip}`).ok) {
    return {
      status: 429,
      json: { error: "Too many requests. Please try again in a minute." },
    }
  }

  const name = typeof body?.user_name === "string" ? body.user_name.trim() : ""
  const email =
    typeof body?.user_email === "string" ? body.user_email.trim() : ""
  if (name === "" || !isEmail(email)) {
    return {
      status: 400,
      json: { error: "Please provide your name and a valid email." },
    }
  }

  const label = serviceLabel(body.chosen_service)
  const details = {
    name,
    email,
    phone: body.user_phone ?? "",
    service: label,
    date: body.user_date ?? "",
    time: body.user_time ?? "",
    message: body.user_message ?? "",
  }

  const adminResult = await sendEmail({
    to: ADMIN,
    replyTo: email,
    subject: `New appointment request — ${name}`,
    react: createElement(AppointmentRequest, details),
  })
  if (!adminResult.success) {
    return {
      status: 500,
      json: { error: "Could not send your request. Please try again later." },
    }
  }

  const confirmResult = await sendEmail({
    to: email,
    subject: "We received your appointment request",
    react: createElement(AppointmentConfirmation, {
      name,
      service: label,
      date: details.date,
      time: details.time,
    }),
  })
  if (!confirmResult.success) {
    console.warn("[contact] confirmation email failed:", confirmResult.error)
  }

  return { status: 200, json: { ok: true } }
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `bunx vitest run api/_lib/process-contact.test.ts`
Expected: PASS (8 tests).

- [ ] **Step 5: Run the full suite**

Run: `bun run test`
Expected: PASS — all prior tests plus these.

- [ ] **Step 6: Commit**

```bash
git add api/_lib/process-contact.ts api/_lib/process-contact.test.ts
git commit -m "feat: add contact form handler with honeypot and dual emails"
```

---

## Task 9: `api/contact.ts` + Vite dev plugin

**Files:**

- Create: `api/contact.ts`
- Create: `vite/api-plugin.js`
- Modify: `vite.config.mjs`

The 6-line entry file is glue with no branching logic worth unit-testing in isolation; it
is exercised by the manual dev check in Step 5 and by the preview deploy in Task 16.

- [ ] **Step 1: Create `api/contact.ts`**

```ts
import { clientIp, readJsonBody, sendJson } from "./_lib/http.js"
import { processContact } from "./_lib/process-contact.js"

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return sendJson(res, 405, { error: "Method not allowed" })
  }
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

- [ ] **Step 2: Create `vite/api-plugin.js`**

```js
import { loadEnv } from "vite"

const ROUTES = {
  "/api/contact": {
    module: "/api/_lib/process-contact.ts",
    handler: "processContact",
  },
  "/api/subscribe": {
    module: "/api/_lib/process-subscribe.ts",
    handler: "processSubscribe",
  },
}

// Mounts the api/_lib handlers at /api/* during `vite dev`, using the same
// modules the Vercel functions import. Handlers are loaded lazily through
// server.ssrLoadModule so Vite transpiles the .ts/.tsx chain and picks up edits.
export function apiDevPlugin() {
  return {
    name: "dentrw-api-dev",

    config(_, { mode }) {
      // Expose non-VITE_ env vars (RESEND_API_KEY, CONVERTKIT_*, ...) to the
      // dev handlers via process.env. Vite does not do this on its own.
      const env = loadEnv(mode, process.cwd(), "")
      for (const [key, value] of Object.entries(env)) {
        if (process.env[key] === undefined) process.env[key] = value
      }
    },

    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const path = (req.url || "").split("?")[0]
        const route = ROUTES[path]
        if (!route) return next()

        const { readJsonBody, sendJson, clientIp } =
          await server.ssrLoadModule("/api/_lib/http.ts")

        if (req.method !== "POST") {
          return sendJson(res, 405, { error: "Method not allowed" })
        }
        try {
          const mod = await server.ssrLoadModule(route.module)
          let body
          try {
            body = await readJsonBody(req)
          } catch {
            return sendJson(res, 400, { error: "Invalid JSON" })
          }
          const { status, json } = await mod[route.handler](body, {
            ip: clientIp(req),
          })
          sendJson(res, status, json)
        } catch (err) {
          server.config.logger.error(
            `[api-dev] ${path} failed: ${err?.stack || err}`
          )
          sendJson(res, 500, { error: "Dev handler error" })
        }
      })
    },
  }
}
```

Note: `/api/subscribe` is listed now but its module does not exist until Task 10 — that
route will 500 until then, which is fine (nothing calls it yet).

- [ ] **Step 3: Wire the plugin into `vite.config.mjs`**

Add the import at the top with the other imports:

```js
import { apiDevPlugin } from "./vite/api-plugin.js"
```

In the `plugins` array, add `apiDevPlugin()` immediately after `react()`:

```js
  plugins: [
    react(),
    apiDevPlugin(),
    VitePWA({
```

- [ ] **Step 4: Verify tests + build still pass**

Run: `bun run test && bun run build`
Expected: PASS (the plugin's `configureServer` does not run during tests or build).

- [ ] **Step 5: Manual dev check**

Ensure `.env.local` has a real `RESEND_API_KEY` and `ADMIN_EMAIL`. Run `bun run dev`, then in a second terminal:

```bash
curl -i -X POST http://localhost:3000/api/contact \
  -H 'content-type: application/json' \
  -d '{"user_name":"Test User","user_email":"you@example.com","chosen_service":"RCT","user_date":"2026-09-10","user_time":"09:00","user_message":"plan smoke test","company":""}'
```

Expected: `HTTP/1.1 200` and `{"ok":true}` if the Resend domain is verified; or `HTTP/1.1 500` with `{"error":"Could not send..."}` and a Resend error in the dev console if the domain is not yet verified (that is acceptable at this stage — the wiring is proven). Also test the honeypot: add `"company":"x"` → expect `200` and no email. Stop the dev server.

- [ ] **Step 6: Commit**

```bash
git add api/contact.ts vite/api-plugin.js vite.config.mjs
git commit -m "feat: expose /api/contact in dev and on vercel"
```

---

## Task 10: `api/_lib/process-subscribe.ts` — newsletter handler logic

**Files:**

- Create: `api/_lib/process-subscribe.ts`
- Test: `api/_lib/process-subscribe.test.ts`

- [ ] **Step 1: Write the failing test**

`api/_lib/process-subscribe.test.ts`:

```ts
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { processSubscribe } from "./process-subscribe.js"
import { _resetRateLimit } from "./rate-limit.js"

beforeEach(() => {
  _resetRateLimit()
  vi.stubEnv("CONVERTKIT_FORM_ID", "form_123")
  vi.stubEnv("CONVERTKIT_API_KEY", "ck_secret")
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({ ok: true, status: 200, text: async () => "" })
  )
})

afterEach(() => {
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
})

describe("processSubscribe", () => {
  it("rejects a bad email without calling ConvertKit", async () => {
    const res = await processSubscribe({ email: "nope" }, { ip: "2.2.2.1" })
    expect(res.status).toBe(400)
    expect(fetch).not.toHaveBeenCalled()
  })

  it("posts to the ConvertKit form endpoint", async () => {
    const res = await processSubscribe({ email: "a@b.co" }, { ip: "2.2.2.2" })
    expect(res.status).toBe(200)
    const [url, init] = vi.mocked(fetch).mock.calls[0]
    expect(url).toBe("https://api.convertkit.com/v3/forms/form_123/subscribe")
    expect(JSON.parse(init.body)).toEqual({
      api_key: "ck_secret",
      email: "a@b.co",
    })
  })

  it("returns 502 when ConvertKit responds with an error", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 500,
      text: async () => "err",
    })
    const res = await processSubscribe({ email: "a@b.co" }, { ip: "2.2.2.3" })
    expect(res.status).toBe(502)
  })

  it("returns 502 when the fetch itself throws", async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error("network"))
    const res = await processSubscribe({ email: "a@b.co" }, { ip: "2.2.2.4" })
    expect(res.status).toBe(502)
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `bunx vitest run api/_lib/process-subscribe.test.ts`
Expected: FAIL — `Cannot find module './process-subscribe.js'`.

- [ ] **Step 3: Write the implementation**

`api/_lib/process-subscribe.ts`:

```ts
import { rateLimit } from "./rate-limit.js"
import { isEmail } from "./validate.js"

const UNAVAILABLE = {
  status: 502,
  json: {
    error: "Subscription service is unavailable. Please try again later.",
  },
}

export async function processSubscribe(body, { ip }) {
  if (!rateLimit(`subscribe:${ip}`).ok) {
    return {
      status: 429,
      json: { error: "Too many requests. Please try again in a minute." },
    }
  }

  const email = typeof body?.email === "string" ? body.email.trim() : ""
  if (!isEmail(email)) {
    return { status: 400, json: { error: "Please provide a valid email." } }
  }

  const formId = process.env.CONVERTKIT_FORM_ID
  try {
    const response = await fetch(
      `https://api.convertkit.com/v3/forms/${formId}/subscribe`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          api_key: process.env.CONVERTKIT_API_KEY,
          email,
        }),
      }
    )
    if (!response.ok) {
      const detail = await response.text().catch(() => "<no body>")
      console.error("[subscribe] ConvertKit responded", response.status, detail)
      return UNAVAILABLE
    }
  } catch (err) {
    console.error("[subscribe] ConvertKit request failed", err)
    return UNAVAILABLE
  }

  return { status: 200, json: { ok: true } }
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `bunx vitest run api/_lib/process-subscribe.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add api/_lib/process-subscribe.ts api/_lib/process-subscribe.test.ts
git commit -m "feat: add server-side newsletter subscribe handler"
```

---

## Task 11: `api/subscribe.ts` entry

**Files:**

- Create: `api/subscribe.ts`

The `/api/subscribe` dev route is already registered in `vite/api-plugin.js` (Task 9) and
starts working the moment `process-subscribe.ts` exists (Task 10).

- [ ] **Step 1: Create `api/subscribe.ts`**

```ts
import { clientIp, readJsonBody, sendJson } from "./_lib/http.js"
import { processSubscribe } from "./_lib/process-subscribe.js"

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return sendJson(res, 405, { error: "Method not allowed" })
  }
  let body
  try {
    body = await readJsonBody(req)
  } catch {
    return sendJson(res, 400, { error: "Invalid JSON" })
  }
  const { status, json } = await processSubscribe(body, { ip: clientIp(req) })
  return sendJson(res, status, json)
}
```

- [ ] **Step 2: Manual dev check**

Ensure `.env.local` has `CONVERTKIT_API_KEY` and `CONVERTKIT_FORM_ID` (see Task 14 for the
rename — if not done yet, temporarily add them). Run `bun run dev`, then:

```bash
curl -i -X POST http://localhost:3000/api/subscribe \
  -H 'content-type: application/json' -d '{"email":"nope"}'
```

Expected: `HTTP/1.1 400` `{"error":"Please provide a valid email."}`.

```bash
curl -i -X POST http://localhost:3000/api/subscribe \
  -H 'content-type: application/json' -d '{"email":"you+test@example.com"}'
```

Expected: `HTTP/1.1 200` `{"ok":true}` (real ConvertKit key) or `502` (dummy key) — either proves the wiring. Stop the dev server.

- [ ] **Step 3: Verify tests + build**

Run: `bun run test && bun run build`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add api/subscribe.ts
git commit -m "feat: expose /api/subscribe in dev and on vercel"
```

---

## Task 12: Rewire the appointment form

**Files:**

- Modify: `src/components/Contact.jsx`

- [ ] **Step 1: Replace the imports and handler**

Replace the top of the file (current lines 1–44, from `import { useEffect, useRef, useState }` through the end of the `sendEmail` function) with:

```jsx
import { useEffect, useState } from "react"
import { Fade } from "react-awesome-reveal"

import { services } from "../../config/services.js"

const Contact = () => {
  const [isSent, setIsSent] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    let timeout
    if (error) {
      timeout = setTimeout(() => {
        setError("")
      }, 8000)
    }
    return () => clearTimeout(timeout)
  }, [error])

  const sendEmail = async (e) => {
    e.preventDefault()
    const formEl = e.currentTarget
    setIsLoading(true)
    setError("")

    try {
      const data = Object.fromEntries(new FormData(formEl))
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error(`Request failed: ${res.status}`)
      setIsSent(true)
      formEl.reset()
      setTimeout(() => {
        setIsSent(false)
      }, 5000)
    } catch {
      setError("An error occurred. Please try again later.")
    } finally {
      setIsLoading(false)
    }
  }
```

- [ ] **Step 2: Remove the form ref and add the honeypot**

Find `<form ref={form} onSubmit={sendEmail} ...>` and change it to `<form onSubmit={sendEmail} ...>` (drop `ref={form}` only).

Immediately after that opening `<form ...>` tag, add the honeypot as the first child:

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

- [ ] **Step 3: Render the service options from config**

Replace the nine hard-coded `<option>` elements inside `<select name="chosen_service" ...>` with:

```jsx
{
  services.map((s) => (
    <option key={s.value} value={s.value}>
      {s.label}
    </option>
  ))
}
```

- [ ] **Step 4: Verify no leftover EmailJS or ref references**

Run: `git grep -nE "emailjs|useRef|form\.current|ref=\{form\}" -- src/components/Contact.jsx`
Expected: no matches (exit code 1).

- [ ] **Step 5: Lint, format, build**

Run: `bun run lint && bun run format && bun run build`
Expected: PASS (run `bun run format:fix` if needed).

- [ ] **Step 6: Manual dev check**

Run `bun run dev`, open the site, fill the appointment form, submit.
Expected: the "Booking..." state, then "Appointment received successfully" (or the error message if the Resend domain is not verified yet — check the dev console). Stop the dev server.

- [ ] **Step 7: Commit**

```bash
git add src/components/Contact.jsx
git commit -m "refactor: submit the appointment form to /api/contact"
```

---

## Task 13: Rewire the newsletter form

**Files:**

- Modify: `src/components/Footer.jsx`

- [ ] **Step 1: Remove the axios import**

Delete line `import axios from "axios"`.

- [ ] **Step 2: Replace the submit handler**

Replace the `handleSubmit` function (current lines ~15–56) with:

```jsx
const handleSubmit = async (event) => {
  event.preventDefault()
  setErrorMessage("")

  if (!email) {
    setErrorMessage("Email is required.")
    return
  }

  setLoading(true)

  try {
    const res = await fetch("/api/subscribe", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email }),
    })
    if (!res.ok) throw new Error(`Request failed: ${res.status}`)
    setEmail("")
    setSubscribed(true)
    setTimeout(() => {
      setSubscribed(false)
    }, 3000)
  } catch {
    setErrorMessage("Error occurred. Please try again!")
    setTimeout(() => {
      setErrorMessage("")
    }, 3000)
  } finally {
    setLoading(false)
  }
}
```

- [ ] **Step 3: Verify no leftover references**

Run: `git grep -nE "axios|convertkit|CONVERTKIT" -- src/components/Footer.jsx`
Expected: no matches (exit code 1).

- [ ] **Step 4: Lint, format, build**

Run: `bun run lint && bun run format && bun run build`
Expected: PASS.

- [ ] **Step 5: Manual dev check**

Run `bun run dev`, scroll to the footer, submit an email.
Expected: "Subscribing..." then "Subscribed successfully!" (real key) or "Error occurred..." (dummy key). Stop the dev server.

- [ ] **Step 6: Commit**

```bash
git add src/components/Footer.jsx
git commit -m "refactor: submit the newsletter form to /api/subscribe"
```

---

## Task 14: Remove EmailJS + update env files

**Files:**

- Modify: `package.json`, `bun.lock` (via `bun remove`)
- Modify: `.env.example`
- Modify: `.env.local` (local only — not committed)

- [ ] **Step 1: Remove the EmailJS dependency**

Run: `bun remove @emailjs/browser`
Expected: `@emailjs/browser` gone from `package.json`; `bun.lock` updates.

- [ ] **Step 2: Confirm nothing else imports EmailJS or the old env vars**

Run: `git grep -nE "@emailjs|emailjs\.|VITE_EMAILJS|VITE_CONVERTKIT" -- ':!bun.lock' ':!docs' ':!plans'`
Expected: no matches (exit code 1). (`docs/` and `plans/` still reference the old names historically; those are fine.)

- [ ] **Step 3: Rewrite `.env.example`**

```
# Resend — https://resend.com/api-keys
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxx

# Verified sender domain in Resend — https://resend.com/domains
SENDER_EMAIL=dentrwrw@updates.hbapte.com
SENDER_NAME=DentRW

# Where appointment notifications are delivered
ADMIN_EMAIL=ijbapte@gmail.com

# ConvertKit (Kit) — https://app.kit.com/account_settings/developer_settings
CONVERTKIT_API_KEY=xxxxxxxxxxxxxxxxxxxxxx
CONVERTKIT_FORM_ID=0000000
```

- [ ] **Step 4: Update `.env.local` (do not commit)**

Set it to (keep the existing real `RESEND_API_KEY` value already in the file):

```
# ConvertKit
CONVERTKIT_API_KEY=dummy
CONVERTKIT_FORM_ID=0000000

# Resend
RESEND_API_KEY=<keep the existing value>
SENDER_EMAIL=dentrwrw@updates.hbapte.com
SENDER_NAME=DentRW
ADMIN_EMAIL=ijbapte@gmail.com
```

Remove the `VITE_CONVERTKIT_*` and `VITE_EMAILJS_*` lines.

- [ ] **Step 5: Verify build + tests**

Run: `bun run build && bun run test`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add package.json bun.lock .env.example
git commit -m "chore: drop @emailjs/browser and rename env vars"
```

---

## Task 15: Documentation + knip

**Files:**

- Modify: `README.md`
- Create: `docs/email.md`
- Modify: `knip.json`

- [ ] **Step 1: Update `README.md`**

- **Features** section: change
  `- **Appointment Booking** — ... Form submission is handled via EmailJS.`
  to
  `- **Appointment Booking** — ... Form submissions are sent with Resend using React Email templates, via a Vercel serverless function.`
  and change
  `- **Data Collection Automation** — EmailJS and ConvertKit handle email replies and subscriber management automatically.`
  to
  `- **Data Collection Automation** — Resend delivers appointment emails; ConvertKit manages newsletter subscribers. Both run server-side.`

- **Tech Stack** table: replace the EmailJS row with two rows:

  ```
  | [Resend](https://resend.com)                      | Transactional email delivery (appointment notifications)  |
  | [React Email](https://react.email)                | Component-based HTML email templates                      |
  ```

  Keep the ConvertKit row; change its Purpose to
  `Newsletter subscription management (called server-side)`.

- **Environment Variables** section: replace the `env` block with

  ```env
  RESEND_API_KEY=
  SENDER_EMAIL=
  SENDER_NAME=
  ADMIN_EMAIL=
  CONVERTKIT_API_KEY=
  CONVERTKIT_FORM_ID=
  ```

  and add a sentence: "These are server-side only (no `VITE_` prefix) and must be set in
  the Vercel project settings for production."

- **Acknowledgements**: replace the EmailJS bullet with `- [Resend](https://resend.com)`
  and `- [React Email](https://react.email)`.

- [ ] **Step 2: Create `docs/email.md`**

````markdown
# Email

Appointment emails go through **Resend** with **React Email** templates. The newsletter
signup calls **ConvertKit** server-side.

## How it works

- `POST /api/contact` — `Contact.jsx` submits the booking form here. The handler
  (`api/_lib/process-contact.ts`) drops honeypot submissions, rate-limits by IP, validates,
  then sends two emails: an **AppointmentRequest** to `ADMIN_EMAIL` (reply-to = the
  patient) and an **AppointmentConfirmation** to the patient.
- `POST /api/subscribe` — `Footer.jsx` submits the newsletter form here. The handler
  (`api/_lib/process-subscribe.ts`) validates the email and forwards it to the ConvertKit
  form subscribe endpoint using `CONVERTKIT_API_KEY` (never exposed to the browser).

Each `/api/*.ts` file is a thin Vercel function wrapper. The logic lives in `api/_lib/` as
pure `processX(body, { ip })` functions. In `bun run dev`, `vite/api-plugin.js` mounts the
same functions at `/api/*` — dev and prod run identical code.

## Templates

Templates live in `emails/`. Preview them with:

```bash
bun run email   # react-email dev server on http://localhost:3001
```
````

Add a template: create `emails/MyEmail.tsx` exporting a component + `MyEmail.PreviewProps`,
then `createElement(MyEmail, props)` in a handler and pass it as `react` to `sendEmail`.

## Environment variables

Server-side only — no `VITE_` prefix, so never bundled into the client. Set them in
`.env.local` for dev and in the Vercel project settings for production:
`RESEND_API_KEY`, `SENDER_EMAIL`, `SENDER_NAME`, `ADMIN_EMAIL`, `CONVERTKIT_API_KEY`,
`CONVERTKIT_FORM_ID`. `SENDER_EMAIL`'s domain must be a verified domain in Resend.

## Known limitation

The rate limiter (`api/_lib/rate-limit.ts`) is in-memory per serverless instance. It resets
on cold starts and does not coordinate across concurrent instances — it is bot friction,
not a hard quota.

````

- [ ] **Step 3: Update `knip.json`**

```json
{
  "$schema": "https://unpkg.com/knip@6/schema.json",
  "tags": ["-lintignore"],
  "entry": [
    "src/index.jsx",
    "api/**/*.ts",
    "emails/**/*.tsx",
    "vite/api-plugin.js"
  ],
  "ignoreDependencies": ["react-email"]
}
````

- [ ] **Step 4: Run knip**

Run: `bun run knip`
Expected: no errors about the new `api/`, `emails/`, `config/`, or `vite/` files, and no
"unused dependency" for `resend` / `@react-email/components` / `react-email`. If `config/`
files are flagged as unused, add `"config/**/*.ts"` to `entry`.

- [ ] **Step 5: Format check**

Run: `bun run format`
Expected: PASS (run `bun run format:fix` if needed).

- [ ] **Step 6: Commit**

```bash
git add README.md docs/email.md knip.json
git commit -m "docs: document the resend + react-email setup"
```

---

## Task 16: Full verification + pre-merge checklist

**Files:** none (verification only)

- [ ] **Step 1: Clean install**

Run: `bun install --frozen-lockfile`
Expected: PASS — lockfile is in sync with `package.json`.

- [ ] **Step 2: Run every CI gate locally**

Run:

```bash
bun run format
bun run lint
bun run test
bun run build
```

Expected: all PASS. `bun run test` shows the new suites: `validate`, `http`, `rate-limit`,
`resend`, `process-contact`, `process-subscribe`, `AppointmentConfirmation`, plus the
pre-existing `AnnouncementBar` and `LanguageSwitcher` tests.

- [ ] **Step 3: Preview both email templates**

Run: `bun run email`, open `http://localhost:3001`, check **AppointmentRequest** and
**AppointmentConfirmation** both render. Stop the server.

- [ ] **Step 4: End-to-end dev check**

With a real `RESEND_API_KEY` + verified domain in `.env.local`: `bun run dev`, submit the
appointment form, confirm the admin email and the patient confirmation both arrive. Submit
the newsletter form with a real `CONVERTKIT_*` and confirm the contact appears in
ConvertKit.

- [ ] **Step 5: Push and open the PR**

```bash
git push -u origin advisor/resend-email-migration
```

Then open a PR against `master`. In the PR description, include this **pre-merge checklist**:

- [ ] Add `RESEND_API_KEY`, `SENDER_EMAIL`, `SENDER_NAME`, `ADMIN_EMAIL`,
      `CONVERTKIT_API_KEY`, `CONVERTKIT_FORM_ID` in the Vercel project → Settings →
      Environment Variables (Production + Preview).
- [ ] Confirm `updates.hbapte.com` (or whatever `SENDER_EMAIL` uses) is a **verified
      domain** in Resend.
- [ ] On the Vercel preview deploy, submit a real test booking and confirm both emails
      arrive and `/api/contact` returns 200.
- [ ] Rotate `RESEND_API_KEY` (the prior value was exposed in a chat session).

- [ ] **Step 6: Verify CI is green on the PR**

Wait for the `lint`, `format`, `test`, and `build` GitHub Actions jobs to pass. Address any
failures before requesting review.

---

## Self-review notes (for the implementer)

- **Entry files `api/contact.ts` / `api/subscribe.ts`** have no dedicated unit test by
  design — they are 6 lines of glue with no branching beyond a method check, exercised by
  the dev-parity middleware and the preview deploy. Everything with logic
  (`process-contact`, `process-subscribe`, `http`, `rate-limit`, `validate`, the
  confirmation template) is tested.
- **`resend.ts`** is only smoke-tested (import + `ADMIN` fallback). Its send path is
  covered indirectly through the mocked `process-contact.test.ts`.
- If Vercel's build fails to compile the `.ts`/`.tsx` functions, check that the repo's
  `typescript` dependency resolves and that `tsconfig.json` has `"jsx": "react-jsx"`; as a
  fallback add a `vercel.json` pinning `typescript` via `installCommand`. (Spec → Risks.)
