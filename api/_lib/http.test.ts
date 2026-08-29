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
