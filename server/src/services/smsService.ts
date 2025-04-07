import twilio from "twilio"
import dotenv from "dotenv"

dotenv.config()

const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER

// Initialize Twilio client
const client = twilio(accountSid, authToken)

// Send SMS notification
export const sendSMS = async (to: string, message: string) => {
  try {
    if (!accountSid || !authToken || !twilioPhoneNumber) {
      throw new Error("Twilio credentials not configured")
    }

    const result = await client.messages.create({
      body: message,
      from: twilioPhoneNumber,
      to,
    })

    return {
      success: true,
      messageId: result.sid,
    }
  } catch (error: any) {
    console.error("Error sending SMS:", error)
    return {
      success: false,
      error: error.message,
    }
  }
}

// Send appointment reminder SMS
export const sendAppointmentReminderSMS = async (
  phoneNumber: string,
  patientName: string,
  doctorName: string,
  date: string,
  time: string,
) => {
  const message = `Hello ${patientName}, this is a reminder for your appointment with Dr. ${doctorName} on ${date} at ${time}. Please arrive 10 minutes early. Reply YES to confirm or call us to reschedule.`

  return sendSMS(phoneNumber, message)
}

// Send appointment confirmation SMS
export const sendAppointmentConfirmationSMS = async (
  phoneNumber: string,
  patientName: string,
  doctorName: string,
  date: string,
  time: string,
) => {
  const message = `Hello ${patientName}, your appointment with Dr. ${doctorName} has been confirmed for ${date} at ${time}. Thank you for choosing DentRW.`

  return sendSMS(phoneNumber, message)
}

// Send follow-up reminder SMS
export const sendFollowUpReminderSMS = async (
  phoneNumber: string,
  patientName: string,
  doctorName: string,
  diagnosis: string,
) => {
  const message = `Hello ${patientName}, this is a reminder that you are due for a follow-up appointment with Dr. ${doctorName} regarding your ${diagnosis}. Please call us to schedule your appointment.`

  return sendSMS(phoneNumber, message)
}

// Send medical record notification SMS
export const sendMedicalRecordSMS = async (phoneNumber: string, patientName: string) => {
  const message = `Hello ${patientName}, your dental treatment record has been updated. You can view the details by logging into your patient portal.`

  return sendSMS(phoneNumber, message)
}

// Send appointment cancellation SMS
export const sendAppointmentCancellationSMS = async (
  phoneNumber: string,
  patientName: string,
  doctorName: string,
  date: string,
  time: string,
) => {
  const message = `Hello ${patientName}, your appointment with Dr. ${doctorName} on ${date} at ${time} has been cancelled. Please contact us to reschedule.`

  return sendSMS(phoneNumber, message)
}

