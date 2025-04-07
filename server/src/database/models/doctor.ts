import mongoose, { type Document, type Model, Schema, type Types } from "mongoose"

export interface Doctor extends Document {
  _id: Types.ObjectId
  user: Types.ObjectId
  specialization: string
  qualifications: string[]
  experience: number // in years
  licenseNumber: string
  bio: string
  languages: string[]
  consultationFee: number
  availability: {
    day: string
    slots: {
      startTime: string
      endTime: string
    }[]
  }[]
  ratings: {
    rating: number
    review: string
    patient: Types.ObjectId
    date: Date
  }[]
  averageRating: number
}

const doctorSchema: Schema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    specialization: { type: String, required: true },
    qualifications: [{ type: String }],
    experience: { type: Number, default: 0 },
    licenseNumber: { type: String, required: true },
    bio: { type: String },
    languages: [{ type: String }],
    consultationFee: { type: Number, required: true },
    availability: [
      {
        day: { type: String, enum: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"] },
        slots: [
          {
            startTime: { type: String },
            endTime: { type: String },
          },
        ],
      },
    ],
    ratings: [
      {
        rating: { type: Number, min: 1, max: 5 },
        review: { type: String },
        patient: { type: Schema.Types.ObjectId, ref: "Patient" },
        date: { type: Date, default: Date.now },
      },
    ],
    averageRating: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  },
)

const Doctor: Model<Doctor> = mongoose.model<Doctor>("Doctor", doctorSchema)

export default Doctor

