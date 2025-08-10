// server\src\middlewares\upload.middleware.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Request, Response, NextFunction } from "express"
import {
  uploadProfilePicture,
  uploadDocument,
  uploadMultipleImages,
  handleMulterError,
  validateFileType,
  validateFileSize,
  ALLOWED_IMAGE_TYPES,
  MAX_IMAGE_SIZE,
} from "../utils/uploadUtils"
import { validationErrorResponse } from "../utils/api-response"

// Middleware to handle picture upload
export const handlePictureUpload = (req: Request, res: Response, next: NextFunction) => {
  uploadProfilePicture(req, res, (error: any) => {
    if (error) {
      const errorMessage = handleMulterError(error)
      return validationErrorResponse(
        res,
        "File upload failed",
        { file: errorMessage },
        {
          help: "Please upload a valid image file (JPEG, PNG, GIF, WebP) under 5MB.",
          startTime: req.startTime,
        },
      )
    }
    next()
  })
}

// Middleware wrapper for profile picture upload
export const handleProfilePictureUpload = (req: Request, res: Response, next: NextFunction) => {
  uploadProfilePicture(req, res, (error: any) => {
    if (error) {
      const errorMessage = handleMulterError(error)
      return validationErrorResponse(
        res,
        "File upload failed",
        { file: errorMessage },
        {
          help: "Please upload a valid image file (JPEG, PNG, GIF, WebP) under 5MB.",
          startTime: req.startTime,
        },
      )
    }
    next()
  })
}

// Middleware wrapper for document upload
export const handleDocumentUpload = (req: Request, res: Response, next: NextFunction) => {
  uploadDocument(req, res, (error: any) => {
    if (error) {
      const errorMessage = handleMulterError(error)
      return validationErrorResponse(
        res,
        "Document upload failed",
        { file: errorMessage },
        {
          help: "Please upload a valid document (PDF, DOC, DOCX) under 10MB.",
          startTime: req.startTime,
        },
      )
    }
    next()
  })
}

// Middleware wrapper for multiple images upload
export const handleMultipleImagesUpload = (req: Request, res: Response, next: NextFunction) => {
  uploadMultipleImages(req, res, (error: any) => {
    if (error) {
      const errorMessage = handleMulterError(error)
      return validationErrorResponse(
        res,
        "Images upload failed",
        { files: errorMessage },
        {
          help: "Please upload valid image files (JPEG, PNG, GIF, WebP) under 5MB each. Maximum 5 files.",
          startTime: req.startTime,
        },
      )
    }
    next()
  })
}

// Validate uploaded file middleware
export const validateUploadedFile = (req: Request, res: Response, next: NextFunction) => {
  if (!req.file) {
    return validationErrorResponse(
      res,
      "No file uploaded",
      { file: "File is required" },
      {
        help: "Please select a file to upload.",
        startTime: req.startTime,
      },
    )
  }

  // Additional validation can be added here
  if (!validateFileType(req.file, ALLOWED_IMAGE_TYPES)) {
    return validationErrorResponse(
      res,
      "Invalid file type",
      { file: "Only image files are allowed" },
      {
        help: `Allowed file types: ${ALLOWED_IMAGE_TYPES.join(", ")}`,
        startTime: req.startTime,
      },
    )
  }

  if (!validateFileSize(req.file, MAX_IMAGE_SIZE)) {
    return validationErrorResponse(
      res,
      "File too large",
      { file: "File size exceeds limit" },
      {
        help: "File size must be less than 5MB.",
        startTime: req.startTime,
      },
    )
  }

  next()
}

// Validate multiple uploaded files middleware
export const validateUploadedFiles = (req: Request, res: Response, next: NextFunction) => {
  if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
    return validationErrorResponse(
      res,
      "No files uploaded",
      { files: "At least one file is required" },
      {
        help: "Please select files to upload.",
        startTime: req.startTime,
      },
    )
  }

  const files = req.files as Express.Multer.File[]

  for (const file of files) {
    if (!validateFileType(file, ALLOWED_IMAGE_TYPES)) {
      return validationErrorResponse(
        res,
        "Invalid file type",
        { file: `${file.originalname} is not a valid image` },
        {
          help: `Allowed file types: ${ALLOWED_IMAGE_TYPES.join(", ")}`,
          startTime: req.startTime,
        },
      )
    }

    if (!validateFileSize(file, MAX_IMAGE_SIZE)) {
      return validationErrorResponse(
        res,
        "File too large",
        { file: `${file.originalname} exceeds size limit` },
        {
          help: "Each file size must be less than 5MB.",
          startTime: req.startTime,
        },
      )
    }
  }

  next()
}
