import bcrypt from "bcryptjs"
import crypto from "crypto"

// Hash a password
export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10)
  return bcrypt.hash(password, salt)
}

// Compare a password with a hash
export const comparePasswords = async (password: string, hashedPassword: string): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword)
}

// Generate a random password
export const generateRandomPassword = (length = 12): string => {
  const uppercaseChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
  const lowercaseChars = "abcdefghijklmnopqrstuvwxyz"
  const numberChars = "0123456789"
  const specialChars = "!@#$%^&*()_+~`|}{[]:;?><,./-="

  const allChars = uppercaseChars + lowercaseChars + numberChars + specialChars

  // Ensure at least one of each type
  let password = ""
  password += uppercaseChars.charAt(Math.floor(Math.random() * uppercaseChars.length))
  password += lowercaseChars.charAt(Math.floor(Math.random() * lowercaseChars.length))
  password += numberChars.charAt(Math.floor(Math.random() * numberChars.length))
  password += specialChars.charAt(Math.floor(Math.random() * specialChars.length))

  // Fill the rest randomly
  for (let i = 4; i < length; i++) {
    password += allChars.charAt(Math.floor(Math.random() * allChars.length))
  }

  // Shuffle the password
  return password
    .split("")
    .sort(() => 0.5 - Math.random())
    .join("")
}

// Generate a secure token
export const generateSecureToken = (length = 32): string => {
  return crypto.randomBytes(length).toString("hex")
}

// Check password strength
export const checkPasswordStrength = (
  password: string,
): {
  score: number
  feedback: string
} => {
  let score = 0
  const feedback = []

  // Length check
  if (password.length < 8) {
    feedback.push("Password should be at least 8 characters long.")
  } else {
    score += 1
  }

  // Uppercase check
  if (!/[A-Z]/.test(password)) {
    feedback.push("Password should contain at least one uppercase letter.")
  } else {
    score += 1
  }

  // Lowercase check
  if (!/[a-z]/.test(password)) {
    feedback.push("Password should contain at least one lowercase letter.")
  } else {
    score += 1
  }

  // Number check
  if (!/[0-9]/.test(password)) {
    feedback.push("Password should contain at least one number.")
  } else {
    score += 1
  }

  // Special character check
  if (!/[^A-Za-z0-9]/.test(password)) {
    feedback.push("Password should contain at least one special character.")
  } else {
    score += 1
  }

  return {
    score, // 0-5 scale
    feedback: feedback.join(" "),
  }
}

