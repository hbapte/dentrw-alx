//  server\src\database\models\admin.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose, { type Document, type Model, Schema, type Types } from "mongoose"

export interface Admin extends Document {
  _id: Types.ObjectId
  user: Types.ObjectId

  // Administrative Information
  adminLevel: "super_admin" | "system_admin" | "clinic_admin" | "department_admin"
  employeeId: string
  department: string
  position: string
  hireDate: Date
  reportingTo?: Types.ObjectId

  // System Access and Permissions
  systemPermissions: {
    module: string
    permissions: string[]
    restrictions?: string[]
    grantedBy: Types.ObjectId
    grantedDate: Date
    expiryDate?: Date
  }[]
  accessLevel: "read" | "write" | "admin" | "super_admin"

  // Managed Entities
  managedClinics: {
    clinicId: Types.ObjectId
    clinicName: string
    role: string
    startDate: Date
    endDate?: Date
    isActive: boolean
  }[]
  managedDepartments: string[]
  managedUsers: {
    userId: Types.ObjectId
    userRole: string
    assignedDate: Date
    isActive: boolean
  }[]

  // Qualifications and Certifications
  qualifications: {
    degree: string
    institution: string
    year: number
    country: string
  }[]
  certifications: {
    name: string
    issuingBody: string
    issueDate: Date
    expiryDate?: Date
    certificateNumber?: string
  }[]

  // Professional Experience
  experience: {
    organization: string
    position: string
    startDate: Date
    endDate?: Date
    responsibilities: string[]
    achievements: string[]
  }[]

  // Security and Audit
  securitySettings: {
    twoFactorEnabled: boolean
    lastPasswordChange: Date
    passwordExpiryDate?: Date
    loginAttempts: number
    lastFailedLogin?: Date
    ipWhitelist: string[]
    sessionTimeout: number
  }
  auditLog: {
    action: string
    module: string
    details: string
    timestamp: Date
    ipAddress: string
    userAgent: string
  }[]

  // System Configuration
  systemConfigurations: {
    configKey: string
    configValue: any
    description: string
    lastModified: Date
    modifiedBy: Types.ObjectId
  }[]

  // Backup and Maintenance
  backupSettings: {
    autoBackupEnabled: boolean
    backupFrequency: "daily" | "weekly" | "monthly"
    backupRetention: number
    lastBackupDate?: Date
    backupLocation: string
  }
  maintenanceSchedule: {
    scheduledDate: Date
    maintenanceType: string
    description: string
    estimatedDuration: number
    status: "scheduled" | "in_progress" | "completed" | "cancelled"
  }[]

  // Analytics and Reporting
  reportingAccess: {
    reportType: string
    accessLevel: "view" | "generate" | "modify"
    grantedDate: Date
  }[]
  dashboardPreferences: {
    widgets: string[]
    layout: string
    refreshInterval: number
    defaultDateRange: string
  }

  // Emergency Contacts and Escalation
  emergencyContacts: {
    name: string
    role: string
    phoneNumber: string
    email: string
    priority: number
  }[]
  escalationMatrix: {
    issueType: string
    severity: "low" | "medium" | "high" | "critical"
    escalateTo: Types.ObjectId
    timeLimit: number
  }[]

  // Preferences
  preferences: {
    notificationSettings: {
      systemAlerts: boolean
      securityAlerts: boolean
      userActivityAlerts: boolean
      systemHealthAlerts: boolean
      backupAlerts: boolean
      maintenanceAlerts: boolean
    }
    workPreferences: {
      workingHours: {
        start: string
        end: string
      }
      timezone: string
      availableForEmergency: boolean
      preferredContactMethod: "email" | "phone" | "sms"
    }
    systemPreferences: {
      defaultLanguage: string
      timeFormat: "12h" | "24h"
      dateFormat: string
      theme: "light" | "dark" | "auto"
      dashboardLayout: string
    }
  }

  // Statistics and Performance
  statistics: {
    totalUsersManaged: number
    totalSystemActions: number
    totalReportsGenerated: number
    averageResponseTime: number
    systemUptimeManaged: number
    issuesResolved: number
  }

  // Status
  isActive: boolean
  lastLogin: Date
  profileCompleteness: number
}

const adminSchema: Schema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },

    // Administrative Information
    adminLevel: {
      type: String,
      enum: ["super_admin", "system_admin", "clinic_admin", "department_admin"],
      required: true,
    },
    employeeId: { type: String, required: true, unique: true },
    department: { type: String, required: true },
    position: { type: String, required: true },
    hireDate: { type: Date, required: true },
    reportingTo: { type: Schema.Types.ObjectId, ref: "User" },

    // System Access and Permissions
    systemPermissions: [
      {
        module: { type: String, required: true },
        permissions: [{ type: String }],
        restrictions: [{ type: String }],
        grantedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
        grantedDate: { type: Date, default: Date.now },
        expiryDate: { type: Date },
      },
    ],
    accessLevel: {
      type: String,
      enum: ["read", "write", "admin", "super_admin"],
      default: "admin",
    },

    // Managed Entities
    managedClinics: [
      {
        clinicId: { type: Schema.Types.ObjectId, ref: "Clinic" },
        clinicName: { type: String, required: true },
        role: { type: String, required: true },
        startDate: { type: Date, required: true },
        endDate: { type: Date },
        isActive: { type: Boolean, default: true },
      },
    ],
    managedDepartments: [{ type: String }],
    managedUsers: [
      {
        userId: { type: Schema.Types.ObjectId, ref: "User" },
        userRole: { type: String, required: true },
        assignedDate: { type: Date, default: Date.now },
        isActive: { type: Boolean, default: true },
      },
    ],

    // Qualifications and Certifications
    qualifications: [
      {
        degree: { type: String, required: true },
        institution: { type: String, required: true },
        year: { type: Number, required: true },
        country: { type: String, default: "Rwanda" },
      },
    ],
    certifications: [
      {
        name: { type: String, required: true },
        issuingBody: { type: String, required: true },
        issueDate: { type: Date, required: true },
        expiryDate: { type: Date },
        certificateNumber: { type: String },
      },
    ],

    // Professional Experience
    experience: [
      {
        organization: { type: String, required: true },
        position: { type: String, required: true },
        startDate: { type: Date, required: true },
        endDate: { type: Date },
        responsibilities: [{ type: String }],
        achievements: [{ type: String }],
      },
    ],

    // Security and Audit
    securitySettings: {
      twoFactorEnabled: { type: Boolean, default: false },
      lastPasswordChange: { type: Date, default: Date.now },
      passwordExpiryDate: { type: Date },
      loginAttempts: { type: Number, default: 0 },
      lastFailedLogin: { type: Date },
      ipWhitelist: [{ type: String }],
      sessionTimeout: { type: Number, default: 3600 },
    },
    auditLog: [
      {
        action: { type: String, required: true },
        module: { type: String, required: true },
        details: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        ipAddress: { type: String },
        userAgent: { type: String },
      },
    ],

    // System Configuration
    systemConfigurations: [
      {
        configKey: { type: String, required: true },
        configValue: { type: Schema.Types.Mixed, required: true },
        description: { type: String },
        lastModified: { type: Date, default: Date.now },
        modifiedBy: { type: Schema.Types.ObjectId, ref: "User" },
      },
    ],

    // Backup and Maintenance
    backupSettings: {
      autoBackupEnabled: { type: Boolean, default: true },
      backupFrequency: {
        type: String,
        enum: ["daily", "weekly", "monthly"],
        default: "daily",
      },
      backupRetention: { type: Number, default: 30 },
      lastBackupDate: { type: Date },
      backupLocation: { type: String, default: "cloud" },
    },
    maintenanceSchedule: [
      {
        scheduledDate: { type: Date, required: true },
        maintenanceType: { type: String, required: true },
        description: { type: String, required: true },
        estimatedDuration: { type: Number, required: true },
        status: {
          type: String,
          enum: ["scheduled", "in_progress", "completed", "cancelled"],
          default: "scheduled",
        },
      },
    ],

    // Analytics and Reporting
    reportingAccess: [
      {
        reportType: { type: String, required: true },
        accessLevel: {
          type: String,
          enum: ["view", "generate", "modify"],
          required: true,
        },
        grantedDate: { type: Date, default: Date.now },
      },
    ],
    dashboardPreferences: {
      widgets: [{ type: String }],
      layout: { type: String, default: "grid" },
      refreshInterval: { type: Number, default: 300 },
      defaultDateRange: { type: String, default: "last_30_days" },
    },

    // Emergency Contacts and Escalation
    emergencyContacts: [
      {
        name: { type: String, required: true },
        role: { type: String, required: true },
        phoneNumber: { type: String, required: true },
        email: { type: String, required: true },
        priority: { type: Number, required: true },
      },
    ],
    escalationMatrix: [
      {
        issueType: { type: String, required: true },
        severity: {
          type: String,
          enum: ["low", "medium", "high", "critical"],
          required: true,
        },
        escalateTo: { type: Schema.Types.ObjectId, ref: "User", required: true },
        timeLimit: { type: Number, required: true },
      },
    ],

    // Preferences
    preferences: {
      notificationSettings: {
        systemAlerts: { type: Boolean, default: true },
        securityAlerts: { type: Boolean, default: true },
        userActivityAlerts: { type: Boolean, default: true },
        systemHealthAlerts: { type: Boolean, default: true },
        backupAlerts: { type: Boolean, default: true },
        maintenanceAlerts: { type: Boolean, default: true },
      },
      workPreferences: {
        workingHours: {
          start: { type: String, default: "08:00" },
          end: { type: String, default: "17:00" },
        },
        timezone: { type: String, default: "Africa/Kigali" },
        availableForEmergency: { type: Boolean, default: true },
        preferredContactMethod: {
          type: String,
          enum: ["email", "phone", "sms"],
          default: "email",
        },
      },
      systemPreferences: {
        defaultLanguage: { type: String, default: "en" },
        timeFormat: { type: String, enum: ["12h", "24h"], default: "24h" },
        dateFormat: { type: String, default: "DD/MM/YYYY" },
        theme: { type: String, enum: ["light", "dark", "auto"], default: "light" },
        dashboardLayout: { type: String, default: "grid" },
      },
    },

    // Statistics and Performance
    statistics: {
      totalUsersManaged: { type: Number, default: 0 },
      totalSystemActions: { type: Number, default: 0 },
      totalReportsGenerated: { type: Number, default: 0 },
      averageResponseTime: { type: Number, default: 0 },
      systemUptimeManaged: { type: Number, default: 0 },
      issuesResolved: { type: Number, default: 0 },
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
// adminSchema.index({ user: 1 })
// adminSchema.index({ employeeId: 1 })
// adminSchema.index({ adminLevel: 1 })
// adminSchema.index({ "managedClinics.clinicId": 1 })

const Admin: Model<Admin> = mongoose.model<Admin>("Admin", adminSchema)
export default Admin
