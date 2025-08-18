// client\src\services\upload.service.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import type {Error} from "../types"
import api from "./api"

interface UploadResponse {
  success: boolean
  data: {
    url: string
    publicId: string
    metadata: {
      size: number
      mimetype: string
      originalName: string
      width?: number
      height?: number
      format?: string
      uploadedAt: string
    }
  }
  message: string
}

interface UploadError {
  status?: number
  message: string
  details?: any
}



const UploadService = {

  uploadPicture: async (file: File, onProgress?: (progress: number) => void) => {
    try {
      const formData = new FormData()
      formData.append("Picture", file)

      const response = await api.post("/upload/image", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
            onProgress(progress)
          }
        },
      })
      return response.data
    } catch (error: any) {
      const errorData: Error = {
        status: error.response?.status,
        message: error.response?.data?.error?.message || "Failed to upload picture",
        details: error.response?.data?.error?.details,
      }
      throw errorData
    }
  },

  uploadDocument: async (file: File, onProgress?: (progress: number) => void) => {
    try {
      const formData = new FormData()
      formData.append("Document", file)

      const response = await api.post("/upload/document", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
            onProgress(progress)
          }
        },
      })
      return response.data
    } catch (error: any) {
      const errorData: Error = {
        status: error.response?.status,
        message: error.response?.data?.error?.message || "Failed to upload document",
        details: error.response?.data?.error?.details,
      }
      throw errorData
    }
  },
}


export default UploadService