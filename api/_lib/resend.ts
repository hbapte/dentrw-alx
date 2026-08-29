import { Resend } from "resend"

import { brand } from "../../config/brand.js"

const resend = new Resend(process.env.RESEND_API_KEY)

const senderName = process.env.SENDER_NAME ?? brand.name
const senderEmail = process.env.SENDER_EMAIL ?? "dentrwrw@updates.hbapte.com"
const FROM = `${senderName} <${senderEmail}>`

export const ADMIN = process.env.ADMIN_EMAIL ?? "ijbapte@gmail.com"

// sendEmail({ to, subject, react, replyTo }) -> { success, id?, error? }
export async function sendEmail(options) {
  const { to, subject, react, replyTo } = options
  try {
    const { data, error } = await resend.emails.send({
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
