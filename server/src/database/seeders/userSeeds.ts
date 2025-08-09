/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose from "mongoose"
import User from "../models/user"
import Patient from "../models/patient"
import Doctor from "../models/doctor"
import Admin from "../models/admin"
import Receptionist from "../models/receptionist"
import dotenv from "dotenv"
import MedicalRecord from "../models/medicalRecord"
import Payment from "../models/payment"
import Appointment from "../models/appointment"
import { v4 as uuidv4 } from "uuid"
// import { hashPassword } from "../../utils/passwordUtil"

dotenv.config()

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_DEV_URI || "mongodb://localhost:27017/dentRW")
    console.log("MongoDB connected for seeding")
  } catch (error) {
    console.error("MongoDB connection error:", error)
    process.exit(1)
  }
}

// Clear all collections
const clearCollections = async () => {
  try {
    await User.deleteMany({})
    await Patient.deleteMany({})
    await Doctor.deleteMany({})
    await Admin.deleteMany({})
    await Receptionist.deleteMany({})

    console.log("All collections cleared")
  } catch (error) {
    console.error("Error clearing collections:", error)
  }
}

// Seed users
const seedUsers = async () => {
  try {
    const hashedPassword = "Password123!"

    // Create admin users
    const admins = [
      {
        names: "Super Admin",
        email: "superadmin@dentrw.com",
        username: "superadmin",
        password: hashedPassword,
        role: "admin",
        emailVerified: true,
        preferredLanguage: "en",
        phoneNumber: "+250700000000",
        phoneVerified: true,
        active: true,
        nationalId: "1198012345678901",
        dateOfBirth: new Date(1985, 5, 15),
        gender: "male",
        maritalStatus: "married",
        occupation: "System Administrator",
      },
      {
        names: "Clinic Admin",
        email: "clinicadmin@dentrw.com",
        username: "clinicadmin",
        password: hashedPassword,
        role: "admin",
        emailVerified: true,
        preferredLanguage: "en",
        phoneNumber: "+250700000001",
        phoneVerified: true,
        active: true,
        nationalId: "1198012345678902",
        dateOfBirth: new Date(1988, 3, 22),
        gender: "female",
        maritalStatus: "single",
        occupation: "Healthcare Administrator",
      },
    ]

    const createdAdmins = []
    for (const adminData of admins) {
      const admin = new User(adminData)
      await admin.save()
      createdAdmins.push(admin)
    }

    // Create doctor users
    const doctors = [
      {
        names: "Dr. Jean Mugisha",
        email: "jean.mugisha@dentrw.com",
        username: "jmugisha",
        password: hashedPassword,
        role: "doctor",
        emailVerified: true,
        preferredLanguage: "en",
        phoneNumber: "+250700000010",
        phoneVerified: true,
        active: true,
        nationalId: "1198012345678910",
        dateOfBirth: new Date(1980, 8, 10),
        gender: "male",
        maritalStatus: "married",
        occupation: "Dentist",
      },
      {
        names: "Dr. Marie Uwase",
        email: "marie.uwase@dentrw.com",
        username: "muwase",
        password: hashedPassword,
        role: "doctor",
        emailVerified: true,
        preferredLanguage: "fr",
        phoneNumber: "+250700000011",
        phoneVerified: true,
        active: true,
        nationalId: "1198012345678911",
        dateOfBirth: new Date(1982, 11, 5),
        gender: "female",
        maritalStatus: "single",
        occupation: "Orthodontist",
      },
      {
        names: "Dr. Robert Karemera",
        email: "robert.karemera@dentrw.com",
        username: "rkaremera",
        password: hashedPassword,
        role: "doctor",
        emailVerified: true,
        preferredLanguage: "rw",
        phoneNumber: "+250700000012",
        phoneVerified: true,
        active: true,
        nationalId: "1198012345678912",
        dateOfBirth: new Date(1978, 2, 18),
        gender: "male",
        maritalStatus: "divorced",
        occupation: "Oral Surgeon",
      },
    ]

    const createdDoctors = []
    for (const doctorData of doctors) {
      const doctor = new User(doctorData)
      await doctor.save()
      createdDoctors.push(doctor)
    }

    // Create receptionist users
    const receptionists = [
      {
        names: "Grace Mukamana",
        email: "grace.mukamana@dentrw.com",
        username: "gmukamana",
        password: hashedPassword,
        role: "receptionist",
        emailVerified: true,
        preferredLanguage: "en",
        phoneNumber: "+250700000020",
        phoneVerified: true,
        active: true,
        nationalId: "1198012345678920",
        dateOfBirth: new Date(1990, 6, 12),
        gender: "female",
        maritalStatus: "single",
        occupation: "Medical Receptionist",
      },
      {
        names: "Paul Niyonzima",
        email: "paul.niyonzima@dentrw.com",
        username: "pniyonzima",
        password: hashedPassword,
        role: "receptionist",
        emailVerified: true,
        preferredLanguage: "rw",
        phoneNumber: "+250700000021",
        phoneVerified: true,
        active: true,
        nationalId: "1198012345678921",
        dateOfBirth: new Date(1992, 9, 8),
        gender: "male",
        maritalStatus: "married",
        occupation: "Front Desk Coordinator",
      },
    ]

    const createdReceptionists = []
    for (const receptionistData of receptionists) {
      const receptionist = new User(receptionistData)
      await receptionist.save()
      createdReceptionists.push(receptionist)
    }

    // Create patient users
    const patients = [
      {
        names: "Alice Mutesi",
        email: "alice.mutesi@example.com",
        username: "amutesi",
        password: hashedPassword,
        role: "patient",
        emailVerified: true,
        preferredLanguage: "en",
        phoneNumber: "+250700000030",
        phoneVerified: true,
        active: true,
        nationalId: "1198012345678930",
        dateOfBirth: new Date(1995, 4, 20),
        gender: "female",
        maritalStatus: "single",
        occupation: "Teacher",
      },
      {
        names: "John Nkusi",
        email: "john.nkusi@example.com",
        username: "jnkusi",
        password: hashedPassword,
        role: "patient",
        emailVerified: true,
        preferredLanguage: "fr",
        phoneNumber: "+250700000031",
        phoneVerified: true,
        active: true,
        nationalId: "1198012345678931",
        dateOfBirth: new Date(1987, 1, 14),
        gender: "male",
        maritalStatus: "married",
        occupation: "Engineer",
      },
      {
        names: "Sarah Uwimana",
        email: "sarah.uwimana@example.com",
        username: "suwimana",
        password: hashedPassword,
        role: "patient",
        emailVerified: true,
        preferredLanguage: "rw",
        phoneNumber: "+250700000032",
        phoneVerified: true,
        active: true,
        nationalId: "1198012345678932",
        dateOfBirth: new Date(1993, 7, 3),
        gender: "female",
        maritalStatus: "single",
        occupation: "Nurse",
      },
      {
        names: "Eric Habimana",
        email: "eric.habimana@example.com",
        username: "ehabimana",
        password: hashedPassword,
        role: "patient",
        emailVerified: true,
        preferredLanguage: "en",
        phoneNumber: "+250700000033",
        phoneVerified: true,
        active: true,
        nationalId: "1198012345678933",
        dateOfBirth: new Date(1991, 10, 25),
        gender: "male",
        maritalStatus: "married",
        occupation: "Business Analyst",
      },
      {
        names: "Diane Uwizeyimana",
        email: "diane.uwizeyimana@example.com",
        username: "duwizeyimana",
        password: hashedPassword,
        role: "patient",
        emailVerified: true,
        preferredLanguage: "fr",
        phoneNumber: "+250700000034",
        phoneVerified: true,
        active: true,
        nationalId: "1198012345678934",
        dateOfBirth: new Date(1989, 12, 7),
        gender: "female",
        maritalStatus: "divorced",
        occupation: "Marketing Manager",
      },
    ]

    const createdPatients = []
    for (const patientData of patients) {
      const patient = new User(patientData)
      await patient.save()
      createdPatients.push(patient)
    }

    console.log("Users seeded successfully")
    return {
      admins: createdAdmins,
      doctors: createdDoctors,
      receptionists: createdReceptionists,
      patients: createdPatients,
    }
  } catch (error) {
    console.error("Error seeding users:", error)
    throw error
  }
}

// Seed admin profiles
const seedAdminProfiles = async (admins: any[]) => {
  try {
    const adminProfiles = []

    for (let i = 0; i < admins.length; i++) {
      const admin = admins[i]
      const isSuperAdmin = i === 0

      const adminProfile = new Admin({
        user: admin._id,
        adminLevel: isSuperAdmin ? "super_admin" : "clinic_admin",
        employeeId: `ADM-${1000 + i}`,
        department: isSuperAdmin ? "IT & Systems" : "Healthcare Administration",
        position: isSuperAdmin ? "Super Administrator" : "Clinic Administrator",
        hireDate: new Date(2020 + i, 0, 15),

        systemPermissions: [
          {
            module: "user_management",
            permissions: ["create", "read", "update", "delete"],
            grantedBy: admin._id,
            grantedDate: new Date(),
          },
          {
            module: "appointment_management",
            permissions: ["create", "read", "update", "delete"],
            grantedBy: admin._id,
            grantedDate: new Date(),
          },
          {
            module: "patient_records",
            permissions: isSuperAdmin ? ["create", "read", "update", "delete"] : ["read", "update"],
            grantedBy: admin._id,
            grantedDate: new Date(),
          },
        ],
        accessLevel: isSuperAdmin ? "super_admin" : "admin",

        managedDepartments: isSuperAdmin
          ? ["IT & Systems", "Healthcare Administration", "Reception", "Clinical"]
          : ["Healthcare Administration", "Reception"],

        qualifications: [
          {
            degree: isSuperAdmin ? "Master of Information Technology" : "Bachelor of Healthcare Administration",
            institution: "University of Rwanda",
            year: 2015 + i,
            country: "Rwanda",
          },
        ],

        certifications: [
          {
            name: isSuperAdmin
              ? "Certified Information Systems Security Professional"
              : "Healthcare Management Certification",
            issuingBody: isSuperAdmin ? "ISC2" : "Rwanda Health Ministry",
            issueDate: new Date(2018 + i, 5, 1),
            expiryDate: new Date(2025 + i, 5, 1),
            certificateNumber: `CERT-${2000 + i}`,
          },
        ],

        securitySettings: {
          twoFactorEnabled: isSuperAdmin,
          lastPasswordChange: new Date(),
          loginAttempts: 0,
          sessionTimeout: 3600,
        },

        preferences: {
          notificationSettings: {
            systemAlerts: true,
            securityAlerts: true,
            userActivityAlerts: isSuperAdmin,
            systemHealthAlerts: true,
            backupAlerts: isSuperAdmin,
            maintenanceAlerts: true,
          },
          workPreferences: {
            workingHours: {
              start: "08:00",
              end: "17:00",
            },
            timezone: "Africa/Kigali",
            availableForEmergency: isSuperAdmin,
            preferredContactMethod: "email",
          },
          systemPreferences: {
            defaultLanguage: "en",
            timeFormat: "24h",
            dateFormat: "DD/MM/YYYY",
            theme: "light",
            dashboardLayout: "grid",
          },
        },

        statistics: {
          totalUsersManaged: 0,
          totalSystemActions: 0,
          totalReportsGenerated: 0,
          averageResponseTime: 0,
          systemUptimeManaged: 0,
          issuesResolved: 0,
        },

        isActive: true,
        profileCompleteness: 85,
      })

      await adminProfile.save()
      adminProfiles.push(adminProfile)
    }

    console.log("Admin profiles seeded successfully")
    return adminProfiles
  } catch (error) {
    console.error("Error seeding admin profiles:", error)
    throw error
  }
}

// Seed receptionist profiles
const seedReceptionistProfiles = async (receptionists: any[]) => {
  try {
    const receptionistProfiles = []

    for (let i = 0; i < receptionists.length; i++) {
      const receptionist = receptionists[i]

      const receptionistProfile = new Receptionist({
        user: receptionist._id,
        employeeId: `REC-${3000 + i}`,
        department: "Reception & Patient Services",
        position: i === 0 ? "Senior Receptionist" : "Receptionist",
        hireDate: new Date(2021 + i, 2, 10),
        employmentStatus: "active",

        workSchedule: [
          {
            day: "monday",
            shifts: [
              {
                startTime: "08:00",
                endTime: "17:00",
                breakTime: {
                  start: "12:00",
                  end: "13:00",
                },
              },
            ],
          },
          {
            day: "tuesday",
            shifts: [
              {
                startTime: "08:00",
                endTime: "17:00",
                breakTime: {
                  start: "12:00",
                  end: "13:00",
                },
              },
            ],
          },
          {
            day: "wednesday",
            shifts: [
              {
                startTime: "08:00",
                endTime: "17:00",
                breakTime: {
                  start: "12:00",
                  end: "13:00",
                },
              },
            ],
          },
          {
            day: "thursday",
            shifts: [
              {
                startTime: "08:00",
                endTime: "17:00",
                breakTime: {
                  start: "12:00",
                  end: "13:00",
                },
              },
            ],
          },
          {
            day: "friday",
            shifts: [
              {
                startTime: "08:00",
                endTime: "17:00",
                breakTime: {
                  start: "12:00",
                  end: "13:00",
                },
              },
            ],
          },
        ],

        clinicAssignments: [
          {
            clinicName: "DentRW Main Clinic",
            role: i === 0 ? "Senior Receptionist" : "Receptionist",
            startDate: new Date(2021 + i, 2, 10),
            isActive: true,
            permissions: ["schedule_appointments", "view_patient_info", "handle_payments", "manage_waiting_list"],
          },
        ],

        qualifications: [
          {
            certification: "Medical Reception Certificate",
            institution: "Rwanda Polytechnic",
            issueDate: new Date(2020 + i, 8, 15),
            expiryDate: new Date(2025 + i, 8, 15),
            certificateNumber: `MRC-${4000 + i}`,
          },
        ],

        languages: ["English", "French", "Kinyarwanda"],
        computerSkills: [
          "Microsoft Office Suite",
          "Medical Practice Management Software",
          "Electronic Health Records",
          "Appointment Scheduling Systems",
        ],
        medicalSoftwareExperience: [
          "DentRW Practice Management",
          "Patient Portal Systems",
          "Insurance Processing Software",
        ],

        systemPermissions: [
          {
            module: "appointment_management",
            permissions: ["create", "read", "update"],
            grantedBy: receptionist._id,
            grantedDate: new Date(),
          },
          {
            module: "patient_registration",
            permissions: ["create", "read", "update"],
            grantedBy: receptionist._id,
            grantedDate: new Date(),
          },
        ],
        accessLevel: i === 0 ? "intermediate" : "basic",

        statistics: {
          totalPatientsRegistered: 0,
          totalAppointmentsScheduled: 0,
          totalCallsHandled: 0,
          averageCallDuration: 0,
          patientSatisfactionRating: 0,
          punctualityScore: 0,
        },

        emergencyContact: {
          name: `Emergency Contact ${i + 1}`,
          relationship: "Parent",
          phoneNumber: `+25070000${5000 + i}`,
          email: `emergency${i + 1}@example.com`,
        },

        preferences: {
          notificationSettings: {
            emailNotifications: true,
            smsNotifications: true,
            systemAlerts: true,
            appointmentReminders: true,
          },
          workPreferences: {
            preferredShift: "morning",
            overtimeAvailability: i === 0,
            weekendAvailability: false,
            holidayAvailability: false,
          },
          systemPreferences: {
            defaultLanguage: i === 0 ? "en" : "rw",
            timeFormat: "12h",
            dateFormat: "DD/MM/YYYY",
            theme: "light",
          },
        },

        isActive: true,
        profileCompleteness: 80,
      })

      await receptionistProfile.save()
      receptionistProfiles.push(receptionistProfile)
    }

    console.log("Receptionist profiles seeded successfully")
    return receptionistProfiles
  } catch (error) {
    console.error("Error seeding receptionist profiles:", error)
    throw error
  }
}

// Seed doctor profiles
const seedDoctorProfiles = async (doctors: any[]) => {
  try {
    const doctorProfiles = []

    for (let i = 0; i < doctors.length; i++) {
      const doctor = doctors[i]

      const doctorProfile = new Doctor({
        user: doctor._id,
        specialization: [
          ["General Dentistry", "Preventive Dentistry"],
          ["Orthodontics", "Cosmetic Dentistry"],
          ["Oral Surgery", "Implantology"],
        ][i],
        subSpecializations: [["Restorative Dentistry"], ["Invisalign Treatment"], ["Maxillofacial Surgery"]][i],
        qualifications: [
          {
            degree: "Doctor of Dental Surgery (DDS)",
            institution: "University of Rwanda",
            year: 2005 + i,
            country: "Rwanda",
          },
          {
            degree: "Master of Dental Science",
            institution: "Makerere University",
            year: 2008 + i,
            country: "Uganda",
          },
        ],
        experience: 15 - i * 2,
        licenseNumber: `RW-DENT-${1000 + i}`,
        licenseExpiryDate: new Date(2025, 11, 31),
        registrationNumber: `RMC-${2000 + i}`,

        bio: `Experienced dental professional with ${15 - i * 2} years of practice. Specializes in ${["General Dentistry and Preventive Care", "Orthodontics and Cosmetic Dentistry", "Oral Surgery and Implantology"][i]}. Committed to providing high-quality, patient-centered care.`,

        languages: ["English", "French", "Kinyarwanda"],
        consultationFee: {
          initial: 30000 + i * 10000,
          followUp: 20000 + i * 5000,
          emergency: 50000 + i * 15000,
          currency: "RWF",
        },

        dentalSpecialties: [
          ["Teeth Cleaning", "Fillings", "Root Canal", "Crowns & Bridges"],
          ["Orthodontic Braces", "Invisalign", "Teeth Whitening", "Cosmetic Dentistry"],
          ["Oral Surgery", "Dental Implants", "Emergency Care", "TMJ Treatment"],
        ][i],

        procedures: [
          ["Routine Cleaning", "Cavity Filling", "Root Canal Therapy"],
          ["Braces Installation", "Teeth Alignment", "Cosmetic Bonding"],
          ["Tooth Extraction", "Implant Placement", "Jaw Surgery"],
        ][i],

        certifications: [
          {
            name: "Advanced Restorative Dentistry",
            issuingBody: "International Dental Association",
            issueDate: new Date(2015 + i, 6, 1),
            expiryDate: new Date(2025 + i, 6, 1),
            certificateNumber: `CERT-DENT-${3000 + i}`,
          },
        ],

        workingHours: [
          {
            day: "monday",
            isWorking: true,
            slots: [
              {
                startTime: "09:00",
                endTime: "12:00",
                breakStart: "10:30",
                breakEnd: "10:45",
              },
              {
                startTime: "14:00",
                endTime: "17:00",
                breakStart: "15:30",
                breakEnd: "15:45",
              },
            ],
          },
          {
            day: "tuesday",
            isWorking: true,
            slots: [
              {
                startTime: "09:00",
                endTime: "12:00",
              },
              {
                startTime: "14:00",
                endTime: "17:00",
              },
            ],
          },
          {
            day: "wednesday",
            isWorking: true,
            slots: [
              {
                startTime: "09:00",
                endTime: "12:00",
              },
              {
                startTime: "14:00",
                endTime: "17:00",
              },
            ],
          },
          {
            day: "thursday",
            isWorking: true,
            slots: [
              {
                startTime: "09:00",
                endTime: "12:00",
              },
              {
                startTime: "14:00",
                endTime: "17:00",
              },
            ],
          },
          {
            day: "friday",
            isWorking: true,
            slots: [
              {
                startTime: "09:00",
                endTime: "12:00",
              },
              {
                startTime: "14:00",
                endTime: "16:00",
              },
            ],
          },
          {
            day: "saturday",
            isWorking: i === 0, // Only first doctor works Saturday
            slots:
              i === 0
                ? [
                    {
                      startTime: "09:00",
                      endTime: "13:00",
                    },
                  ]
                : [],
          },
          {
            day: "sunday",
            isWorking: false,
            slots: [],
          },
        ],

        availability: [
          {
            day: "monday",
            slots: [
              {
                startTime: "09:00",
                endTime: "12:00",
                maxPatients: 8,
                appointmentDuration: 30,
              },
              {
                startTime: "14:00",
                endTime: "17:00",
                maxPatients: 6,
                appointmentDuration: 30,
              },
            ],
          },
          {
            day: "tuesday",
            slots: [
              {
                startTime: "09:00",
                endTime: "12:00",
                maxPatients: 8,
                appointmentDuration: 30,
              },
              {
                startTime: "14:00",
                endTime: "17:00",
                maxPatients: 6,
                appointmentDuration: 30,
              },
            ],
          },
          {
            day: "wednesday",
            slots: [
              {
                startTime: "09:00",
                endTime: "12:00",
                maxPatients: 8,
                appointmentDuration: 30,
              },
              {
                startTime: "14:00",
                endTime: "17:00",
                maxPatients: 6,
                appointmentDuration: 30,
              },
            ],
          },
          {
            day: "thursday",
            slots: [
              {
                startTime: "09:00",
                endTime: "12:00",
                maxPatients: 8,
                appointmentDuration: 30,
              },
              {
                startTime: "14:00",
                endTime: "17:00",
                maxPatients: 6,
                appointmentDuration: 30,
              },
            ],
          },
          {
            day: "friday",
            slots: [
              {
                startTime: "09:00",
                endTime: "12:00",
                maxPatients: 8,
                appointmentDuration: 30,
              },
              {
                startTime: "14:00",
                endTime: "16:00",
                maxPatients: 4,
                appointmentDuration: 30,
              },
            ],
          },
        ],

        timeZone: "Africa/Kigali",
        bookingAdvanceLimit: 30,
        cancellationPolicy: "Appointments can be cancelled up to 24 hours in advance without penalty.",

        professionalMemberships: [
          {
            organization: "Rwanda Dental Association",
            membershipType: "Full Member",
            membershipNumber: `RDA-${4000 + i}`,
            startDate: new Date(2010 + i, 0, 1),
            isActive: true,
          },
        ],

        preferences: {
          appointmentReminders: true,
          patientCommunication: "both",
          workloadAlerts: true,
          emergencyAvailability: i === 0, // Only first doctor available for emergencies
          telemedicineEnabled: false,
          autoConfirmAppointments: false,
        },

        statistics: {
          totalPatients: 0,
          totalAppointments: 0,
          completedTreatments: 0,
          patientSatisfactionRate: 0,
          averageWaitTime: 0,
        },

        ratings: [],
        averageRating: 0,
        totalReviews: 0,

        isActive: true,
        isVerified: true,
        verificationDate: new Date(2021, 0, 1),
        lastActiveDate: new Date(),
        profileCompleteness: 95,
      })

      await doctorProfile.save()
      doctorProfiles.push(doctorProfile)
    }

    console.log("Doctor profiles seeded successfully")
    return doctorProfiles
  } catch (error) {
    console.error("Error seeding doctor profiles:", error)
    throw error
  }
}

// Seed patient profiles
const seedPatientProfiles = async (patients: any[]) => {
  try {
    const patientProfiles = []

    for (let i = 0; i < patients.length; i++) {
      const patient = patients[i]

      const patientProfile = new Patient({
        user: patient._id,
        dateOfBirth: new Date(1985 + i, i % 12, (i % 28) + 1),
        gender: i % 2 === 0 ? "female" : "male",
        nationalId: `119801234567893${i}`,
        maritalStatus: ["single", "married", "single", "married", "divorced"][i],
        occupation: ["Teacher", "Engineer", "Nurse", "Business Analyst", "Marketing Manager"][i],

        address: {
          street: `KG ${100 + i} St`,
          sector: `Sector ${i + 1}`,
          cell: `Cell ${i + 1}`,
          village: `Village ${i + 1}`,
          district: "Gasabo",
          province: "Kigali",
          country: "Rwanda",
          postalCode: `0000${i}`,
        },

        emergencyContact: {
          name: `Emergency Contact ${i + 1}`,
          relationship: ["Parent", "Spouse", "Sibling", "Spouse", "Friend"][i],
          phoneNumber: `+25070000${6000 + i}`,
          email: `emergency${i + 1}@example.com`,
          address: `Emergency Address ${i + 1}`,
        },

        dentalHistory: {
          previousDentist: i > 0 ? "Dr. Previous Dentist" : undefined,
          lastDentalVisit: i > 0 ? new Date(2023, i % 12, 15) : undefined,
          reasonForLastVisit:
            i > 0 ? ["Routine Cleaning", "Tooth Pain", "Check-up", "Filling", "Consultation"][i % 5] : undefined,
          currentComplaints: i % 3 === 0 ? ["Tooth sensitivity", "Gum bleeding"] : [],
          painLevel: i % 3 === 0 ? 3 + (i % 5) : 0,
          sensitivityToHotCold: i % 4 === 0,
          bleedingGums: i % 5 === 0,
          badBreath: i % 6 === 0,
          teethGrinding: i % 7 === 0,
          jawPain: i % 8 === 0,
        },

        medicalHistory: {
          allergies: i % 3 === 0 ? ["Penicillin", "Latex"] : [],
          chronicConditions: i % 4 === 0 ? ["Diabetes", "Hypertension"] : [],
          currentMedications: i % 5 === 0 ? ["Insulin", "Lisinopril"] : [],
          surgicalHistory: i % 6 === 0 ? ["Appendectomy"] : [],
          familyMedicalHistory: i % 2 === 0 ? "Family history of diabetes and heart disease" : undefined,
          smokingStatus: ["never", "former", "never", "current", "never"][i],
          alcoholConsumption: ["never", "occasional", "regular", "occasional", "never"][i],
          pregnancyStatus:
            patient.gender === "female"
              ? ["not_pregnant", "not_pregnant", "pregnant", "not_pregnant", "breastfeeding"][i]
              : "not_applicable",
          notes: i % 2 === 0 ? "Patient has a history of dental anxiety." : undefined,
        },

        insuranceInfo: {
          hasInsurance: i % 2 === 0,
          provider: i % 2 === 0 ? ["RSSB", "MMI", "Radiant", "UAP"][i % 4] : undefined,
          policyNumber: i % 2 === 0 ? `POL-${7000 + i}` : undefined,
          groupNumber: i % 2 === 0 ? `GRP-${8000 + i}` : undefined,
          expiryDate: i % 2 === 0 ? new Date(2024, 11, 31) : undefined,
          coverageType: i % 2 === 0 ? ["basic", "comprehensive", "premium"][i % 3] : undefined,
          coverageDetails: i % 2 === 0 ? "Covers routine dental care and emergency treatments" : undefined,
          copayAmount: i % 2 === 0 ? 5000 + i * 1000 : undefined,
        },

        preferences: {
          preferredAppointmentTime: ["morning", "afternoon", "evening"][i % 3],
          communicationPreference: ["phone", "email", "sms"][i % 3],
          reminderPreference: true,
          treatmentPreferences: i % 2 === 0 ? ["Gentle treatment", "Minimal pain procedures"] : [],
          anxietyLevel: ["low", "moderate", "high"][i % 3],
          specialNeeds: i % 4 === 0 ? "Requires wheelchair accessibility" : undefined,
        },

        clinicalNotes: {
          riskAssessment: ["low", "moderate", "high"][i % 3],
          treatmentPlan: i % 2 === 0 ? "Routine cleaning and check-up recommended" : undefined,
          followUpInstructions: i % 2 === 0 ? "Schedule follow-up in 6 months" : undefined,
          staffNotes: i % 3 === 0 ? "Patient prefers morning appointments" : undefined,
        },
      })

      await patientProfile.save()
      patientProfiles.push(patientProfile)
    }

    console.log("Patient profiles seeded successfully")
    return patientProfiles
  } catch (error) {
    console.error("Error seeding patient profiles:", error)
    throw error
  }
}





// Seed appointments
const seedAppointments = async (patientProfiles: any[], doctorProfiles: any[]) => {
  try {
    const appointments = []
    const appointmentTypes = ["consultation", "checkup", "treatment", "follow-up"]
    const appointmentStatuses = ["scheduled", "confirmed", "completed", "cancelled", "no-show"]

    // Create 20 appointments
    for (let i = 0; i < 20; i++) {
      const patientIndex = i % patientProfiles.length
      const doctorIndex = i % doctorProfiles.length

      const appointmentDate = new Date()
      appointmentDate.setDate(appointmentDate.getDate() + (i % 30)) // Spread over next 30 days

      const appointment = new Appointment({
        patient: patientProfiles[patientIndex]._id,
        doctor: doctorProfiles[doctorIndex]._id,
        date: appointmentDate,
        startTime: `${9 + (i % 8)}:00`, // 9 AM to 4 PM
        endTime: `${10 + (i % 8)}:00`, // 1 hour appointments
        status: appointmentStatuses[i % appointmentStatuses.length],
        type: appointmentTypes[i % appointmentTypes.length],
        notes: `Appointment notes ${i + 1}`,
        reason: `Reason for visit ${i + 1}`,
        reminders: [],
      })

      await appointment.save()
      appointments.push(appointment)
    }

    console.log("Appointments seeded successfully")
    return appointments
  } catch (error) {
    console.error("Error seeding appointments:", error)
    throw error
  }
}

// Seed payments
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const seedPayments = async (appointments: any[], patientProfiles: any[]) => {
  try {
    const payments = []
    const paymentMethods = ["stripe", "mobile-money", "cash"]
    const paymentStatuses = ["pending", "completed", "failed", "refunded"]

    // Create payments for completed appointments
    for (let i = 0; i < appointments.length; i++) {
      if (appointments[i].status === "completed" || i % 3 === 0) {
        const payment = new Payment({
          appointment: appointments[i]._id,
          patient: appointments[i].patient,
          amount: 25000 + i * 1000, // Random amount
          currency: "RWF",
          status: paymentStatuses[i % paymentStatuses.length],
          paymentMethod: paymentMethods[i % paymentMethods.length],
          transactionId: `txn_${uuidv4().substring(0, 8)}`,
          invoiceNumber: `INV-${1000 + i}`,
          receiptUrl: i % 2 === 0 ? `https://example.com/receipts/receipt-${i}.pdf` : undefined,
        })

        await payment.save()
        payments.push(payment)

        // Update appointment with payment reference
        appointments[i].payment = payment._id
        await appointments[i].save()
      }
    }

    console.log("Payments seeded successfully")
    return payments
  } catch (error) {
    console.error("Error seeding payments:", error)
    throw error
  }
}

// Seed medical records
const seedMedicalRecords = async (appointments: any[]) => {
  try {
    const medicalRecords = []

    // Create medical records for completed appointments
    for (let i = 0; i < appointments.length; i++) {
      if (appointments[i].status === "completed") {
        const medicalRecord = new MedicalRecord({
          patient: appointments[i].patient,
          doctor: appointments[i].doctor,
          appointment: appointments[i]._id,
          diagnosis: `Diagnosis for appointment ${i + 1}`,
          treatment: `Treatment plan for appointment ${i + 1}`,
          prescription: [
            {
              medication: "Amoxicillin",
              dosage: "500mg",
              frequency: "Three times daily",
              duration: "7 days",
              notes: "Take with food",
            },
          ],
          notes: `Medical notes for appointment ${i + 1}`,
          followUpRequired: i % 2 === 0,
          followUpDate: i % 2 === 0 ? new Date(new Date().setDate(new Date().getDate() + 14)) : undefined,
        })

        await medicalRecord.save()
        medicalRecords.push(medicalRecord)
      }
    }

    console.log("Medical records seeded successfully")
    return medicalRecords
  } catch (error) {
    console.error("Error seeding medical records:", error)
    throw error
  }
}

// Main seeding function
const seedDatabase = async () => {
  try {
    await connectDB()
    await clearCollections()

    const { admins, doctors, receptionists, patients } = await seedUsers()
    const adminProfiles = await seedAdminProfiles(admins)
    const doctorProfiles = await seedDoctorProfiles(doctors)
    const receptionistProfiles = await seedReceptionistProfiles(receptionists)
    const patientProfiles = await seedPatientProfiles(patients)

    console.log("\n=== SEEDING SUMMARY ===")
    console.log(`✅ ${admins.length} Admin users created`)
    console.log(`✅ ${doctors.length} Doctor users created`)
    console.log(`✅ ${receptionists.length} Receptionist users created`)
    console.log(`✅ ${patients.length} Patient users created`)
    console.log(`✅ ${adminProfiles.length} Admin profiles created`)
    console.log(`✅ ${doctorProfiles.length} Doctor profiles created`)
    console.log(`✅ ${receptionistProfiles.length} Receptionist profiles created`)
    console.log(`✅ ${patientProfiles.length} Patient profiles created`)
    console.log("\n=== LOGIN CREDENTIALS ===")
    console.log("All users have the password: Password123!")
    console.log("\nAdmin Users:")
    admins.forEach((admin, ) => {
      console.log(`  ${admin.email} (${admin.role})`)
    })
    console.log("\nDoctor Users:")
    doctors.forEach((doctor) => {
      console.log(`  ${doctor.email} (${doctor.role})`)
    })
    console.log("\nReceptionist Users:")
    receptionists.forEach((receptionist) => {
      console.log(`  ${receptionist.email} (${receptionist.role})`)
    })
    console.log("\nPatient Users:")
    patients.forEach((patient, ) => {
      console.log(`  ${patient.email} (${patient.role})`)
    })

    console.log("\n🎉 Database seeded successfully!")


     // Seed appointments, payments, and medical records
    const appointments = await seedAppointments(patientProfiles, doctorProfiles)
    await seedPayments(appointments, patientProfiles)
    await seedMedicalRecords(appointments)
    console.log(`✅ ${appointments.length} Appointments created`)
    
    console.log(`✅ Payments and medical records created for completed appointments`)
    console.log("\n🎉 All data seeded successfully!"

    )
    process.exit(0)
  } catch (error) {
    console.error("❌ Error seeding database:", error)
    process.exit(1)
  }
}

// Run the seeder
seedDatabase()
