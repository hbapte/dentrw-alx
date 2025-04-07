import mongoose, { type Types } from "mongoose"
import type { Request } from "express"

// Define the audit log schema
const auditLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  action: { type: String, required: true },
  entity: { type: String, required: true },
  entityId: { type: mongoose.Schema.Types.ObjectId },
  details: { type: mongoose.Schema.Types.Mixed },
  ipAddress: { type: String },
  userAgent: { type: String },
  timestamp: { type: Date, default: Date.now },
})

// Create the model
const AuditLog = mongoose.model("AuditLog", auditLogSchema)

// Log an action
export const logAction = async (
  req: Request,
  action: string,
  entity: string,
  entityId?: string | Types.ObjectId,
  details?: any,
): Promise<void> => {
  try {
    const userId = req.user?._id

    const log = new AuditLog({
      userId,
      action,
      entity,
      entityId: entityId ? new mongoose.Types.ObjectId(entityId.toString()) : undefined,
      details,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    })

    await log.save()
  } catch (error) {
    console.error("Error logging action:", error)
  }
}

// Get audit logs for a user
export const getUserAuditLogs = async (userId: string | Types.ObjectId, page = 1, limit = 20): Promise<any> => {
  try {
    const skip = (page - 1) * limit

    const logs = await AuditLog.find({ userId }).sort({ timestamp: -1 }).skip(skip).limit(limit)

    const total = await AuditLog.countDocuments({ userId })

    return {
      logs,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    }
  } catch (error) {
    console.error("Error getting user audit logs:", error)
    return {
      logs: [],
      pagination: {
        total: 0,
        page,
        limit,
        pages: 0,
      },
    }
  }
}

// Get audit logs for an entity
export const getEntityAuditLogs = async (
  entity: string,
  entityId: string | Types.ObjectId,
  page = 1,
  limit = 20,
): Promise<any> => {
  try {
    const skip = (page - 1) * limit

    const logs = await AuditLog.find({ entity, entityId })
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .populate("userId", "names email")

    const total = await AuditLog.countDocuments({ entity, entityId })

    return {
      logs,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    }
  } catch (error) {
    console.error("Error getting entity audit logs:", error)
    return {
      logs: [],
      pagination: {
        total: 0,
        page,
        limit,
        pages: 0,
      },
    }
  }
}

