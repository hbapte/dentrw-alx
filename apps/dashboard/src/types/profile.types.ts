/* eslint-disable @typescript-eslint/no-explicit-any */
export interface UserProfileData {
  names?: string
  username?: string
  phoneNumber?: string
  preferredLanguage?: "en" | "fr" | "rw"
  nationalId?: string
  dateOfBirth?: string
  gender?: "male" | "female" | "other"
  maritalStatus?: "single" | "married" | "divorced" | "widowed"
  occupation?: string
}

export interface PatientProfileData {
  // Personal Information
  dateOfBirth?: string
  gender?: "male" | "female" | "other"
  nationalId?: string
  maritalStatus?: "single" | "married" | "divorced" | "widowed"
  occupation?: string

  // Address Information
  address?: {
    street?: string
    sector?: string
    cell?: string
    village?: string
    district?: string
    province?: string
    country?: string
    postalCode?: string
  }

  // Emergency Contact
  emergencyContact?: {
    name?: string
    relationship?: string
    phoneNumber?: string
    email?: string
    address?: string
  }

  // Dental History
  dentalHistory?: {
    previousDentist?: string
    lastDentalVisit?: string
    reasonForLastVisit?: string
    currentComplaints?: string[]
    painLevel?: number
    sensitivityToHotCold?: boolean
    bleedingGums?: boolean
    badBreath?: boolean
    teethGrinding?: boolean
    jawPain?: boolean
  }

  // Medical History
  medicalHistory?: {
    allergies?: string[]
    chronicConditions?: string[]
    currentMedications?: string[]
    surgicalHistory?: string[]
    familyMedicalHistory?: string
    smokingStatus?: "never" | "former" | "current"
    alcoholConsumption?: "never" | "occasional" | "regular" | "heavy"
    pregnancyStatus?: "not_applicable" | "not_pregnant" | "pregnant" | "breastfeeding"
    notes?: string
  }

  // Insurance Information
  insuranceInfo?: {
    hasInsurance?: boolean
    provider?: string
    policyNumber?: string
    groupNumber?: string
    expiryDate?: string
    coverageType?: "basic" | "comprehensive" | "premium"
    coverageDetails?: string
    copayAmount?: number
  }

  // Preferences
  preferences?: {
    preferredAppointmentTime?: "morning" | "afternoon" | "evening"
    communicationPreference?: "phone" | "email" | "sms"
    reminderPreference?: boolean
    treatmentPreferences?: string[]
    anxietyLevel?: "low" | "moderate" | "high"
    specialNeeds?: string
  }
}

export interface DoctorProfileData {
  // Professional Information
  specialization?: string[]
  subSpecializations?: string[]
  experience?: number
  licenseNumber?: string
  licenseExpiryDate?: string
  registrationNumber?: string

  // Personal Details
  bio?: string
  languages?: string[]

  // Consultation Fees
  consultationFee?: {
    initial?: number
    followUp?: number
    emergency?: number
    currency?: string
  }

  // Dental Specialties
  dentalSpecialties?: string[]
  procedures?: string[]

  // Qualifications
  qualifications?: {
    degree: string
    institution: string
    year: number
    country: string
  }[]

  // Certifications
  certifications?: {
    name: string
    issuingBody: string
    issueDate: string
    expiryDate?: string
    certificateNumber?: string
  }[]

  // Practice Information
  clinicAffiliations?: {
    clinicName: string
    role: string
    startDate: string
    endDate?: string
    isActive: boolean
  }[]

  // Availability & Scheduling
  availability?: {
    day: string
    slots: {
      startTime: string
      endTime: string
      maxPatients: number
      appointmentDuration: number
    }[]
  }[]
  bookingAdvanceLimit?: number
  cancellationPolicy?: string

  // Professional Network
  professionalMemberships?: {
    organization: string
    membershipType: string
    membershipNumber: string
    startDate: string
    endDate?: string
    isActive: boolean
  }[]

  // Preferences
  preferences?: {
    appointmentReminders?: boolean
    patientCommunication?: "email" | "sms" | "both"
    workloadAlerts?: boolean
    emergencyAvailability?: boolean
    telemedicineEnabled?: boolean
    autoConfirmAppointments?: boolean
  }

  // Statistics
  statistics?: {
    totalPatients?: number
    totalAppointments?: number
    completedTreatments?: number
    patientSatisfactionRate?: number
    averageWaitTime?: number
  }

  // Status
  isActive?: boolean
  isVerified?: boolean
  profileCompleteness?: number
}

export interface AdminProfileData {
  // Professional Information
  department?: string
  position?: string
  employeeId?: string
  startDate?: string
  endDate?: string
  isActive?: boolean

  // Personal Details
  bio?: string
  languages?: string[]

  // System Access & Permissions
  systemAccess?: {
    modules?: string[]
    permissions?: string[]
    accessLevel?: "full" | "limited" | "read_only"
    lastLogin?: string
    loginCount?: number
  }

  // Administrative Responsibilities
  responsibilities?: {
    userManagement?: boolean
    systemConfiguration?: boolean
    reportGeneration?: boolean
    dataBackup?: boolean
    securityManagement?: boolean
    auditLogs?: boolean
    clinicManagement?: boolean
    staffManagement?: boolean
  }

  // Contact Information
  workContact?: {
    officePhone?: string
    extension?: string
    workEmail?: string
    department?: string
    officeLocation?: string
  }

  // Emergency Contact
  emergencyContact?: {
    name?: string
    relationship?: string
    phoneNumber?: string
    email?: string
    address?: string
  }

  // Qualifications
  qualifications?: {
    degree: string
    institution: string
    year: number
    country: string
    field: string
  }[]

  // Certifications
  certifications?: {
    name: string
    issuingBody: string
    issueDate: string
    expiryDate?: string
    certificateNumber?: string
    category: string
  }[]

  // Work Schedule
  workSchedule?: {
    day: string
    startTime: string
    endTime: string
    isWorkingDay: boolean
  }[]

  // Preferences
  preferences?: {
    dashboardLayout?: "compact" | "detailed" | "custom"
    notificationFrequency?: "immediate" | "hourly" | "daily"
    reportFormat?: "pdf" | "excel" | "both"
    systemTheme?: "light" | "dark" | "auto"
    autoLogout?: number
    twoFactorAuth?: boolean
  }

  // Statistics
  statistics?: {
    totalUsersManaged?: number
    systemUptime?: number
    reportsGenerated?: number
    issuesResolved?: number
    lastSystemUpdate?: string
  }
}

export interface ReceptionistProfileData {
  // Professional Information
  department?: string
  position?: string
  employeeId?: string
  startDate?: string
  endDate?: string
  isActive?: boolean
  shift?: "morning" | "afternoon" | "evening" | "night" | "rotating"

  // Personal Details
  bio?: string
  languages?: string[]

  // Work Responsibilities
  responsibilities?: {
    appointmentScheduling?: boolean
    patientRegistration?: boolean
    phoneManagement?: boolean
    paymentProcessing?: boolean
    insuranceVerification?: boolean
    recordsManagement?: boolean
    frontDeskOperations?: boolean
    patientCommunication?: boolean
  }

  // Contact Information
  workContact?: {
    deskPhone?: string
    extension?: string
    workEmail?: string
    department?: string
    deskLocation?: string
  }

  // Emergency Contact
  emergencyContact?: {
    name?: string
    relationship?: string
    phoneNumber?: string
    email?: string
    address?: string
  }

  // Skills & Training
  skills?: {
    computerSkills?: string[]
    softwareKnowledge?: string[]
    languageProficiency?: {
      language: string
      level: "basic" | "intermediate" | "advanced" | "native"
    }[]
    customerServiceTraining?: boolean
    medicalTerminology?: boolean
    insuranceKnowledge?: boolean
  }

  // Work Schedule
  workSchedule?: {
    day: string
    startTime: string
    endTime: string
    isWorkingDay: boolean
    breakTimes?: {
      startTime: string
      endTime: string
      type: "lunch" | "break"
    }[]
  }[]

  // Performance Metrics
  performance?: {
    appointmentsScheduled?: number
    patientsRegistered?: number
    callsHandled?: number
    customerSatisfactionRating?: number
    averageCallDuration?: number
    punctualityScore?: number
  }

  // Preferences
  preferences?: {
    workstationSetup?: "single_monitor" | "dual_monitor" | "custom"
    notificationSound?: boolean
    appointmentReminders?: boolean
    patientCommunicationMethod?: "phone" | "email" | "sms" | "all"
    systemShortcuts?: boolean
    autoSaveInterval?: number
    printSettings?: {
      defaultPrinter?: string
      paperSize?: "A4" | "Letter"
      orientation?: "portrait" | "landscape"
    }
  }

  // Training & Development
  training?: {
    completedCourses?: {
      courseName: string
      completionDate: string
      certificateNumber?: string
      validUntil?: string
    }[]
    upcomingTraining?: {
      courseName: string
      scheduledDate: string
      mandatory: boolean
    }[]
    skillAssessments?: {
      skill: string
      level: "beginner" | "intermediate" | "advanced"
      lastAssessed: string
    }[]
  }

  // Statistics
  statistics?: {
    totalAppointmentsBooked?: number
    totalPatientsServed?: number
    averageServiceTime?: number
    customerCompliments?: number
    issuesResolved?: number
    workingDays?: number
  }
}

export interface PasswordData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export interface SetPasswordData {
  newPassword: string
  confirmPassword: string
}

export interface ProfileError {
  status?: number
  message: string
  details?: any
}
