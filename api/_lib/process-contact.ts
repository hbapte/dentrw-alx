import { createElement } from "react"

import { serviceLabel } from "../../config/services.js"
import { AppointmentConfirmation } from "../../emails/AppointmentConfirmation.js"
import { AppointmentRequest } from "../../emails/AppointmentRequest.js"
import { rateLimit } from "./rate-limit.js"
import { ADMIN, sendEmail } from "./resend.js"
import { isEmail } from "./validate.js"

export async function processContact(body, { ip }) {
  if (typeof body?.company === "string" && body.company.trim() !== "") {
    return { status: 200, json: { ok: true } }
  }

  if (!rateLimit(`contact:${ip}`).ok) {
    return {
      status: 429,
      json: { error: "Too many requests. Please try again in a minute." },
    }
  }

  const name = typeof body?.user_name === "string" ? body.user_name.trim() : ""
  const email =
    typeof body?.user_email === "string" ? body.user_email.trim() : ""
  if (name === "" || !isEmail(email)) {
    return {
      status: 400,
      json: { error: "Please provide your name and a valid email." },
    }
  }

  const label = serviceLabel(body.chosen_service)
  const details = {
    name,
    email,
    phone: body.user_phone ?? "",
    service: label,
    date: body.user_date ?? "",
    time: body.user_time ?? "",
    message: body.user_message ?? "",
  }

  const adminResult = await sendEmail({
    to: ADMIN,
    replyTo: email,
    subject: `New appointment request — ${name}`,
    react: createElement(AppointmentRequest, details),
  })
  if (!adminResult.success) {
    return {
      status: 500,
      json: { error: "Could not send your request. Please try again later." },
    }
  }

  const confirmResult = await sendEmail({
    to: email,
    subject: "We received your appointment request",
    react: createElement(AppointmentConfirmation, {
      name,
      service: label,
      date: details.date,
      time: details.time,
    }),
  })
  if (!confirmResult.success) {
    console.warn("[contact] confirmation email failed:", confirmResult.error)
  }

  return { status: 200, json: { ok: true } }
}
