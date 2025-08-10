import mongoose, { Schema, Document, Types } from "mongoose"

export interface RefreshToken extends Document {
  userId: Types.ObjectId
  token: string
  tokenVersion: number
  userAgent?: string
  ipAddress?: string
  expiresAt: Date
  isRevoked: boolean
}

const refreshTokenSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    token: { type: String, required: true },
    tokenVersion: { type: Number, required: true },
    userAgent: { type: String },
    ipAddress: { type: String },
    expiresAt: { type: Date, required: true },
    isRevoked: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
)

// Indexes for faster queries
refreshTokenSchema.index({ userId: 1 })
refreshTokenSchema.index({ token: 1 })
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }) // TTL index for automatic cleanup

const RefreshToken = mongoose.model<RefreshToken>("RefreshToken", refreshTokenSchema)

export default RefreshToken
