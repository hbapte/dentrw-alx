import mongoose, { type Document, type Model, Schema } from "mongoose"

export interface Payment extends Document {
  appointment: mongoose.Types.ObjectId
  patient: mongoose.Types.ObjectId
  amount: number
  currency: string
  status: "pending" | "completed" | "failed" | "refunded"
  paymentMethod: "stripe" | "paypal" | "cash"
  transactionId?: string
  invoiceNumber: string
  receiptUrl?: string
  refundAmount?: number
  refundReason?: string
  metadata?: Record<string, any>
}

const paymentSchema: Schema = new Schema(
  {
    appointment: { type: Schema.Types.ObjectId, ref: "Appointment", required: true },
    patient: { type: Schema.Types.ObjectId, ref: "Patient", required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: "RWF" },
    status: {
      type: String,
      enum: ["pending", "completed", "failed", "refunded"],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      enum: ["stripe", "paypal", "cash"],
      required: true,
    },
    transactionId: { type: String },
    invoiceNumber: { type: String, required: true },
    receiptUrl: { type: String },
    refundAmount: { type: Number },
    refundReason: { type: String },
    metadata: { type: Schema.Types.Mixed },
  },
  {
    timestamps: true,
  },
)

const Payment: Model<Payment> = mongoose.model<Payment>("Payment", paymentSchema)

export default Payment

