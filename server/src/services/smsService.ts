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

