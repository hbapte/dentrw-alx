import { Resend } from "resend"

import { brand } from "../../config/brand.js"

const senderName = process.env.SENDER_NAME ?? brand.name
const senderEmail = process.env.SENDER_EMAIL ?? "dentrwrw@updates.hbapte.com"
const FROM = `${senderName} <${senderEmail}>`

export const ADMIN = process.env.ADMIN_EMAIL ?? "ijbapte@gmail.com"

// Lazily construct the client — `new Resend()` throws when the key is missing, and we
// want a misconfigured deploy to surface as a failed send (clean 500), not a crash on
// import.
let client
function getResend() {
  if (!client) client = new Resend(process.env.RESEND_API_KEY)
  return client
}

// sendEmail({ to, subject, react, replyTo }) -> { success, id?, error? }
export async function sendEmail(options) {
  const { to, subject, react, replyTo } = options
  try {
    const { data, error } = await getResend().emails.send({
      from: FROM,
      to,
      replyTo: replyTo ?? ADMIN,
      subject,
      react,
    })
    if (error) return { success: false, error: error.message }
    return { success: true, id: data?.id }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : String(err),
    }
  }
}
