/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Request, Response } from "express"
import httpStatus from "http-status"
import servicePriceRepository from "../repositories/servicePriceRepository"
import asyncHandler from "../../../utils/asyncHandler"
import { logAction } from "../../../utils/auditLogUtil"
import { successResponse, notFoundResponse, conflictResponse } from "../../../utils/api-response"

/**
 * Get all service prices with pagination and filtering
 */
export const getAllServicePrices = asyncHandler(async (req: Request, res: Response) => {
  const startTime = performance.now()
  const {
    page = "1",
    limit = "10",
    sortBy = "name",
    sortOrder = "asc",
    category,
    search = "",
    minPrice,
    maxPrice,
    active,
  } = req.query

  const options = {
    page: Number.parseInt(page as string),
    limit: Number.parseInt(limit as string),
    sortBy: sortBy as string,
    sortOrder: sortOrder as "asc" | "desc",
    category: category as string,
    search: search as string,
    minPrice: minPrice ? Number.parseInt(minPrice as string) : undefined,
    maxPrice: maxPrice ? Number.parseInt(maxPrice as string) : undefined,
    active: active === "true" ? true : active === "false" ? false : undefined,
  }

  const result = await servicePriceRepository.findServicePrices(options)

  // Calculate pagination links
  const totalPages = Math.ceil(result.total / options.limit)
  const currentPage = options.page

  return successResponse(res, result.services, "Service prices retrieved successfully", {
    statusCode: httpStatus.OK,
    startTime,
    pagination: {
      page: currentPage,
      pageSize: options.limit,
      totalItems: result.total,
      totalPages,
      hasNextPage: currentPage < totalPages,
      hasPreviousPage: currentPage > 1,
    },
    links: {
      createService: `/api/services`,
      stats: `/api/services/stats`,
      categories: `/api/services/categories`,
    },
    cacheControl: "private, max-age=60", // Cache for 1 minute
  })
})

/**
 * Get service price by ID
 */
export const getServicePriceById = asyncHandler(async (req: Request, res: Response) => {
  const startTime = performance.now()
  const { id } = req.params
  const service = await servicePriceRepository.findById(id)

  if (!service) {
    return notFoundResponse(res, "Service price not found", { startTime })
  }

  return successResponse(res, { service }, "Service price retrieved successfully", {
    statusCode: httpStatus.OK,
    startTime,
    links: {
      update: `/api/services/${id}`,
      delete: `/api/services/${id}`,
      allServices: `/api/services`,
    },
  })
})

/**
 * Create a new service price
 */
export const createServicePrice = asyncHandler(async (req: Request, res: Response) => {
  const startTime = performance.now()
  const { name, code, description, price, category, duration, active, taxable, taxRate } = req.body


  // Check if service code already exists
  const existingService = await servicePriceRepository.findByCode(code)
  if (existingService) {
    return conflictResponse(res, "Service code already exists", { code }, { startTime })
  }

  // Create service price
  const serviceData = {
    name,
    code,
    description: description || "",
    price,
    category,
    duration: duration || 30,
    active: active !== undefined ? active : true,
    taxable: taxable !== undefined ? taxable : true,
    taxRate: taxRate || 0.18,
  }

  const newService = await servicePriceRepository.createServicePrice(serviceData)

  // Log the action
  await logAction(req, "create_service_price", "servicePrice", newService._id.toString(), {
    name,
    code,
    price,
    category,
  })

  return successResponse(res, { service: newService }, "Service price created successfully", {
    statusCode: httpStatus.CREATED,
    startTime,
    links: {
      view: `/api/services/${newService._id}`,
      update: `/api/services/${newService._id}`,
      allServices: `/api/services`,
    },
  })
})

/**
 * Update a service price
 */
export const updateServicePrice = asyncHandler(async (req: Request, res: Response) => {
  const startTime = performance.now()
  const { id } = req.params
  const { name, description, price, category, duration, active, taxable, taxRate } = req.body


  // Check if service exists
  const service = await servicePriceRepository.findById(id)
  if (!service) {
    return notFoundResponse(res, "Service price not found", { startTime })
  }

  // Update service price
  const updateData: any = {}
  if (name) updateData.name = name
  if (description !== undefined) updateData.description = description
  if (price !== undefined) updateData.price = price
  if (category) updateData.category = category
  if (duration !== undefined) updateData.duration = duration
  if (active !== undefined) updateData.active = active
  if (taxable !== undefined) updateData.taxable = taxable
  if (taxRate !== undefined) updateData.taxRate = taxRate

  const updatedService = await servicePriceRepository.updateServicePrice(id, updateData)

  // Log the action
  await logAction(req, "update_service_price", "servicePrice", id, { updatedFields: Object.keys(updateData) })

  return successResponse(res, { service: updatedService }, "Service price updated successfully", {
    statusCode: httpStatus.OK,
    startTime,
    links: {
      view: `/api/services/${id}`,
      delete: `/api/services/${id}`,
      allServices: `/api/services`,
    },
  })
})

/**
 * Delete a service price
 */
export const deleteServicePrice = asyncHandler(async (req: Request, res: Response) => {
  const startTime = performance.now()
  const { id } = req.params

  // Check if service exists
  const service = await servicePriceRepository.findById(id)
  if (!service) {
    return notFoundResponse(res, "Service price not found", { startTime })
  }

  // Delete service price
  await servicePriceRepository.deleteServicePrice(id)

  // Log the action
  await logAction(req, "delete_service_price", "servicePrice", id)

  return successResponse(res, null, "Service price deleted successfully", {
    statusCode: httpStatus.OK,
    startTime,
    links: {
      allServices: `/api/services`,
      create: `/api/services`,
    },
  })
})

/**
 * Get all service categories
 */
export const getAllCategories = asyncHandler(async (req: Request, res: Response) => {
  const startTime = performance.now()
  const categories = await servicePriceRepository.getAllCategories()

  return successResponse(res, { categories }, "Service categories retrieved successfully", {
    statusCode: httpStatus.OK,
    startTime,
    links: {
      allServices: `/api/services`,
    },
    cacheControl: "private, max-age=300", // Cache for 5 minutes
  })
})

/**
 * Get service price statistics
 */
export const getServicePriceStats = asyncHandler(async (req: Request, res: Response) => {
  const startTime = performance.now()
  const stats = await servicePriceRepository.getServicePriceStats()

  return successResponse(res, stats, "Service price statistics retrieved successfully", {
    statusCode: httpStatus.OK,
    startTime,
    links: {
      allServices: `/api/services`,
      categories: `/api/services/categories`,
    },
    cacheControl: "private, max-age=300", // Cache for 5 minutes
  })
})
