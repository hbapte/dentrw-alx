const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function isEmail(value) {
  return typeof value === "string" && EMAIL_RE.test(value.trim())
}
