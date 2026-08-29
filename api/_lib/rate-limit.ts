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
