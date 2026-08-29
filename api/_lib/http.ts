export async function readJsonBody(req) {
  if (req.body != null && typeof req.body === "object") return req.body
  if (typeof req.body === "string" && req.body.trim() !== "") {
    return JSON.parse(req.body)
  }
  const chunks = []
  for await (const chunk of req) chunks.push(chunk)
  const raw = Buffer.concat(chunks).toString("utf8").trim()
  return raw === "" ? {} : JSON.parse(raw)
}

export function sendJson(res, status, body) {
  res.statusCode = status
  res.setHeader("content-type", "application/json; charset=utf-8")
  res.end(JSON.stringify(body))
}

export function clientIp(req) {
  const fwd = req.headers?.["x-forwarded-for"]
  if (typeof fwd === "string" && fwd.trim() !== "") {
    return fwd.split(",")[0].trim()
  }
  return req.socket?.remoteAddress ?? ""
}
