import mongoose, { Schema, Document, Types } from "mongoose"

export interface Token extends Document {
  userId: Types.ObjectId
  refreshToken: string
  tokenVersion: number
  userAgent?: string
  ipAddress?: string
  expiresAt: Date
  isRevoked: boolean
}

const tokenSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    refreshToken: { type: String, required: true },
    tokenVersion: { type: Number, default: 0 },
    userAgent: { type: String },
    ipAddress: { type: String },
    expiresAt: { type: Date, required: true },
    isRevoked: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
)

// Index for faster queries and automatic cleanup
tokenSchema.index({ userId: 1 })
tokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }) // TTL index for automatic cleanup

const TokenModel = mongoose.model<Token>("Token", tokenSchema)

export default TokenModel
