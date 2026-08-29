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
