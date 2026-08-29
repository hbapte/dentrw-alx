import { describe, expect, it } from "vitest"

describe("resend module", () => {
  it("imports without throwing and exposes sendEmail + ADMIN", async () => {
    const mod = await import("./resend.js")
    expect(typeof mod.sendEmail).toBe("function")
    expect(typeof mod.ADMIN).toBe("string")
    expect(mod.ADMIN.length).toBeGreaterThan(0)
  })
})
