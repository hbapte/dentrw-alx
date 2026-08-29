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
