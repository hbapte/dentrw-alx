/* eslint-disable @typescript-eslint/no-explicit-any */
import fs from "fs"
import { logger } from "../utils/logger"
import cloudinary from "../config/cloudinary.config"


/**
 * Upload a file to Cloudinary
 * @param filePath - Local path to the file
 * @param folder - Cloudinary folder to upload to
 * @param resourceType - Type of resource (image, raw, video, auto)
 * @returns Promise with upload result
 */
export const uploadToCloudinary = async (
  filePath: string,
  folder = "dental-clinic",
  resourceType: "image" | "raw" | "video" | "auto" = "auto",
): Promise<{
  url: string
  publicId: string
  format: string
  resourceType: string
}> => {
  try {
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`)
    }

    // Upload file to Cloudinary
    const result = await cloudinary.uploader.upload(filePath, {
      folder,
      resource_type: resourceType,
      use_filename: true,
      unique_filename: true,
    })

    logger.info(`File uploaded to Cloudinary: ${result.public_id}`)

    return {
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      resourceType: result.resource_type,
    }
  } catch (error) {
    logger.error("Error uploading to Cloudinary:", error)
    throw new Error(`Failed to upload file to Cloudinary: ${error.message}`)
  }
}

/**
 * Delete a file from Cloudinary
 * @param publicId - Public ID of the file to delete
 * @param resourceType - Type of resource (image, raw, video)
 * @returns Promise with deletion result
 */
export const deleteFromCloudinary = async (
  publicId: string,
  resourceType: "image" | "raw" | "video" = "image",
): Promise<boolean> => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    })

    logger.info(`File deleted from Cloudinary: ${publicId}`)
    return result.result === "ok"
  } catch (error) {
    logger.error("Error deleting from Cloudinary:", error)
    throw new Error(`Failed to delete file from Cloudinary: ${error.message}`)
  }
}

/**
 * Generate a signed URL for a Cloudinary resource
 * @param publicId - Public ID of the resource
 * @param options - Options for the signed URL
 * @returns Signed URL
 */
export const getSignedUrl = (
  publicId: string,
  options: {
    expiresAt?: number
    transformation?: string
  } = {},
): string => {
  const { expiresAt = Math.floor(Date.now() / 1000) + 3600, transformation = "" } = options

  return cloudinary.url(publicId, {
    secure: true,
    sign_url: true,
    expires_at: expiresAt,
    transformation: transformation ? transformation.split(",") : [],
  })
}

/**
 * Get Cloudinary resource details
 * @param publicId - Public ID of the resource
 * @returns Resource details
 */
export const getResourceDetails = async (publicId: string): Promise<any> => {
  try {
    return await cloudinary.api.resource(publicId)
  } catch (error) {
    logger.error("Error getting resource details from Cloudinary:", error)
    throw new Error(`Failed to get resource details from Cloudinary: ${error.message}`)
  }
}
