import * as speakeasy from "speakeasy"
import * as QRCode from "qrcode"
import { TOTP_WINDOW } from "../config/auth.config"

// Generate TOTP secret
export const generateTOTPSecret = (email: string): { secret: string; otpauth_url: string } => {
  return speakeasy.generateSecret({
    name: `DentRW:${email}`,
    issuer: "DentRW",
  })
}

// Generate QR code for TOTP
export const generateQRCode = async (otpauthUrl: string): Promise<string> => {
  try {
    return await QRCode.toDataURL(otpauthUrl)
  } catch (error) {
    console.error("Error generating QR code:", error)
    throw new Error("Failed to generate QR code")
  }
}

// Verify TOTP token
export const authenticateTOTP = (secret: string, token: string): boolean => {
  return speakeasy.totp.verify({
    secret,
    encoding: "base32",
    token,
    window: TOTP_WINDOW,
  })
}
