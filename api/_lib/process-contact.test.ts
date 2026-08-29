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
