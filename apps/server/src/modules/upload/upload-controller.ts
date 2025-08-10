/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Request, Response } from "express"
import {
  successResponse,
  unauthorizedResponse,
  validationErrorResponse,
  databaseErrorResponse,
} from "../../utils/api-response"
import asyncHandler from "../../utils/asyncHandler"
import { logAction } from "../../utils/auditLogUtil"
import { 
  getOptimizedImageUrl, 
  handleMulterError,
  uploadImageToCloudinary,
} from "../../utils/uploadUtils"

/**
 * Upload picture controller
 * Uploads image to Cloudinary and returns optimized URLs
 */
export const uploadPictureController = asyncHandler(async (req: Request, res: Response) => {
  try {
    // Check authentication
    if (!req.user || !req.user.userId) {
      return unauthorizedResponse(res, "Authentication required", {
        help: "Please log in to upload images.",
        startTime: req.startTime,
      })
    }

    // Validate file upload
    if (!req.file) {
      return validationErrorResponse(
        res,
        "No file uploaded",
        { file: "Image file is required" },
        {
          help: "Please select a valid image file (JPEG, PNG, GIF, WebP) up to 5MB.",
          startTime: req.startTime,
        },
      )
    }

    // The file should already be uploaded to Cloudinary by multer middleware
    const cloudinaryFile = req.file as any // Cloudinary adds extra properties

    if (!cloudinaryFile.path) {
      return databaseErrorResponse(res,"File upload failed", {
        help: "There was an issue uploading your image. Please try again.",
        startTime: req.startTime,
      })
    }

    // Generate optimized image URLs for different use cases
    const optimizedUrls = {
      thumbnail: getOptimizedImageUrl(cloudinaryFile.filename, {
        width: 150,
        height: 150,
        crop: "fill",
        quality: "auto",
      }),
      small: getOptimizedImageUrl(cloudinaryFile.filename, {
        width: 300,
        height: 300,
        crop: "limit",
        quality: "auto",
      }),
      medium: getOptimizedImageUrl(cloudinaryFile.filename, {
        width: 600,
        height: 600,
        crop: "limit", 
        quality: "auto",
      }),
      large: getOptimizedImageUrl(cloudinaryFile.filename, {
        width: 1200,
        height: 1200,
        crop: "limit",
        quality: "auto",
      }),
      original: cloudinaryFile.path,
    }

    // Log the action for audit trail
    await logAction(req, "upload_image", "file", cloudinaryFile.filename, {
      url: cloudinaryFile.path,
      publicId: cloudinaryFile.filename,
      fileSize: cloudinaryFile.size,
      mimetype: cloudinaryFile.mimetype,
      originalName: cloudinaryFile.originalname,
      folder: "dentrw/images",
    })

    return successResponse(
      res,
      {
        url: optimizedUrls.medium, // Default optimized URL
        urls: optimizedUrls,
        publicId: cloudinaryFile.filename,
        metadata: {
          size: cloudinaryFile.size,
          mimetype: cloudinaryFile.mimetype,
          originalName: cloudinaryFile.originalname,
          width: cloudinaryFile.width,
          height: cloudinaryFile.height,
          format: cloudinaryFile.format,
          uploadedAt: new Date().toISOString(),
        },
      },
      "Image uploaded successfully",
      {
        startTime: req.startTime,
        links: {
          self: "/api/upload/picture",
          thumbnail: optimizedUrls.thumbnail,
          small: optimizedUrls.small,
          medium: optimizedUrls.medium,
          large: optimizedUrls.large,
          original: optimizedUrls.original,
        },
      },
    )
  } catch (error: any) {
    // Handle multer-specific errors
    if (error.code && error.code.startsWith('LIMIT_')) {
      const errorMessage = handleMulterError(error)
      return validationErrorResponse(
        res,
        "File upload validation failed",
        { file: errorMessage },
        {
          help: "Please check your file size and format requirements.",
          startTime: req.startTime,
        }
      )
    }

    return databaseErrorResponse(res, "Failed to upload image", {
      help: "An unexpected error occurred while uploading your image. Please try again.",
      startTime: req.startTime,
      debug: process.env.NODE_ENV === 'development' ? error.message : undefined,
    })
  }
})

/**
 * Upload document controller
 * Uploads document to Cloudinary and returns URL
 */
export const uploadDocumentController = asyncHandler(async (req: Request, res: Response) => {
  try {
    // Check authentication
    if (!req.user || !req.user.userId) {
      return unauthorizedResponse(res, "Authentication required", {
        help: "Please log in to upload documents.",
        startTime: req.startTime,
      })
    }

    // Validate file upload
    if (!req.file) {
      return validationErrorResponse(
        res,
        "No file uploaded",
        { file: "Document file is required" },
        {
          help: "Please select a valid document file (PDF, DOC, DOCX) up to 10MB.",
          startTime: req.startTime,
        },
      )
    }

    const cloudinaryFile = req.file as any

    if (!cloudinaryFile.path) {
      return databaseErrorResponse(res, "File upload failed", {
        help: "There was an issue uploading your document. Please try again.",
        startTime: req.startTime,
      })
    }

    // Log the action for audit trail
    await logAction(req, "upload_document", "file", cloudinaryFile.filename, {
      url: cloudinaryFile.path,
      publicId: cloudinaryFile.filename,
      fileSize: cloudinaryFile.size,
      mimetype: cloudinaryFile.mimetype,
      originalName: cloudinaryFile.originalname,
      folder: "dentrw/documents",
    })

    return successResponse(
      res,
      {
        url: cloudinaryFile.path,
        publicId: cloudinaryFile.filename,
        metadata: {
          size: cloudinaryFile.size,
          mimetype: cloudinaryFile.mimetype,
          originalName: cloudinaryFile.originalname,
          format: cloudinaryFile.format,
          uploadedAt: new Date().toISOString(),
        },
      },
      "Document uploaded successfully",
      {
        startTime: req.startTime,
        links: {
          self: "/api/upload/document",
          download: cloudinaryFile.path,
        },
      },
    )
  } catch (error: any) {
    if (error.code && error.code.startsWith('LIMIT_')) {
      const errorMessage = handleMulterError(error)
      return validationErrorResponse(
        res,
        "File upload validation failed",
        { file: errorMessage },
        {
          help: "Please check your file size and format requirements.",
          startTime: req.startTime,
        }
      )
    }

    return databaseErrorResponse(res, "Failed to upload document", {
      help: "An unexpected error occurred while uploading your document. Please try again.",
      startTime: req.startTime,
      debug: process.env.NODE_ENV === 'development' ? error.message : undefined,
    })
  }
})

/**
 * Upload multiple images controller
 * Uploads multiple images to Cloudinary and returns URLs
 */
export const uploadMultipleImagesController = asyncHandler(async (req: Request, res: Response) => {
  try {
    // Check authentication
    if (!req.user || !req.user.userId) {
      return unauthorizedResponse(res, "Authentication required", {
        help: "Please log in to upload images.",
        startTime: req.startTime,
      })
    }

    // Validate files upload
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      return validationErrorResponse(
        res,
        "No files uploaded",
        { files: "At least one image file is required" },
        {
          help: "Please select valid image files (JPEG, PNG, GIF, WebP) up to 5MB each.",
          startTime: req.startTime,
        },
      )
    }

    const files = req.files as any[]
    const uploadedImages = []

    for (const file of files) {
      if (!file.path) {
        continue // Skip files that failed to upload
      }

      // Generate optimized URLs for each image
      const optimizedUrls = {
        thumbnail: getOptimizedImageUrl(file.filename, {
          width: 150,
          height: 150,
          crop: "fill",
          quality: "auto",
        }),
        small: getOptimizedImageUrl(file.filename, {
          width: 300,
          height: 300,
          crop: "limit",
          quality: "auto",
        }),
        medium: getOptimizedImageUrl(file.filename, {
          width: 600,
          height: 600,
          crop: "limit",
          quality: "auto",
        }),
        large: getOptimizedImageUrl(file.filename, {
          width: 1200,
          height: 1200,
          crop: "limit",
          quality: "auto",
        }),
        original: file.path,
      }

      uploadedImages.push({
        url: optimizedUrls.medium,
        urls: optimizedUrls,
        publicId: file.filename,
        metadata: {
          size: file.size,
          mimetype: file.mimetype,
          originalName: file.originalname,
          width: file.width,
          height: file.height,
          format: file.format,
        },
      })
    }

    // Log the action for audit trail
    await logAction(req, "upload_multiple_images", "files", "batch", {
      count: uploadedImages.length,
      totalSize: uploadedImages.reduce((sum, img) => sum + img.metadata.size, 0),
      publicIds: uploadedImages.map(img => img.publicId),
      folder: "dentrw/images",
    })

    return successResponse(
      res,
      {
        images: uploadedImages,
        count: uploadedImages.length,
        uploadedAt: new Date().toISOString(),
      },
      `${uploadedImages.length} image${uploadedImages.length > 1 ? 's' : ''} uploaded successfully`,
      {
        startTime: req.startTime,
        links: {
          self: "/api/upload/images",
        },
      },
    )
  } catch (error: any) {
    if (error.code && error.code.startsWith('LIMIT_')) {
      const errorMessage = handleMulterError(error)
      return validationErrorResponse(
        res,
        "File upload validation failed",
        { files: errorMessage },
        {
          help: "Please check your file size and format requirements.",
          startTime: req.startTime,
        }
      )
    }

    return databaseErrorResponse(res, "Failed to upload images", {
      help: "An unexpected error occurred while uploading your images. Please try again.",
      startTime: req.startTime,
      debug: process.env.NODE_ENV === 'development' ? error.message : undefined,
    })
  }
})

/**
 * Upload from buffer controller
 * Uploads image from buffer/base64 to Cloudinary (useful for programmatic uploads)
 */
export const uploadFromBufferController = asyncHandler(async (req: Request, res: Response) => {
  try {
    // Check authentication
    if (!req.user || !req.user.userId) {
      return unauthorizedResponse(res, "Authentication required", {
        help: "Please log in to upload images.",
        startTime: req.startTime,
      })
    }

    const { imageData, fileName, folder = "uploads" } = req.body

    if (!imageData) {
      return validationErrorResponse(
        res,
        "No image data provided",
        { imageData: "Image data is required" },
        {
          help: "Please provide base64 image data or buffer.",
          startTime: req.startTime,
        },
      )
    }

    // Convert base64 to buffer if needed
    let buffer: Buffer
    if (typeof imageData === 'string' && imageData.startsWith('data:image')) {
      // Handle base64 data URL
      const base64Data = imageData.split(',')[1]
      buffer = Buffer.from(base64Data, 'base64')
    } else if (typeof imageData === 'string') {
      // Handle plain base64
      buffer = Buffer.from(imageData, 'base64')
    } else {
      // Assume it's already a buffer
      buffer = Buffer.from(imageData)
    }

    const uploadResult = await uploadImageToCloudinary(buffer, {
      folder: `dentrw/${folder}`,
      publicId: fileName ? `${fileName}-${Date.now()}` : undefined,
      transformation: [
        { width: 1200, height: 1200, crop: "limit" },
        { quality: "auto", fetch_format: "auto" },
      ],
    })

    if (!uploadResult.success) {
      return databaseErrorResponse(res, "Failed to upload image", {
        help: uploadResult.error || "There was an issue uploading your image.",
        startTime: req.startTime,
      })
    }

    // Generate optimized URLs
    const optimizedUrls = {
      thumbnail: getOptimizedImageUrl(uploadResult.publicId!, {
        width: 150,
        height: 150,
        crop: "fill",
        quality: "auto",
      }),
      small: getOptimizedImageUrl(uploadResult.publicId!, {
        width: 300,
        height: 300,
        crop: "limit",
        quality: "auto",
      }),
      medium: getOptimizedImageUrl(uploadResult.publicId!, {
        width: 600,
        height: 600,
        crop: "limit",
        quality: "auto",
      }),
      large: getOptimizedImageUrl(uploadResult.publicId!, {
        width: 1200,
        height: 1200,
        crop: "limit",
        quality: "auto",
      }),
      original: uploadResult.url!,
    }

    // Log the action
    await logAction(req, "upload_image_buffer", "file", uploadResult.publicId!, {
      url: uploadResult.url,
      publicId: uploadResult.publicId,
      folder: `dentrw/${folder}`,
      metadata: uploadResult.metadata,
    })

    return successResponse(
      res,
      {
        url: optimizedUrls.medium,
        urls: optimizedUrls,
        publicId: uploadResult.publicId,
        metadata: {
          ...uploadResult.metadata,
          uploadedAt: new Date().toISOString(),
        },
      },
      "Image uploaded successfully",
      {
        startTime: req.startTime,
        links: {
          self: "/api/upload/buffer",
          thumbnail: optimizedUrls.thumbnail,
          small: optimizedUrls.small,
          medium: optimizedUrls.medium,
          large: optimizedUrls.large,
          original: optimizedUrls.original,
        },
      },
    )
  } catch (error: any) {
    return databaseErrorResponse(res, "Failed to upload image", {
      help: "An unexpected error occurred while uploading your image. Please try again.",
      startTime: req.startTime,
      debug: process.env.NODE_ENV === 'development' ? error.message : undefined,
    })
  }
})