// server\src\routes\uploadRoutes.ts
import express from "express"
import { authenticateToken } from "../middlewares/auth.middleware"
import { 
  handlePictureUpload,
  handleDocumentUpload,
  handleMultipleImagesUpload,
//   validateUploadedFile,
  validateUploadedFiles,
} from "../middlewares/upload.middleware"
import { 
  uploadPictureController,
  uploadDocumentController,
  uploadMultipleImagesController,
  uploadFromBufferController,
} from "../modules/upload/upload-controller"

const UploadRouter = express.Router()

// All routes require authentication
UploadRouter.use(authenticateToken)

// ===== IMAGE UPLOAD ROUTES =====

// Upload single picture/image
UploadRouter.post(
  "/picture", 
  handlePictureUpload,
  uploadPictureController
)

// Alternative endpoint for image upload (same as picture)
UploadRouter.post(
  "/image", 
  handlePictureUpload,
  uploadPictureController
)

// Upload multiple images
UploadRouter.post(
  "/images",
  handleMultipleImagesUpload,
  validateUploadedFiles,
  uploadMultipleImagesController
)

// Upload from buffer/base64 (programmatic upload)
UploadRouter.post(
  "/buffer",
  uploadFromBufferController
)

// ===== DOCUMENT UPLOAD ROUTES =====

// Upload document (PDF, DOC, DOCX)
UploadRouter.post(
  "/document",
  handleDocumentUpload,
  uploadDocumentController
)

// ===== UTILITY ROUTES =====

// Health check for upload service
UploadRouter.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Upload service is running",
    timestamp: new Date().toISOString(),
    endpoints: {
      uploadImage: "POST /api/upload/picture or /api/upload/image",
      uploadMultiple: "POST /api/upload/images", 
      uploadDocument: "POST /api/upload/document",
      uploadBuffer: "POST /api/upload/buffer",
    },
    limits: {
      images: {
        maxSize: "5MB per file",
        maxFiles: "5 files for multiple upload",
        allowedTypes: ["image/jpeg", "image/png", "image/gif", "image/webp"],
      },
      documents: {
        maxSize: "10MB per file", 
        allowedTypes: ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
      },
    },
  })
})

// Get upload configuration/limits
UploadRouter.get("/config", (req, res) => {
  res.json({
    success: true,
    data: {
      images: {
        maxSizeBytes: 5 * 1024 * 1024, // 5MB
        maxSizeMB: 5,
        allowedTypes: [
          "image/jpeg", 
          "image/png", 
          "image/gif", 
          "image/webp", 
          "image/jpg", 
          "image/svg+xml"
        ],
        allowedExtensions: ["jpg", "jpeg", "png", "gif", "webp", "svg"],
        maxFiles: 5, // For multiple upload
      },
      documents: {
        maxSizeBytes: 10 * 1024 * 1024, // 10MB
        maxSizeMB: 10,
        allowedTypes: [
          "application/pdf",
          "application/msword", 
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        ],
        allowedExtensions: ["pdf", "doc", "docx"],
        maxFiles: 1,
      },
      optimizedSizes: {
        thumbnail: { width: 150, height: 150 },
        small: { width: 300, height: 300 },
        medium: { width: 600, height: 600 },
        large: { width: 1200, height: 1200 },
      },
    },
    timestamp: new Date().toISOString(),
  })
})

export default UploadRouter