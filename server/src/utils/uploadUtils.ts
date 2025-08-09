// server\src\utils\uploadUtils.ts
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import multer from "multer"
import { CloudinaryStorage } from "multer-storage-cloudinary"
import cloudinary from "../config/cloudinary.config"
import type { Request } from "express"
import type { Multer } from "multer"

// Define allowed file types
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/jpg", "image/svg+xml", ]
export const ALLOWED_DOCUMENT_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]

// File size limits (in bytes)
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024 // 5MB
export const MAX_DOCUMENT_SIZE = 10 * 1024 * 1024 // 10MB

// Custom file filter interface
type FileFilterCallback = (error: Error | null, acceptFile?: boolean) => void

// Profile picture storage configuration
const profilePictureStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "dentrw/profile_pictures",
    allowed_formats: ["jpg", "jpeg", "png", "gif", "webp"],
    transformation: [
      { width: 400, height: 400, crop: "fill", gravity: "face" },
      { quality: "auto", fetch_format: "auto" },
    ],
    public_id: (req: Request, file: Express.Multer.File) => {
      const userId = req.user?.userId
      return `profile-${userId}-${Date.now()}`
    },
  } as any,
})

// Document storage configuration
const documentStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "dentrw/documents",
    allowed_formats: ["pdf", "doc", "docx"],
    resource_type: "raw",
    public_id: (req: Request, file: Express.Multer.File) => {
      const userId = req.user?.userId
      const timestamp = Date.now()
      const originalName = file.originalname.split(".")[0]
      return `doc-${userId}-${originalName}-${timestamp}`
    },
  } as any,
})

// Image upload Configuration
const ImageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "dentrw/images",
    allowed_formats: ["jpg", "jpeg", "png", "gif", "webp"],
    transformation: [
      { width: 400, height: 400, crop: "fill", gravity: "face" },
      { quality: "auto", fetch_format: "auto" },
    ],
    public_id: (req: Request, file: Express.Multer.File) => {
      const userId = req.user?.userId
      return `profile-${userId}-${Date.now()}`
    },
  } as any,
})

// File filter for images
const imageFileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error(`Invalid file type. Only ${ALLOWED_IMAGE_TYPES.join(", ")} are allowed.`))
  }
}

// File filter for documents
const documentFileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  if (ALLOWED_DOCUMENT_TYPES.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error(`Invalid file type. Only ${ALLOWED_DOCUMENT_TYPES.join(", ")} are allowed.`))
  }
}

// Image upload middleware
export const uploadImage = multer({
  storage: ImageStorage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: MAX_IMAGE_SIZE,
  },
}).single("image")

// Profile picture upload middleware
export const uploadProfilePicture = multer({
  storage: profilePictureStorage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: MAX_IMAGE_SIZE,
  },
}).single("profilePicture")

// Document upload middleware
export const uploadDocument = multer({
  storage: documentStorage,
  fileFilter: documentFileFilter,
  limits: {
    fileSize: MAX_DOCUMENT_SIZE,
  },
}).single("document")

// Multiple images upload middleware
export const uploadMultipleImages = multer({
  storage: profilePictureStorage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: MAX_IMAGE_SIZE,
  },
}).array("images", 5) // Max 5 images



// Upload utility functions
export interface UploadResult {
  success: boolean
  url?: string
  publicId?: string
  error?: string
  metadata?: {
    width?: number
    height?: number
    format?: string
    bytes?: number
  }
}

// Upload image to Cloudinary directly (without multer)
export const uploadImageToCloudinary = async (
  buffer: Buffer,
  options: {
    folder?: string
    publicId?: string
    transformation?: any[]
  } = {},
): Promise<UploadResult> => {
  try {
    return new Promise((resolve) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: options.folder || "uploads",
          public_id: options.publicId,
          transformation: options.transformation || [{ quality: "auto", fetch_format: "auto" }],
        },
        (error, result) => {
          if (error) {
            resolve({
              success: false,
              error: error.message,
            })
          } else if (result) {
            resolve({
              success: true,
              url: result.secure_url,
              publicId: result.public_id,
              metadata: {
                width: result.width,
                height: result.height,
                format: result.format,
                bytes: result.bytes,
              },
            })
          }
        },
      )
      uploadStream.end(buffer)
    })
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Upload failed",
    }
  }
}

// Delete image from Cloudinary
export const deleteImageFromCloudinary = async (publicId: string): Promise<boolean> => {
  try {
    const result = await cloudinary.uploader.destroy(publicId)
    return result.result === "ok"
  } catch (error) {
    console.error("Error deleting image from Cloudinary:", error)
    return false
  }
}

// Get optimized image URL
export const getOptimizedImageUrl = (
  publicId: string,
  options: {
    width?: number
    height?: number
    crop?: string
    quality?: string
    format?: string
  } = {},
): string => {
  const transformation = []

  if (options.width || options.height) {
    transformation.push({
      width: options.width,
      height: options.height,
      crop: options.crop || "fill",
    })
  }

  transformation.push({
    quality: options.quality || "auto",
    fetch_format: options.format || "auto",
  })

  return cloudinary.url(publicId, { transformation })
}

export const validateFileType = (file: Express.Multer.File, allowedTypes: string[]): boolean => {
  return allowedTypes.includes(file.mimetype)
}

// Validate file size
export const validateFileSize = (file: Express.Multer.File, maxSize: number): boolean => {
  return file.size <= maxSize
}


// Error handler for multer errors
export const handleMulterError = (error: any): string => {
  if (error instanceof multer.MulterError) {
    switch (error.code) {
      case "LIMIT_FILE_SIZE":
        return "File too large. Please upload a smaller file."
      case "LIMIT_FILE_COUNT":
        return "Too many files. Please upload fewer files."
      case "LIMIT_UNEXPECTED_FILE":
        return "Unexpected file field. Please check your form."
      default:
        return "File upload error occurred."
    }
  }
  return error.message || "Unknown upload error occurred."
}
