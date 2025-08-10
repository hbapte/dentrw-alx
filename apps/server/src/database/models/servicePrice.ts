 
import mongoose, { type Document, type Model, Schema } from "mongoose"

export interface ServicePrice extends Document {
  name: string
  code: string
  description: string
  price: number
  category: string
  duration: number // in minutes
  active: boolean
  taxable: boolean
  taxRate?: number
  createdAt: Date
  updatedAt: Date
}

const servicePriceSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    description: { type: String, default: "" },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    duration: { type: Number, default: 30 }, // Default duration: 30 minutes
    active: { type: Boolean, default: true },
    taxable: { type: Boolean, default: true },
    taxRate: { type: Number, default: 0.18 }, // 18% VAT
  },
  {
    timestamps: true,
  },
)

// Create indexes for better query performance
// servicePriceSchema.index({ code: 1 }, { unique: true })
// servicePriceSchema.index({ name: 1 })
// servicePriceSchema.index({ category: 1 })
// servicePriceSchema.index({ price: 1 })
// servicePriceSchema.index({ active: 1 })

const ServicePrice: Model<ServicePrice> = mongoose.model<ServicePrice>("ServicePrice", servicePriceSchema)

export default ServicePrice
