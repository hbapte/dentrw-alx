import mongoose from "mongoose"
import dotenv from "dotenv"

dotenv.config()

const resetDatabase = async () => {
  try {
    // Force the database name to be consistent
    const mongoURI = process.env.MONGODB_DEV_URI || `mongodb://localhost:27017/dentRW`

    if (!mongoURI) {
      throw new Error("MongoDB connection URI is not defined")
    }

    console.log("Connecting to MongoDB...")
    await mongoose.connect(mongoURI)
    console.log("Connected to MongoDB")

    // Drop the database
    console.log("Dropping database...")
    if (mongoose.connection.db) {
      await mongoose.connection.db.dropDatabase()
    } else {
      throw new Error("Database connection is not established.")
    }
    console.log("Database dropped successfully")

    // Close the connection
    await mongoose.disconnect()
    console.log("MongoDB connection closed")

    process.exit(0)
  } catch (error) {
    console.error("Error resetting database:", error)
    process.exit(1)
  }
}

// Run the reset function
resetDatabase()

