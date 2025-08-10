// server\src\database\models\doctor.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose, { type Document, type Model, Schema, type Types } from "mongoose"

export interface Doctor extends Document {
  _id: Types.ObjectId
  user: Types.ObjectId

  // Professional Information
  specialization: string[]
  subSpecializations: string[]
  qualifications: {
    degree: string
    institution: string
    year: number
    country: string
  }[]
  experience: number // in years
  licenseNumber: string
  licenseExpiryDate: Date
  registrationNumber: string // Rwanda Medical Council registration

  // Personal Professional Details
  bio: string
  languages: string[]
  consultationFee: {
    initial: number
    followUp: number
    emergency: number
    currency: string
  }

  // Dental Specific Information
  dentalSpecialties: string[]
  procedures: string[]
  equipment: string[]
  certifications: {
    name: string
    issuingBody: string
    issueDate: Date
    expiryDate?: Date
    certificateNumber: string
  }[]

  // Practice Information
  clinicAffiliations: {
    clinicName: string
    role: string
    startDate: Date
    endDate?: Date
    isActive: boolean
  }[]
  workingHours: {
    day: string
    isWorking: boolean
    slots: {
      startTime: string
      endTime: string
      breakStart?: string
      breakEnd?: string
    }[]
  }[]

  // Availability & Scheduling
  availability: {
    day: string
    slots: {
      startTime: string
      endTime: string
      maxPatients: number
      appointmentDuration: number // in minutes
    }[]
  }[]
  timeZone: string
  bookingAdvanceLimit: number // days in advance
  cancellationPolicy: string

  // Professional Network
  professionalMemberships: {
    organization: string
    membershipType: string
    membershipNumber: string
    startDate: Date
    endDate?: Date
    isActive: boolean
  }[]

  // Education & Training
  continuingEducation: {
    courseName: string
    provider: string
    completionDate: Date
    hours: number
    certificateUrl?: string
  }[]

  // Ratings & Reviews
  ratings: {
    rating: number
    review: string
    patient: Types.ObjectId
    appointmentDate: Date
    reviewDate: Date
    isVerified: boolean
    response?: string
    responseDate?: Date
  }[]
  averageRating: number
  totalReviews: number

  // Statistics
  statistics: {
    totalPatients: number
    totalAppointments: number
    completedTreatments: number
    patientSatisfactionRate: number
    averageWaitTime: number // in minutes
  }

  // Preferences
  preferences: {
    appointmentReminders: boolean
    patientCommunication: "email" | "sms" | "both"
    workloadAlerts: boolean
    emergencyAvailability: boolean
    telemedicineEnabled: boolean
    autoConfirmAppointments: boolean
  }

  // Status
  isActive: boolean
  isVerified: boolean
  verificationDate?: Date
  lastActiveDate: Date
  profileCompleteness: number
}

const doctorSchema: Schema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },

    // Professional Information
    specialization: [
      {
        type: String,
        enum: [
          "General Dentistry",
          "Orthodontics",
          "Periodontics",
          "Endodontics",
          "Oral Surgery",
          "Prosthodontics",
          "Pediatric Dentistry",
          "Oral Pathology",
          "Oral Radiology",
          "Cosmetic Dentistry",
          "Implantology",
          "Oral Medicine",
          "Preventive Dentistry",
          "Community Dentistry"

        ],
      },
    ],
    subSpecializations: [{ type: String }],
    qualifications: [
      {
        degree: { type: String, required: true },
        institution: { type: String, required: true },
        year: { type: Number, required: true },
        country: { type: String, default: "Rwanda" },
      },
    ],
    experience: { type: Number, default: 0 },
    licenseNumber: { type: String, required: true, unique: true },
    licenseExpiryDate: { type: Date },
    registrationNumber: { type: String, required: true, unique: true },

    // Personal Professional Details
    bio: { type: String, maxlength: 1000 },
    languages: [
      {
        type: String,
        enum: ["English", "French", "Kinyarwanda", "Swahili", "Other"],
      },
    ],
    consultationFee: {
      initial: { type: Number, required: true },
      followUp: { type: Number, required: true },
      emergency: { type: Number, required: true },
      currency: { type: String, default: "RWF" },
    },

    // Dental Specific Information
    dentalSpecialties: [
      {
        type: String,
        enum: [
          "Teeth Cleaning",
          "Fillings",
          "Root Canal",
          "Crowns & Bridges",
          "Dental Implants",
          "Teeth Whitening",
          "Orthodontic Braces",
          "Invisalign",
          "Oral Surgery",
          "Gum Treatment",
          "Pediatric Care",
          "Emergency Care",
          "Cosmetic Dentistry",
          "Dentures",
          "TMJ Treatment",
        ],
      },
    ],
    procedures: [{ type: String }],
    equipment: [{ type: String }],
    certifications: [
      {
        name: { type: String, required: true },
        issuingBody: { type: String, required: true },
        issueDate: { type: Date, required: true },
        expiryDate: { type: Date },
        certificateNumber: { type: String },
      },
    ],

    // Practice Information
    clinicAffiliations: [
      {
        clinicName: { type: String, required: true },
        role: { type: String, required: true },
        startDate: { type: Date, required: true },
        endDate: { type: Date },
        isActive: { type: Boolean, default: true },
      },
    ],
    workingHours: [
      {
        day: {
          type: String,
          enum: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
          required: true,
        },
        isWorking: { type: Boolean, default: true },
        slots: [
          {
            startTime: { type: String, required: true },
            endTime: { type: String, required: true },
            breakStart: { type: String },
            breakEnd: { type: String },
          },
        ],
      },
    ],

    // Availability & Scheduling
    availability: [
      {
        day: {
          type: String,
          enum: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
        },
        slots: [
          {
            startTime: { type: String, required: true },
            endTime: { type: String, required: true },
            maxPatients: { type: Number, default: 1 },
            appointmentDuration: { type: Number, default: 30 },
          },
        ],
      },
    ],
    timeZone: { type: String, default: "Africa/Kigali" },
    bookingAdvanceLimit: { type: Number, default: 30 },
    cancellationPolicy: { type: String },

    // Professional Network
    professionalMemberships: [
      {
        organization: { type: String, required: true },
        membershipType: { type: String },
        membershipNumber: { type: String },
        startDate: { type: Date, required: true },
        endDate: { type: Date },
        isActive: { type: Boolean, default: true },
      },
    ],

    // Education & Training
    continuingEducation: [
      {
        courseName: { type: String, required: true },
        provider: { type: String, required: true },
        completionDate: { type: Date, required: true },
        hours: { type: Number, required: true },
        certificateUrl: { type: String },
      },
    ],

    // Ratings & Reviews
    ratings: [
      {
        rating: { type: Number, min: 1, max: 5, required: true },
        review: { type: String },
        patient: { type: Schema.Types.ObjectId, ref: "Patient", required: true },
        appointmentDate: { type: Date, required: true },
        reviewDate: { type: Date, default: Date.now },
        isVerified: { type: Boolean, default: false },
        response: { type: String },
        responseDate: { type: Date },
      },
    ],
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    totalReviews: { type: Number, default: 0 },

    // Statistics
    statistics: {
      totalPatients: { type: Number, default: 0 },
      totalAppointments: { type: Number, default: 0 },
      completedTreatments: { type: Number, default: 0 },
      patientSatisfactionRate: { type: Number, default: 0 },
      averageWaitTime: { type: Number, default: 0 },
    },

    // Preferences
    preferences: {
      appointmentReminders: { type: Boolean, default: true },
      patientCommunication: {
        type: String,
        enum: ["email", "sms", "both"],
        default: "both",
      },
      workloadAlerts: { type: Boolean, default: true },
      emergencyAvailability: { type: Boolean, default: false },
      telemedicineEnabled: { type: Boolean, default: false },
      autoConfirmAppointments: { type: Boolean, default: false },
    },

    // Status
    isActive: { type: Boolean, default: true },
    isVerified: { type: Boolean, default: false },
    verificationDate: { type: Date },
    lastActiveDate: { type: Date, default: Date.now },
    profileCompleteness: { type: Number, default: 0, min: 0, max: 100 },
  },
  {
    timestamps: true,
  },
)

// Calculate average rating when ratings are updated
doctorSchema.pre("save", function (this: any, next) {
  if (this.ratings && this.ratings.length > 0) {
    const totalRating = this.ratings.reduce((sum: number, rating: { rating: number }) => sum + rating.rating, 0)
    this.averageRating = totalRating / this.ratings.length
    this.totalReviews = this.ratings.length
  }
  next()
})

// Calculate profile completeness
doctorSchema.pre("save", function (next) {
  let completeness = 0
  const fields = [
    "specialization",
    "qualifications",
    "licenseNumber",
    "bio",
    "languages",
    "consultationFee",
    "dentalSpecialties",
    "workingHours",
  ]

  fields.forEach((field) => {
    if (this[field] && (Array.isArray(this[field]) ? this[field].length > 0 : true)) {
      completeness += 12.5 // 100 / 8 fields
    }
  })

  this.profileCompleteness = Math.round(completeness)
  next()
})

const Doctor: Model<Doctor> = mongoose.model<Doctor>("Doctor", doctorSchema)
export default Doctor
