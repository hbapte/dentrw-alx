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
