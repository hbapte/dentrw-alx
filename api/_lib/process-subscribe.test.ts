import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { processSubscribe } from "./process-subscribe.js"
import { _resetRateLimit } from "./rate-limit.js"

beforeEach(() => {
  _resetRateLimit()
  vi.stubEnv("CONVERTKIT_FORM_ID", "form_123")
  vi.stubEnv("CONVERTKIT_API_KEY", "ck_secret")
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue(new Response("", { status: 200 }))
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
    expect(JSON.parse(String(init.body))).toEqual({
      api_key: "ck_secret",
      email: "a@b.co",
    })
  })

  it("returns 502 when ConvertKit responds with an error", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response("err", { status: 500 }))
    const res = await processSubscribe({ email: "a@b.co" }, { ip: "2.2.2.3" })
    expect(res.status).toBe(502)
  })

  it("returns 502 when the fetch itself throws", async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error("network"))
    const res = await processSubscribe({ email: "a@b.co" }, { ip: "2.2.2.4" })
    expect(res.status).toBe(502)
  })
})
