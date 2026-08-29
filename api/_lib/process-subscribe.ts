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
