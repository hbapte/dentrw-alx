/* eslint-disable @typescript-eslint/no-explicit-any */
import User from "../../../database/models/user"
import type { Types } from "mongoose"

interface UserQueryOptions {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: "asc" | "desc"
  search?: string
  role?: "patient" | "doctor" | "admin"
  active?: boolean
  emailVerified?: boolean
}

interface UserUpdateData {
  names?: string
  username?: string
  email?: string
  role?: "patient" | "doctor" | "admin"
  preferredLanguage?: "en" | "fr" | "rw"
  phoneNumber?: string
  active?: boolean
  [key: string]: any
}

class UserRepository {
  /**
   * Find a user by ID
   */
  async findById(id: string | Types.ObjectId): Promise<any> {
    return User.findById(id).select("-password -totpSecret")
  }

  /**
   * Find a user by email
   */
  async findByEmail(email: string): Promise<any> {
    return User.findOne({ email })
  }

  /**
   * Find a user by username
   */
  async findByUsername(username: string): Promise<any> {
    return User.findOne({ username })
  }

  /**
   * Find users with pagination and filtering
   */
  async findUsers(
    options: UserQueryOptions = {},
  ): Promise<{ users: any[]; total: number; page: number; limit: number; pages: number }> {
    const {
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
      search = "",
      role,
      active,
      emailVerified,
    } = options

    const skip = (page - 1) * limit
    const sortDirection = sortOrder === "desc" ? -1 : 1

    // Build query
    const query: any = {}

    // Add search
    if (search) {
      query.$or = [
        { names: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { username: { $regex: search, $options: "i" } },
      ]
    }

    // Add filters
    if (role) query.role = role
    if (active !== undefined) query.active = active
    if (emailVerified !== undefined) query.emailVerified = emailVerified

    // Execute query
    const users = await User.find(query)
      .select("-password -totpSecret")
      .sort({ [sortBy]: sortDirection })
      .skip(skip)
      .limit(limit)

    const total = await User.countDocuments(query)

    return {
      users,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    }
  }

  /**
   * Create a new user
   */
  async createUser(userData: any): Promise<any> {
    const user = new User(userData)
    return user.save()
  }

  /**
   * Update a user
   */
  async updateUser(id: string | Types.ObjectId, updateData: UserUpdateData): Promise<any> {
    return User.findByIdAndUpdate(id, { $set: updateData }, { new: true, runValidators: true }).select(
      "-password -totpSecret",
    )
  }

  /**
   * Delete a user
   */
  async deleteUser(id: string | Types.ObjectId): Promise<any> {
    return User.findByIdAndDelete(id)
  }

  /**
   * Change user status (active/inactive)
   */
  async changeUserStatus(id: string | Types.ObjectId, active: boolean): Promise<any> {
    return User.findByIdAndUpdate(id, { $set: { active } }, { new: true, runValidators: true }).select(
      "-password -totpSecret",
    )
  }

  /**
   * Change user role
   */
  async changeUserRole(id: string | Types.ObjectId, role: "patient" | "doctor" | "admin"): Promise<any> {
    return User.findByIdAndUpdate(id, { $set: { role } }, { new: true, runValidators: true }).select(
      "-password -totpSecret",
    )
  }

  /**
   * Count users by role
   */
  async countByRole(): Promise<{ patients: number; doctors: number; admins: number; total: number }> {
    const [patients, doctors, admins, total] = await Promise.all([
      User.countDocuments({ role: "patient" }),
      User.countDocuments({ role: "doctor" }),
      User.countDocuments({ role: "admin" }),
      User.countDocuments({}),
    ])

    return { patients, doctors, admins, total }
  }

  /**
   * Get recently registered users
   */
  async getRecentUsers(limit = 5): Promise<any[]> {
    return User.find({}).select("-password -totpSecret").sort({ createdAt: -1 }).limit(limit)
  }
}

export default new UserRepository()

