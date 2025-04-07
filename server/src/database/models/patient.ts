import mongoose, { type Document, type Model, Schema, type Types } from "mongoose"

export interface Patient extends Document {
  _id: Types.ObjectId
  user: Types.ObjectId
  dateOfBirth?: Date
  gender?: "male" | "female" | "other"
  address?: {
    street?: string
    city?: string
    state?: string
    postalCode?: string
    country?: string
  }
  emergencyContact?: {
    name: string
    relationship: string
    phoneNumber: string
  }
  medicalHistory?: {
    allergies: string[]
    conditions: string[]
    medications: string[]
    notes: string
  }
  insuranceInfo?: {
    provider: string
    policyNumber: string
    groupNumber?: string
    expiryDate?: Date
  }
}

const patientSchema: Schema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    dateOfBirth: { type: Date },
    gender: { type: String, enum: ["male", "female", "other"] },
    address: {
      street: { type: String },
      city: { type: String },
      state: { type: String },
      postalCode: { type: String },
      country: { type: String },
    },
    emergencyContact: {
      name: { type: String },
      relationship: { type: String },
      phoneNumber: { type: String },
    },
    medicalHistory: {
      allergies: [{ type: String }],
      conditions: [{ type: String }],
      medications: [{ type: String }],
      notes: { type: String },
    },
    insuranceInfo: {
      provider: { type: String },
      policyNumber: { type: String },
      groupNumber: { type: String },
      expiryDate: { type: Date },
    },
  },
  {
    timestamps: true,
  },
)

const Patient: Model<Patient> = mongoose.model<Patient>("Patient", patientSchema)

export default Patient

