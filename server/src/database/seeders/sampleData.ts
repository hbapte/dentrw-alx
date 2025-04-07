import mongoose from "mongoose"
import bcrypt from "bcryptjs"
import User from "../models/user"
import Patient from "../models/patient"
import Doctor from "../models/doctor"
import Appointment from "../models/appointment"
import MedicalRecord from "../models/medicalRecord"
import Payment from "../models/payment"
import Blog from "../models/blog"
import { v4 as uuidv4 } from "uuid"
import dotenv from "dotenv"

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
    await Appointment.deleteMany({})
    await MedicalRecord.deleteMany({})
    await Payment.deleteMany({})
    await Blog.deleteMany({})
    console.log("All collections cleared")
  } catch (error) {
    console.error("Error clearing collections:", error)
  }
}

// Seed users
const seedUsers = async () => {
  try {
    const hashedPassword = await bcrypt.hash("Password123!", 10)

    // Create admin user - explicitly omit googleId
    const admin = new User({
      names: "Admin User",
      email: "admin@dentrw.com",
      username: "admin",
      password: hashedPassword,
      role: "admin",
      emailVerified: true,
      preferredLanguage: "en",
      phoneNumber: "+250700000000",
      phoneVerified: true,
      active: true,
      // Do NOT include googleId field at all
    })

    await admin.save()

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
        phoneNumber: "+250700000001",
        phoneVerified: true,
        active: true,
        // Do NOT include googleId field
      },
      {
        names: "Dr. Marie Uwase",
        email: "marie.uwase@dentrw.com",
        username: "muwase",
        password: hashedPassword,
        role: "doctor",
        emailVerified: true,
        preferredLanguage: "fr",
        phoneNumber: "+250700000002",
        phoneVerified: true,
        active: true,
        // Do NOT include googleId field
      },
      {
        names: "Dr. Robert Karemera",
        email: "robert.karemera@dentrw.com",
        username: "rkaremera",
        password: hashedPassword,
        role: "doctor",
        emailVerified: true,
        preferredLanguage: "rw",
        phoneNumber: "+250700000003",
        phoneVerified: true,
        active: true,
        // Do NOT include googleId field
      },
    ]

    const createdDoctors = []

    for (const doctorData of doctors) {
      const doctor = new User(doctorData)
      await doctor.save()
      createdDoctors.push(doctor)
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
        phoneNumber: "+250700000004",
        phoneVerified: true,
        active: true,
        // Do NOT include googleId field
      },
      {
        names: "John Nkusi",
        email: "john.nkusi@example.com",
        username: "jnkusi",
        password: hashedPassword,
        role: "patient",
        emailVerified: true,
        preferredLanguage: "fr",
        phoneNumber: "+250700000005",
        phoneVerified: true,
        active: true,
        // Do NOT include googleId field
      },
      {
        names: "Sarah Uwimana",
        email: "sarah.uwimana@example.com",
        username: "suwimana",
        password: hashedPassword,
        role: "patient",
        emailVerified: true,
        preferredLanguage: "rw",
        phoneNumber: "+250700000006",
        phoneVerified: true,
        active: true,
        // Do NOT include googleId field
      },
      {
        names: "Eric Habimana",
        email: "eric.habimana@example.com",
        username: "ehabimana",
        password: hashedPassword,
        role: "patient",
        emailVerified: true,
        preferredLanguage: "en",
        phoneNumber: "+250700000007",
        phoneVerified: true,
        active: true,
        // Do NOT include googleId field
      },
      {
        names: "Grace Mukamana",
        email: "grace.mukamana@example.com",
        username: "gmukamana",
        password: hashedPassword,
        role: "patient",
        emailVerified: true,
        preferredLanguage: "fr",
        phoneNumber: "+250700000008",
        phoneVerified: true,
        active: true,
        // Do NOT include googleId field
      },
    ]

    const createdPatients = []

    for (const patientData of patients) {
      const patient = new User(patientData)
      await patient.save()
      createdPatients.push(patient)
    }

    console.log("Users seeded successfully")
    return { admin, doctors: createdDoctors, patients: createdPatients }
  } catch (error) {
    console.error("Error seeding users:", error)
    throw error
  }
}

// Rest of the file remains the same...
// Seed doctor profiles
const seedDoctorProfiles = async (doctors: any[]) => {
  try {
    const doctorProfiles = []

    for (let i = 0; i < doctors.length; i++) {
      const doctor = doctors[i]

      const doctorProfile = new Doctor({
        user: doctor._id,
        specialization: ["General Dentistry", "Orthodontics", "Pediatric Dentistry"][i % 3],
        qualifications: [
          "Doctor of Dental Surgery (DDS)",
          "Master of Dental Science",
          "Fellowship in Advanced Dental Care",
        ],
        experience: 5 + i * 2,
        licenseNumber: `RW-DENT-${1000 + i}`,
        bio: `Experienced dental professional with ${5 + i * 2} years of practice. Specializes in ${["General Dentistry", "Orthodontics", "Pediatric Dentistry"][i % 3]}.`,
        languages: ["English", "French", "Kinyarwanda"],
        consultationFee: 25000 + i * 5000,
        availability: [
          {
            day: "monday",
            slots: [
              { startTime: "09:00", endTime: "12:00" },
              { startTime: "14:00", endTime: "17:00" },
            ],
          },
          {
            day: "tuesday",
            slots: [
              { startTime: "09:00", endTime: "12:00" },
              { startTime: "14:00", endTime: "17:00" },
            ],
          },
          {
            day: "wednesday",
            slots: [
              { startTime: "09:00", endTime: "12:00" },
              { startTime: "14:00", endTime: "17:00" },
            ],
          },
          {
            day: "thursday",
            slots: [
              { startTime: "09:00", endTime: "12:00" },
              { startTime: "14:00", endTime: "17:00" },
            ],
          },
          {
            day: "friday",
            slots: [
              { startTime: "09:00", endTime: "12:00" },
              { startTime: "14:00", endTime: "17:00" },
            ],
          },
        ],
        ratings: [],
        averageRating: 0,
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
        dateOfBirth: new Date(1980 + i, i % 12, (i % 28) + 1),
        gender: i % 2 === 0 ? "male" : "female",
        address: {
          street: `${100 + i} KG ${i + 1} Ave`,
          city: "Kigali",
          state: "Kigali",
          postalCode: "00000",
          country: "Rwanda",
        },
        emergencyContact: {
          name: `Emergency Contact ${i + 1}`,
          relationship: ["Spouse", "Parent", "Sibling", "Friend"][i % 4],
          phoneNumber: `+25070000${1000 + i}`,
        },
        medicalHistory: {
          allergies: i % 3 === 0 ? ["Penicillin", "Latex"] : [],
          conditions: i % 4 === 0 ? ["Diabetes", "Hypertension"] : [],
          medications: i % 5 === 0 ? ["Insulin", "Lisinopril"] : [],
          notes: i % 2 === 0 ? "Patient has a history of dental anxiety." : "",
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
const seedPayments = async (appointments: any[], patientProfiles: any[]) => {
  try {
    const payments = []
    const paymentMethods = ["stripe", "paypal", "cash"]
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

// Seed blogs
const seedBlogs = async (admin: any, doctors: any[]) => {
  try {
    const blogs = []
    const categories = ["Dental Health", "Oral Hygiene", "Dental Procedures", "Children's Dental Health", "Nutrition"]
    const languages = ["en", "fr", "rw"]

    const blogTitles = [
      "The Importance of Regular Dental Check-ups",
      "How to Properly Brush Your Teeth",
      "Understanding Dental Implants",
      "Dental Care for Children",
      "Foods That Promote Dental Health",
      "Preventing Gum Disease",
      "The Truth About Root Canals",
      "Teeth Whitening: What You Need to Know",
    ]

    // Create 8 blog posts
    for (let i = 0; i < 8; i++) {
      const author = i % 2 === 0 ? admin : doctors[i % doctors.length]
      const title = blogTitles[i]

      const blog = new Blog({
        title,
        slug: title
          .toLowerCase()
          .replace(/[^\w ]+/g, "")
          .replace(/ +/g, "-"),
        content: `
# ${title}

## Introduction
This is a sample blog post about ${title.toLowerCase()}.

## Main Content
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nisl eget ultricies tincidunt, 
nisl nisl aliquam nisl, eget ultricies nisl nisl eget nisl. Nullam auctor, nisl eget ultricies tincidunt,
nisl nisl aliquam nisl, eget ultricies nisl nisl eget nisl.

## Conclusion
Regular dental care is essential for maintaining good oral health.
        `,
        author: author._id,
        category: categories[i % categories.length],
        tags: ["dental", "health", "teeth"],
        status: i % 5 === 0 ? "draft" : "published",
        publishedAt: i % 5 === 0 ? undefined : new Date(),
        language: languages[i % languages.length],
        views: Math.floor(Math.random() * 1000),
        likes: Math.floor(Math.random() * 100),
      })

      await blog.save()
      blogs.push(blog)
    }

    console.log("Blogs seeded successfully")
    return blogs
  } catch (error) {
    console.error("Error seeding blogs:", error)
    throw error
  }
}

// Main seeding function
const seedDatabase = async () => {
  try {
    await connectDB()
    await clearCollections()

    const { admin, doctors, patients } = await seedUsers()
    const doctorProfiles = await seedDoctorProfiles(doctors)
    const patientProfiles = await seedPatientProfiles(patients)
    const appointments = await seedAppointments(patientProfiles, doctorProfiles)
    await seedPayments(appointments, patientProfiles)
    await seedMedicalRecords(appointments)
    await seedBlogs(admin, doctors)

    console.log("Database seeded successfully")
    process.exit(0)
  } catch (error) {
    console.error("Error seeding database:", error)
    process.exit(1)
  }
}

// Run the seeder
seedDatabase()

