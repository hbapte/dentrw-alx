/* eslint-disable @typescript-eslint/no-explicit-any */
import appointmentRepository from "../modules/appointments/repositories/appointmentRepository"
import { sendAppointmentReminderEmail } from "./emailService"
import { sendAppointmentReminderSMS } from "./smsService"
import { format } from "date-fns"

/**
 * Send reminders for upcoming appointments
 */
export const sendAppointmentReminders = async (
  hoursAhead = 24,
): Promise<{
  success: boolean
  emailsSent: number
  smsSent: number
  errors: any[]
}> => {
  try {
    // Get appointments that need reminders
    const appointments = await appointmentRepository.getAppointmentsNeedingReminders(hoursAhead)

    let emailsSent = 0
    let smsSent = 0
    const errors: any[] = []

    // Send reminders for each appointment
    for (const appointment of appointments) {
      try {
        const patient = appointment.patient
        const doctor = appointment.doctor.user

        const patientName = patient.names
        const doctorName = doctor.names
        const appointmentDate = format(new Date(appointment.date), "MMMM dd, yyyy")
        const appointmentTime = appointment.startTime

        // Send email reminder if patient has email
        if (patient.email) {
          await sendAppointmentReminderEmail(
            patient.email,
            patientName,
            doctorName,
            appointmentDate,
            appointmentTime,
            appointment.type,
          )

          // Add email reminder to appointment
          await appointmentRepository.addReminder(appointment._id, {
            type: "email",
            sentAt: new Date(),
            status: "sent",
          })

          emailsSent++
        }

        // Send SMS reminder if patient has phone number
        if (patient.phoneNumber) {
          await sendAppointmentReminderSMS(
            patient.phoneNumber,
            patientName,
            doctorName,
            appointmentDate,
            appointmentTime,
          )

          // Add SMS reminder to appointment
          await appointmentRepository.addReminder(appointment._id, {
            type: "sms",
            sentAt: new Date(),
            status: "sent",
          })

          smsSent++
        }
      } catch (error) {
        errors.push({
          appointmentId: appointment._id,
          error: error instanceof Error ? error.message : "Unknown error",
        })
      }
    }

    return {
      success: true,
      emailsSent,
      smsSent,
      errors,
    }
  } catch (error) {
    console.error("Error sending appointment reminders:", error)
    return {
      success: false,
      emailsSent: 0,
      smsSent: 0,
      errors: [{ error: error instanceof Error ? error.message : "Unknown error" }],
    }
  }
}

/**
 * Check for follow-up appointments that need to be scheduled
 */
export const checkFollowUpNeeds = async (): Promise<{
  success: boolean
  followUpsNeeded: number
  followUpsData: any[]
}> => {
  try {
    // Get medical records that need follow-up
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const medicalRecordRepository = require("../../medicalRecords/repositories/medicalRecordRepository").default
    const followUpRecords = await medicalRecordRepository.getFollowUpRecords(7) // Check for follow-ups in the next 7 days

    const followUpsData = followUpRecords.map((record: { _id: any; patient: { _id: any; names: any }; doctor: { _id: any; user: { names: any } }; followUpDate: any; diagnosis: any }) => ({
      recordId: record._id,
      patientId: record.patient._id,
      patientName: record.patient.names,
      doctorId: record.doctor._id,
      doctorName: record.doctor.user.names,
      followUpDate: record.followUpDate,
      diagnosis: record.diagnosis,
    }))

    return {
      success: true,
      followUpsNeeded: followUpsData.length,
      followUpsData,
    }
  } catch (error) {
    console.error("Error checking follow-up needs:", error)
    return {
      success: false,
      followUpsNeeded: 0,
      followUpsData: [],
    }
  }
}

