// server\src\database\models\user.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose, { type Document, type Model, Schema, type Types } from "mongoose"
import { comparePasswords, hashPassword } from "../../utils/passwordUtil"

export interface User extends Document {
  _id: Types.ObjectId
  names: string
  email: string
  username?: string
  password?: string
  role: "patient" | "doctor" | "admin" | "receptionist"
  emailVerified: boolean
  emailVerificationToken: string
  emailVerificationTokenCreated: Date
  resetPasswordToken?: string
  resetPasswordExpires?: Date
  googleId?: string
  picture?: string
  picturePublicId?: string
  preferredLanguage: "en" | "fr" | "rw"
  phoneNumber?: string
  phoneVerified: boolean
  lastLogin?: Date
  active: boolean
  totpSecret?: string
  totpEnabled: boolean
  tokenVersion: number
  // Additional fields for dental clinic
  nationalId?: string // Rwanda National ID
  dateOfBirth?: Date
  gender?: "male" | "female" | "other"
  maritalStatus?: "single" | "married" | "divorced" | "widowed"
  occupation?: string
  comparePassword(candidatePassword: string): Promise<boolean>
  incrementTokenVersion(): Promise<number>
}

const userSchema: Schema = new Schema(
  {
    names: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    username: { type: String, unique: true, sparse: true },
    password: { type: String },
    role: { 
      type: String, 
      enum: ["patient", "doctor", "admin", "receptionist"], 
      default: "patient" 
    },
    emailVerified: { type: Boolean, default: false },
    emailVerificationToken: { type: String },
    emailVerificationTokenCreated: { type: Date, default: Date.now },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    googleId: { type: String, unique: true, sparse: true },
    picture: String,
    picturePublicId: String,
    preferredLanguage: { type: String, enum: ["en", "fr", "rw"], default: "en" },
    phoneNumber: { type: String },
    phoneVerified: { type: Boolean, default: false },
    lastLogin: { type: Date },
    active: { type: Boolean, default: true },
    totpSecret: { type: String },
    totpEnabled: { type: Boolean, default: false },
    tokenVersion: { type: Number, default: 0 },
    // Additional fields for dental clinic
    nationalId: { type: String, unique: true, sparse: true },
    dateOfBirth: { type: Date },
    gender: { type: String, enum: ["male", "female", "other"] },
    maritalStatus: { type: String, enum: ["single", "married", "divorced", "widowed"] },
    occupation: { type: String },
  },
  {
    timestamps: true,
  },
)

// Pre-save hook to hash password
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next()
  try {  
    this.password = await hashPassword(this.password as string)
    next()
  } catch (error: any) {
    next(error)
  }
})

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return comparePasswords(candidatePassword, this.password as string)
}

// Method to increment token version
userSchema.methods.incrementTokenVersion = async function (): Promise<number> {
  this.tokenVersion = (this.tokenVersion || 0) + 1
  await this.save()
  return this.tokenVersion
}

const User: Model<User> = mongoose.model<User>("User", userSchema)
export default User
