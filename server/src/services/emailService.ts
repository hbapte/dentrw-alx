import nodemailer from "nodemailer"
import dotenv from "dotenv"

dotenv.config()

// Configure email transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: Number.parseInt(process.env.EMAIL_PORT || "587"),
  secure: process.env.EMAIL_SECURE === "true",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

// Send verification email
export const sendVerificationEmail = async (email: string, token: string, name: string) => {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${token}`

  const mailOptions = {
    from: `"DentRW" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Verify Your Email Address",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Hello ${name},</h2>
        <p>Thank you for registering with DentRW. Please verify your email address by clicking the button below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Verify Email</a>
        </div>
        <p>If the button doesn't work, you can also copy and paste the following link into your browser:</p>
        <p>${verificationUrl}</p>
        <p>This link will expire in 24 hours.</p>
        <p>If you did not create an account, please ignore this email.</p>
        <p>Best regards,<br>The DentRW Team</p>
      </div>
    `,
  }

  return transporter.sendMail(mailOptions)
}

// Send password reset email
export const sendPasswordResetEmail = async (email: string, token: string, name: string) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`

  const mailOptions = {
    from: `"DentRW" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Reset Your Password",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Hello ${name},</h2>
        <p>We received a request to reset your password. Click the button below to create a new password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Reset Password</a>
        </div>
        <p>If the button doesn't work, you can also copy and paste the following link into your browser:</p>
        <p>${resetUrl}</p>
        <p>This link will expire in 1 hour.</p>
        <p>If you did not request a password reset, please ignore this email or contact support.</p>
        <p>Best regards,<br>The DentRW Team</p>
      </div>
    `,
  }

  return transporter.sendMail(mailOptions)
}

// Send appointment confirmation email
export const sendAppointmentConfirmationEmail = async (
  email: string,
  name: string,
  doctorName: string,
  date: string,
  time: string,
  appointmentType: string,
) => {
  const mailOptions = {
    from: `"DentRW" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Appointment Confirmation",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Hello ${name},</h2>
        <p>Your appointment has been confirmed with the following details:</p>
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Doctor:</strong> ${doctorName}</p>
          <p><strong>Date:</strong> ${date}</p>
          <p><strong>Time:</strong> ${time}</p>
          <p><strong>Type:</strong> ${appointmentType}</p>
        </div>
        <p>If you need to reschedule or cancel, please log in to your account or contact us at least 24 hours before your appointment.</p>
        <p>Best regards,<br>The DentRW Team</p>
      </div>
    `,
  }

  return transporter.sendMail(mailOptions)
}

export default sendVerificationEmail

