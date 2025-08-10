// client\src\validations\auth.ts
import { z } from "zod"


/**
 * Validation schema for user registration data
 */

export const registerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
  confirmPassword: z.string().min(6, "Confirm password is required"),
    role: z.enum(["patient", "doctor"], {
        required_error: "Role is required",
    }),     
    phone: z.string().optional(),
    address: z.string().optional()
})

export type RegisterSchema = z.infer<typeof registerSchema>

export const loginSchema = z.object({
    email: z
        .string()
        .min(1, "Email is required")
        .email("Invalid email address"),
    password: z
        .string()
        .min(1, 'Password is required')
        .min(8, 'Password must be 8+ characters')
        .regex(/[A-Z]/, 'Password must contain an uppercase letter')
        .regex(/[a-z]/, 'Password must contain a lowercase letter')
        .regex(/\d/, 'Password must contain a number')
        .regex(/[^a-zA-Z0-9]/, 'Password must contain a special character')
        .max(16, 'Password must be at most 16 characters'),
});

export type LoginSchema = z.infer<typeof loginSchema>
