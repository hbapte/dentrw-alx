/* eslint-disable @typescript-eslint/no-explicit-any */
import ServicePrice from "../../../database/models/servicePrice"
import type { Types } from "mongoose"

interface ServicePriceQueryOptions {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: "asc" | "desc"
  category?: string
  search?: string
  minPrice?: number
  maxPrice?: number
  active?: boolean
}

class ServicePriceRepository {
  /**
   * Find a service price by ID
   */
  async findById(id: string | Types.ObjectId): Promise<any> {
    return ServicePrice.findById(id)
  }

  /**
   * Find a service price by code
   */
  async findByCode(code: string): Promise<any> {
    return ServicePrice.findOne({ code })
  }

  /**
   * Find service prices with pagination and filtering
   */
  async findServicePrices(options: ServicePriceQueryOptions = {}): Promise<{
    services: any[]
    total: number
    page: number
    limit: number
    pages: number
  }> {
    const {
      page = 1,
      limit = 10,
      sortBy = "name",
      sortOrder = "asc",
      category,
      search = "",
      minPrice,
      maxPrice,
      active,
    } = options

    const skip = (page - 1) * limit
    const sortDirection = sortOrder === "desc" ? -1 : 1

    // Build query
    const query: any = {}

    if (category) query.category = category
    if (active !== undefined) query.active = active

    // Price range filter
    if (minPrice !== undefined || maxPrice !== undefined) {
      query.price = {}
      if (minPrice !== undefined) query.price.$gte = minPrice
      if (maxPrice !== undefined) query.price.$lte = maxPrice
    }

    // Search by name or description
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { code: { $regex: search, $options: "i" } },
      ]
    }

    // Execute query
    const services = await ServicePrice.find(query)
      .sort({ [sortBy]: sortDirection })
      .skip(skip)
      .limit(limit)

    const total = await ServicePrice.countDocuments(query)

    return {
      services,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    }
  }

  /**
   * Create a new service price
   */
  async createServicePrice(serviceData: any): Promise<any> {
    const service = new ServicePrice(serviceData)
    return service.save()
  }

  /**
   * Update a service price
   */
  async updateServicePrice(id: string | Types.ObjectId, updateData: any): Promise<any> {
    return ServicePrice.findByIdAndUpdate(id, { $set: updateData }, { new: true, runValidators: true })
  }

  /**
   * Delete a service price
   */
  async deleteServicePrice(id: string | Types.ObjectId): Promise<any> {
    return ServicePrice.findByIdAndDelete(id)
  }

  /**
   * Get all service categories
   */
  async getAllCategories(): Promise<string[]> {
    return ServicePrice.distinct("category")
  }

  /**
   * Get service price statistics
   */
  async getServicePriceStats(): Promise<any> {
    const [totalServices, activeServices, categoryStats, priceStats] = await Promise.all([
      ServicePrice.countDocuments({}),
      ServicePrice.countDocuments({ active: true }),
      ServicePrice.aggregate([
        { $group: { _id: "$category", count: { $sum: 1 }, averagePrice: { $avg: "$price" } } },
        { $sort: { count: -1 } },
      ]),
      ServicePrice.aggregate([
        {
          $group: {
            _id: null,
            minPrice: { $min: "$price" },
            maxPrice: { $max: "$price" },
            averagePrice: { $avg: "$price" },
          },
        },
      ]),
    ])

    // Format category stats
    const categories: Record<string, { count: number; averagePrice: number }> = {}
    categoryStats.forEach((item: any) => {
      categories[item._id] = {
        count: item.count,
        averagePrice: item.averagePrice,
      }
    })

    return {
      totalServices,
      activeServices,
      inactiveServices: totalServices - activeServices,
      categories,
      priceStats: priceStats.length > 0 ? priceStats[0] : { minPrice: 0, maxPrice: 0, averagePrice: 0 },
    }
  }
}

export default new ServicePriceRepository()
