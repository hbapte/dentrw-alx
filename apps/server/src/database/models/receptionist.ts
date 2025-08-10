// server\src\database\models\receptionist.ts
import mongoose, { type Document, type Model, Schema, type Types } from "mongoose"

export interface Receptionist extends Document {
  _id: Types.ObjectId
  user: Types.ObjectId

  // Employment Information
  employeeId: string
  department: string
  position: string
  hireDate: Date
  employmentStatus: "active" | "inactive" | "suspended" | "terminated"
  workSchedule: {
    day: string
    shifts: {
      startTime: string
      endTime: string
      breakTime?: {
        start: string
        end: string
      }
    }[]
  }[]

  // Clinic/Hospital Assignments
  clinicAssignments: {
    clinicId: Types.ObjectId
    clinicName: string
    role: string
    startDate: Date
    endDate?: Date
    isActive: boolean
    permissions: string[]
  }[]

  // Skills and Qualifications
  qualifications: {
    certification: string
    institution: string
    issueDate: Date
    expiryDate?: Date
    certificateNumber?: string
  }[]
  languages: string[]
  computerSkills: string[]
  medicalSoftwareExperience: string[]

  // Performance and Training
  trainingRecords: {
    trainingName: string
    provider: string
    completionDate: Date
    certificateUrl?: string
    expiryDate?: Date
  }[]
  performanceReviews: {
    reviewDate: Date
    reviewer: Types.ObjectId
    rating: number
    comments: string
    goals: string[]
  }[]

  // Access and Permissions
  systemPermissions: {
    module: string
    permissions: string[]
    grantedBy: Types.ObjectId
    grantedDate: Date
  }[]
  accessLevel: "basic" | "intermediate" | "advanced" | "supervisor"

  // Work Statistics
  statistics: {
    totalPatientsRegistered: number
    totalAppointmentsScheduled: number
    totalCallsHandled: number
    averageCallDuration: number
    patientSatisfactionRating: number
    punctualityScore: number
  }

  // Emergency Contact
  emergencyContact: {
    name: string
    relationship: string
    phoneNumber: string
    email?: string
    address?: string
  }

  // Preferences
  preferences: {
    notificationSettings: {
      emailNotifications: boolean
      smsNotifications: boolean
      systemAlerts: boolean
      appointmentReminders: boolean
    }
    workPreferences: {
      preferredShift: "morning" | "afternoon" | "evening" | "night"
      overtimeAvailability: boolean
      weekendAvailability: boolean
      holidayAvailability: boolean
    }
    systemPreferences: {
      defaultLanguage: string
      timeFormat: "12h" | "24h"
      dateFormat: string
      theme: "light" | "dark" | "auto"
    }
  }

  // Status
  isActive: boolean
  lastLogin: Date
  profileCompleteness: number
}

const receptionistSchema: Schema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },

    // Employment Information
    employeeId: { type: String, required: true, unique: true },
    department: { type: String, required: true },
    position: { type: String, required: true },
    hireDate: { type: Date, required: true },
    employmentStatus: {
      type: String,
      enum: ["active", "inactive", "suspended", "terminated"],
      default: "active",
    },
    workSchedule: [
      {
        day: {
          type: String,
          enum: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
        },
        shifts: [
          {
            startTime: { type: String },
            endTime: { type: String },
            breakTime: {
              start: { type: String },
              end: { type: String },
            },
          },
        ],
      },
    ],

    // Clinic Assignments
    clinicAssignments: [
      {
        clinicId: { type: Schema.Types.ObjectId, ref: "Clinic" },
        clinicName: { type: String, required: true },
        role: { type: String, required: true },
        startDate: { type: Date, required: true },
        endDate: { type: Date },
        isActive: { type: Boolean, default: true },
        permissions: [{ type: String }],
      },
    ],

    // Skills and Qualifications
    qualifications: [
      {
        certification: { type: String, required: true },
        institution: { type: String, required: true },
        issueDate: { type: Date, required: true },
        expiryDate: { type: Date },
        certificateNumber: { type: String },
      },
    ],
    languages: [{ type: String }],
    computerSkills: [{ type: String }],
    medicalSoftwareExperience: [{ type: String }],

    // Performance and Training
    trainingRecords: [
      {
        trainingName: { type: String, required: true },
        provider: { type: String, required: true },
        completionDate: { type: Date, required: true },
        certificateUrl: { type: String },
        expiryDate: { type: Date },
      },
    ],
    performanceReviews: [
      {
        reviewDate: { type: Date, required: true },
        reviewer: { type: Schema.Types.ObjectId, ref: "User", required: true },
        rating: { type: Number, min: 1, max: 5, required: true },
        comments: { type: String, required: true },
        goals: [{ type: String }],
      },
    ],

    // Access and Permissions
    systemPermissions: [
      {
        module: { type: String, required: true },
        permissions: [{ type: String }],
        grantedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
        grantedDate: { type: Date, default: Date.now },
      },
    ],
    accessLevel: {
      type: String,
      enum: ["basic", "intermediate", "advanced", "supervisor"],
      default: "basic",
    },

    // Work Statistics
    statistics: {
      totalPatientsRegistered: { type: Number, default: 0 },
      totalAppointmentsScheduled: { type: Number, default: 0 },
      totalCallsHandled: { type: Number, default: 0 },
      averageCallDuration: { type: Number, default: 0 },
      patientSatisfactionRating: { type: Number, default: 0 },
      punctualityScore: { type: Number, default: 0 },
    },

    // Emergency Contact
    emergencyContact: {
      name: { type: String },
      relationship: { type: String },
      phoneNumber: { type: String },
      email: { type: String },
      address: { type: String },
    },

    // Preferences
    preferences: {
      notificationSettings: {
        emailNotifications: { type: Boolean, default: true },
        smsNotifications: { type: Boolean, default: true },
        systemAlerts: { type: Boolean, default: true },
        appointmentReminders: { type: Boolean, default: true },
      },
      workPreferences: {
        preferredShift: {
          type: String,
          enum: ["morning", "afternoon", "evening", "night"],
          default: "morning",
        },
        overtimeAvailability: { type: Boolean, default: false },
        weekendAvailability: { type: Boolean, default: false },
        holidayAvailability: { type: Boolean, default: false },
      },
      systemPreferences: {
        defaultLanguage: { type: String, default: "en" },
        timeFormat: { type: String, enum: ["12h", "24h"], default: "12h" },
        dateFormat: { type: String, default: "DD/MM/YYYY" },
        theme: { type: String, enum: ["light", "dark", "auto"], default: "light" },
      },
    },

    // Status
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date },
    profileCompleteness: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  },
)

// Indexes
// receptionistSchema.index({ user: 1 })
// receptionistSchema.index({ employeeId: 1 })
// receptionistSchema.index({ employmentStatus: 1 })
// receptionistSchema.index({ "clinicAssignments.clinicId": 1 })

const Receptionist: Model<Receptionist> = mongoose.model<Receptionist>("Receptionist", receptionistSchema)
export default Receptionist
