import dotenv from "dotenv"
import Redis from "ioredis"

dotenv.config()

// Redis connection options
const redisOptions = {
  host: process.env.REDIS_HOST || "localhost",
  port: Number.parseInt(process.env.REDIS_PORT || "6379"),
  password: process.env.REDIS_PASSWORD || undefined,
  retryStrategy: (times: number) => {
    // Retry connection with exponential backoff
    const delay = Math.min(times * 50, 2000)
    return delay
  },
}

// Create Redis client
let redisClient: Redis | null = null

try {
  redisClient = new Redis(redisOptions)

  redisClient.on("connect", () => {
    console.log("Connected to Redis ✅")
  })

  redisClient.on("error", (err) => {
    console.error("Redis connection error:", err)
  })
} catch (error) {
  console.error("Failed to initialize Redis client:", error)
}

export default redisClient

