// server\src\database\models\patient.ts
import mongoose, { type Document, type Model, Schema, type Types } from "mongoose"

export interface Patient extends Document {
  _id: Types.ObjectId
  user: Types.ObjectId
  // Personal Information
  dateOfBirth?: Date
  gender?: "male" | "female" | "other"
  nationalId?: string
  maritalStatus?: "single" | "married" | "divorced" | "widowed"
  occupation?: string
  
  // Contact Information
  address?: {
    street?: string
    sector?: string // Rwanda administrative division
    cell?: string   // Rwanda administrative division
    village?: string // Rwanda administrative division
    district?: string
    province?: string
    country?: string
    postalCode?: string
  }
  
  emergencyContact?: {
    name: string
    relationship: string
    phoneNumber: string
    email?: string
    address?: string
  }
  
  // Dental-specific Medical History
  dentalHistory?: {
    previousDentist?: string
    lastDentalVisit?: Date
    reasonForLastVisit?: string
    currentComplaints?: string[]
    painLevel?: number // 1-10 scale
    sensitivityToHotCold?: boolean
    bleedingGums?: boolean
    badBreath?: boolean
    teethGrinding?: boolean
    jawPain?: boolean
  }
  
  // General Medical History
  medicalHistory?: {
    allergies: string[]
    chronicConditions: string[]
    currentMedications: string[]
    surgicalHistory: string[]
    familyMedicalHistory?: string
    smokingStatus?: "never" | "former" | "current"
    alcoholConsumption?: "never" | "occasional" | "regular" | "heavy"
    pregnancyStatus?: "not_applicable" | "not_pregnant" | "pregnant" | "breastfeeding"
    notes?: string
  }
  
  // Insurance Information
  insuranceInfo?: {
    hasInsurance: boolean
    provider?: string
    policyNumber?: string
    groupNumber?: string
    expiryDate?: Date
    coverageType?: "basic" | "comprehensive" | "premium"
    coverageDetails?: string
    copayAmount?: number
  }
  
  // Dental Preferences
  preferences?: {
    preferredAppointmentTime?: "morning" | "afternoon" | "evening"
    communicationPreference?: "phone" | "email" | "sms"
    reminderPreference?: boolean
    treatmentPreferences?: string[]
    anxietyLevel?: "low" | "moderate" | "high"
    specialNeeds?: string
  }
  
  // Clinical Notes (for staff use)
  clinicalNotes?: {
    riskAssessment?: "low" | "moderate" | "high"
    treatmentPlan?: string
    followUpInstructions?: string
    staffNotes?: string
  }
}

const patientSchema: Schema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    
    // Personal Information
    dateOfBirth: { type: Date },
    gender: { type: String, enum: ["male", "female", "other"] },
    nationalId: { type: String, unique: true, sparse: true },
    maritalStatus: { type: String, enum: ["single", "married", "divorced", "widowed"] },
    occupation: { type: String },
    
    // Contact Information
    address: {
      street: { type: String },
      sector: { type: String },
      cell: { type: String },
      village: { type: String },
      district: { type: String },
      province: { type: String },
      country: { type: String, default: "Rwanda" },
      postalCode: { type: String },
    },
    
    emergencyContact: {
      name: { type: String },
      relationship: { type: String },
      phoneNumber: { type: String },
      email: { type: String },
      address: { type: String },
    },
    
    // Dental-specific Medical History
    dentalHistory: {
      previousDentist: { type: String },
      lastDentalVisit: { type: Date },
      reasonForLastVisit: { type: String },
      currentComplaints: [{ type: String }],
      painLevel: { type: Number, min: 0, max: 10 },
      sensitivityToHotCold: { type: Boolean, default: false },
      bleedingGums: { type: Boolean, default: false },
      badBreath: { type: Boolean, default: false },
      teethGrinding: { type: Boolean, default: false },
      jawPain: { type: Boolean, default: false },
    },
    
    // General Medical History
    medicalHistory: {
      allergies: [{ type: String }],
      chronicConditions: [{ type: String }],
      currentMedications: [{ type: String }],
      surgicalHistory: [{ type: String }],
      familyMedicalHistory: { type: String },
      smokingStatus: { type: String, enum: ["never", "former", "current"] },
      alcoholConsumption: { type: String, enum: ["never", "occasional", "regular", "heavy"] },
      pregnancyStatus: { 
        type: String, 
        enum: ["not_applicable", "not_pregnant", "pregnant", "breastfeeding"] 
      },
      notes: { type: String },
    },
    
    // Insurance Information
    insuranceInfo: {
      hasInsurance: { type: Boolean, default: false },
      provider: { type: String },
      policyNumber: { type: String },
      groupNumber: { type: String },
      expiryDate: { type: Date },
      coverageType: { type: String, enum: ["basic", "comprehensive", "premium"] },
      coverageDetails: { type: String },
      copayAmount: { type: Number },
    },
    
    // Dental Preferences
    preferences: {
      preferredAppointmentTime: { type: String, enum: ["morning", "afternoon", "evening"] },
      communicationPreference: { type: String, enum: ["phone", "email", "sms"] },
      reminderPreference: { type: Boolean, default: true },
      treatmentPreferences: [{ type: String }],
      anxietyLevel: { type: String, enum: ["low", "moderate", "high"] },
      specialNeeds: { type: String },
    },
    
    // Clinical Notes (for staff use)
    clinicalNotes: {
      riskAssessment: { type: String, enum: ["low", "moderate", "high"] },
      treatmentPlan: { type: String },
      followUpInstructions: { type: String },
      staffNotes: { type: String },
    },
  },
  {
    timestamps: true,
  },
)

const Patient: Model<Patient> = mongoose.model<Patient>("Patient", patientSchema)
export default Patient
