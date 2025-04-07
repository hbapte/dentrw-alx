import mongoose, { type Document, type Model, Schema, type Types } from "mongoose"
import bcrypt from "bcryptjs"

export interface User extends Document {
  _id: Types.ObjectId
  names: string
  email: string
  username?: string
  password?: string
  role: "patient" | "doctor" | "admin"
  emailVerified: boolean
  emailVerificationToken: string
  emailVerificationTokenCreated: Date
  resetPasswordToken?: string
  resetPasswordExpires?: Date
  googleId?: string
  picture?: string
  preferredLanguage: "en" | "fr" | "rw"
  phoneNumber?: string
  phoneVerified: boolean
  lastLogin?: Date
  active: boolean
  totpSecret?: string
  totpEnabled: boolean
  comparePassword(candidatePassword: string): Promise<boolean>
}

const userSchema: Schema = new Schema(
  {
    names: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    username: { type: String, unique: true, sparse: true },
    password: { type: String },
    role: { type: String, enum: ["patient", "doctor", "admin"], default: "patient" },
    emailVerified: { type: Boolean, default: false },
    emailVerificationToken: { type: String },
    emailVerificationTokenCreated: { type: Date, default: Date.now },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    googleId: { type: String, unique: true, sparse: true }, // sparse: true ensures uniqueness only for non-null values
    picture: String,
    preferredLanguage: { type: String, enum: ["en", "fr", "rw"], default: "en" },
    phoneNumber: { type: String },
    phoneVerified: { type: Boolean, default: false },
    lastLogin: { type: Date },
    active: { type: Boolean, default: true },
    totpSecret: { type: String },
    totpEnabled: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  },
)

// Pre-save hook to hash password
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next()

  try {
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password as string, salt)
    next()
  } catch (error: any) {
    next(error)
  }
})

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password)
}

const User: Model<User> = mongoose.model<User>("User", userSchema)

export default User

