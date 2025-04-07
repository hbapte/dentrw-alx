import mongoose, { type Document, type Model, Schema } from "mongoose"

export interface Appointment extends Document {
  patient: mongoose.Types.ObjectId
  doctor: mongoose.Types.ObjectId
  date: Date
  startTime: string
  endTime: string
  status: "scheduled" | "confirmed" | "completed" | "cancelled" | "no-show"
  type: "consultation" | "checkup" | "treatment" | "follow-up"
  notes: string
  reason: string
  payment?: mongoose.Types.ObjectId
  reminders: {
    type: "email" | "sms"
    sentAt: Date
    status: "sent" | "failed"
  }[]
}

const appointmentSchema: Schema = new Schema(
  {
    patient: { type: Schema.Types.ObjectId, ref: "Patient", required: true },
    doctor: { type: Schema.Types.ObjectId, ref: "Doctor", required: true },
    date: { type: Date, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    status: {
      type: String,
      enum: ["scheduled", "confirmed", "completed", "cancelled", "no-show"],
      default: "scheduled",
    },
    type: {
      type: String,
      enum: ["consultation", "checkup", "treatment", "follow-up"],
      required: true,
    },
    notes: { type: String },
    reason: { type: String, required: true },
    payment: { type: Schema.Types.ObjectId, ref: "Payment" },
    reminders: [
      {
        type: { type: String, enum: ["email", "sms"] },
        sentAt: { type: Date },
        status: { type: String, enum: ["sent", "failed"] },
      },
    ],
  },
  {
    timestamps: true,
  },
)

const Appointment: Model<Appointment> = mongoose.model<Appointment>("Appointment", appointmentSchema)

export default Appointment

