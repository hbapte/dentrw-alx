import mongoose, { type Document, type Model, Schema } from "mongoose"

export interface MedicalRecord extends Document {
  patient: mongoose.Types.ObjectId
  doctor: mongoose.Types.ObjectId
  appointment: mongoose.Types.ObjectId
  diagnosis: string
  treatment: string
  prescription: {
    medication: string
    dosage: string
    frequency: string
    duration: string
    notes: string
  }[]
  notes: string
  attachments: {
    name: string
    fileUrl: string
    fileType: string
    uploadedAt: Date
  }[]
  followUpRequired: boolean
  followUpDate?: Date
}

const medicalRecordSchema: Schema = new Schema(
  {
    patient: { type: Schema.Types.ObjectId, ref: "Patient", required: true },
    doctor: { type: Schema.Types.ObjectId, ref: "Doctor", required: true },
    appointment: { type: Schema.Types.ObjectId, ref: "Appointment", required: true },
    diagnosis: { type: String, required: true },
    treatment: { type: String, required: true },
    prescription: [
      {
        medication: { type: String, required: true },
        dosage: { type: String, required: true },
        frequency: { type: String, required: true },
        duration: { type: String, required: true },
        notes: { type: String },
      },
    ],
    notes: { type: String },
    attachments: [
      {
        name: { type: String },
        fileUrl: { type: String },
        fileType: { type: String },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    followUpRequired: { type: Boolean, default: false },
    followUpDate: { type: Date },
  },
  {
    timestamps: true,
  },
)

const MedicalRecord: Model<MedicalRecord> = mongoose.model<MedicalRecord>("MedicalRecord", medicalRecordSchema)

export default MedicalRecord

