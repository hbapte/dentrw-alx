
// client\src\services\upload.service.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import type {Error} from "../types"
import api from "./api"

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
}


export default UploadService