// Frontend usage examples for the upload API

// ===== BASIC UPLOAD SERVICE =====
class UploadService {
  private baseURL = '/api/upload'
  private authToken: string

  constructor(authToken: string) {
    this.authToken = authToken
  }

  private getHeaders() {
    return {
      'Authorization': `Bearer ${this.authToken}`,
    }
  }

  // Upload single image
  async uploadImage(imageFile: File): Promise<UploadResponse> {
    const formData = new FormData()
    formData.append('image', imageFile)

    const response = await fetch(`${this.baseURL}/picture`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: formData,
    })

    const result = await response.json()
    if (!result.success) {
      throw new Error(result.message || 'Upload failed')
    }

    return result.data
  }

  // Upload multiple images
  async uploadImages(imageFiles: File[]): Promise<MultipleUploadResponse> {
    const formData = new FormData()
    imageFiles.forEach(file => {
      formData.append('images', file)
    })

    const response = await fetch(`${this.baseURL}/images`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: formData,
    })

    const result = await response.json()
    if (!result.success) {
      throw new Error(result.message || 'Upload failed')
    }

    return result.data
  }

  // Upload document
  async uploadDocument(docFile: File): Promise<DocumentUploadResponse> {
    const formData = new FormData()
    formData.append('document', docFile)

    const response = await fetch(`${this.baseURL}/document`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: formData,
    })

    const result = await response.json()
    if (!result.success) {
      throw new Error(result.message || 'Upload failed')
    }

    return result.data
  }

  // Upload from base64/buffer
  async uploadFromBuffer(
    imageData: string, 
    fileName?: string, 
    folder?: string
  ): Promise<UploadResponse> {
    const response = await fetch(`${this.baseURL}/buffer`, {
      method: 'POST',
      headers: {
        ...this.getHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imageData,
        fileName,
        folder,
      }),
    })

    const result = await response.json()
    if (!result.success) {
      throw new Error(result.message || 'Upload failed')
    }

    return result.data
  }

  // Get upload configuration
  async getUploadConfig(): Promise<UploadConfig> {
    const response = await fetch(`${this.baseURL}/config`, {
      headers: this.getHeaders(),
    })

    const result = await response.json()
    if (!result.success) {
      throw new Error('Failed to get upload config')
    }

    return result.data
  }
}

// ===== TYPES =====
interface OptimizedUrls {
  thumbnail: string
  small: string
  medium: string
  large: string
  original: string
}

interface ImageMetadata {
  size: number
  mimetype: string
  originalName: string
  width?: number
  height?: number
  format?: string
  uploadedAt: string
}

interface UploadResponse {
  url: string // Default optimized URL
  urls: OptimizedUrls
  publicId: string
  metadata: ImageMetadata
}

interface DocumentUploadResponse {
  url: string
  publicId: string
  metadata: Omit<ImageMetadata, 'width' | 'height'>
}

interface MultipleUploadResponse {
  images: UploadResponse[]
  count: number
  uploadedAt: string
}

interface UploadConfig {
  images: {
    maxSizeBytes: number
    maxSizeMB: number
    allowedTypes: string[]
    allowedExtensions: string[]
    maxFiles: number
  }
  documents: {
    maxSizeBytes: number
    maxSizeMB: number
    allowedTypes: string[]
    allowedExtensions: string[]
    maxFiles: number
  }
  optimizedSizes: {
    thumbnail: { width: number; height: number }
    small: { width: number; height: number }
    medium: { width: number; height: number }
    large: { width: number; height: number }
  }
}

// ===== REACT HOOK EXAMPLE =====
import { useState, useCallback } from 'react'

interface UseUploadOptions {
  onSuccess?: (result: UploadResponse) => void
  onError?: (error: Error) => void
  onProgress?: (progress: number) => void
}

export const useImageUpload = (authToken: string, options: UseUploadOptions = {}) => {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<Error | null>(null)

  const uploadService = new UploadService(authToken)

  const uploadImage = useCallback(async (file: File): Promise<UploadResponse | null> => {
    if (!file) return null

    setIsUploading(true)
    setError(null)
    setUploadProgress(0)

    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90))
      }, 100)

      const result = await uploadService.uploadImage(file)
      
      clearInterval(progressInterval)
      setUploadProgress(100)
      
      options.onSuccess?.(result)
      return result
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Upload failed')
      setError(error)
      options.onError?.(error)
      return null
    } finally {
      setIsUploading(false)
      setTimeout(() => setUploadProgress(0), 1000)
    }
  }, [authToken, options])

  const uploadImages = useCallback(async (files: File[]): Promise<MultipleUploadResponse | null> => {
    if (!files.length) return null

    setIsUploading(true)
    setError(null)
    setUploadProgress(0)

    try {
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 5, 90))
      }, 150)

      const result = await uploadService.uploadImages(files)
      
      clearInterval(progressInterval)
      setUploadProgress(100)
      
      return result
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Upload failed')
      setError(error)
      options.onError?.(error)
      return null
    } finally {
      setIsUploading(false)
      setTimeout(() => setUploadProgress(0), 1000)
    }
  }, [authToken, options])

  return {
    uploadImage,
    uploadImages,
    isUploading,
    uploadProgress,
    error,
  }
}

// ===== REACT COMPONENT EXAMPLE =====
import React, { useCallback } from 'react'

interface ImageUploaderProps {
  authToken: string
  onImageUploaded: (result: UploadResponse) => void
  multiple?: boolean
  accept?: string
  maxSize?: number
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  authToken,
  onImageUploaded,
  multiple = false,
  accept = "image/*",
  maxSize = 5 * 1024 * 1024, // 5MB
}) => {
  const { uploadImage, uploadImages, isUploading, uploadProgress, error } = useImageUpload(
    authToken,
    {
      onSuccess: onImageUploaded,
      onError: (err) => console.error('Upload failed:', err),
    }
  )

  const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    // Validate file sizes
    const oversizedFiles = Array.from(files).filter(file => file.size > maxSize)
    if (oversizedFiles.length > 0) {
      alert(`Files too large: ${oversizedFiles.map(f => f.name).join(', ')}`)
      return
    }

    if (multiple) {
      await uploadImages(Array.from(files))
    } else {
      await uploadImage(files[0])
    }

    // Reset input
    event.target.value = ''
  }, [uploadImage, uploadImages, multiple, maxSize])

  return (
    <div className="upload-container">
      <input
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleFileChange}
        disabled={isUploading}
        style={{ display: 'none' }}
        id="image-upload-input"
      />
      
      <label 
        htmlFor="image-upload-input" 
        className={`upload-button ${isUploading ? 'uploading' : ''}`}
        style={{
          display: 'inline-block',
          padding: '12px 24px',
          backgroundColor: isUploading ? '#ccc' : '#007bff',
          color: 'white',
          borderRadius: '4px',
          cursor: isUploading ? 'not-allowed' : 'pointer',
          transition: 'background-color 0.2s',
        }}
      >
        {isUploading ? `Uploading... ${uploadProgress}%` : `Upload ${multiple ? 'Images' : 'Image'}`}
      </label>

      {isUploading && (
        <div style={{ marginTop: '8px', width: '100%', backgroundColor: '#f0f0f0', borderRadius: '4px' }}>
          <div 
            style={{
              width: `${uploadProgress}%`,
              height: '4px',
              backgroundColor: '#007bff',
              borderRadius: '4px',
              transition: 'width 0.2s',
            }}
          />
        </div>
      )}

      {error && (
        <div style={{ marginTop: '8px', color: '#dc3545', fontSize: '14px' }}>
          Error: {error.message}
        </div>
      )}
    </div>
  )
}

// ===== DRAG AND DROP COMPONENT EXAMPLE =====
export const DragDropImageUploader: React.FC<ImageUploaderProps> = ({
  authToken,
  onImageUploaded,
  multiple = false,
  accept = "image/*",
  maxSize = 5 * 1024 * 1024,
}) => {
  const [isDragOver, setIsDragOver] = useState(false)
  const { uploadImage, uploadImages, isUploading, uploadProgress, error } = useImageUpload(
    authToken,
    { onSuccess: onImageUploaded }
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)

    const files = Array.from(e.dataTransfer.files).filter(file => 
      file.type.startsWith('image/')
    )

    if (files.length === 0) {
      alert('Please drop image files only')
      return
    }

    // Validate file sizes
    const oversizedFiles = files.filter(file => file.size > maxSize)
    if (oversizedFiles.length > 0) {
      alert(`Files too large: ${oversizedFiles.map(f => f.name).join(', ')}`)
      return
    }

    if (multiple) {
      await uploadImages(files)
    } else {
      await uploadImage(files[0])
    }
  }, [uploadImage, uploadImages, multiple, maxSize])

  const handleFileSelect = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    const fileArray = Array.from(files)
    const oversizedFiles = fileArray.filter(file => file.size > maxSize)
    if (oversizedFiles.length > 0) {
      alert(`Files too large: ${oversizedFiles.map(f => f.name).join(', ')}`)
      return
    }

    if (multiple) {
      await uploadImages(fileArray)
    } else {
      await uploadImage(files[0])
    }

    event.target.value = ''
  }, [uploadImage, uploadImages, multiple, maxSize])

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={{
        border: `2px dashed ${isDragOver ? '#007bff' : '#ccc'}`,
        borderRadius: '8px',
        padding: '40px',
        textAlign: 'center',
        backgroundColor: isDragOver ? '#f8f9ff' : '#fafafa',
        transition: 'all 0.2s',
        cursor: isUploading ? 'not-allowed' : 'pointer',
      }}
    >
      <input
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleFileSelect}
        disabled={isUploading}
        style={{ display: 'none' }}
        id="drag-drop-input"
      />

      {isUploading ? (
        <div>
          <div>Uploading... {uploadProgress}%</div>
          <div style={{ 
            width: '200px', 
            height: '4px', 
            backgroundColor: '#e0e0e0', 
            borderRadius: '2px',
            margin: '16px auto',
            overflow: 'hidden'
          }}>
            <div
              style={{
                width: `${uploadProgress}%`,
                height: '100%',
                backgroundColor: '#007bff',
                transition: 'width 0.2s',
              }}
            />
          </div>
        </div>
      ) : (
        <>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📁</div>
          <div style={{ fontSize: '18px', marginBottom: '8px' }}>
            Drag and drop {multiple ? 'images' : 'an image'} here
          </div>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '16px' }}>
            or{' '}
            <label 
              htmlFor="drag-drop-input" 
              style={{ color: '#007bff', cursor: 'pointer', textDecoration: 'underline' }}
            >
              browse files
            </label>
          </div>
          <div style={{ fontSize: '12px', color: '#999' }}>
            Max size: {(maxSize / (1024 * 1024)).toFixed(0)}MB per file
            {multiple && ' • Max 5 files'}
          </div>
        </>
      )}

      {error && (
        <div style={{ marginTop: '16px', color: '#dc3545', fontSize: '14px' }}>
          Error: {error.message}
        </div>
      )}
    </div>
  )
}

// ===== USAGE EXAMPLES =====

// Basic usage
const MyComponent = () => {
  const authToken = 'your-auth-token'
  
  const handleImageUploaded = (result: UploadResponse) => {
    console.log('Image uploaded:', result.url)
    console.log('All sizes:', result.urls)
    
    // Use the appropriate size for your needs:
    // result.urls.thumbnail - 150x150
    // result.urls.small - 300x300
    // result.urls.medium - 600x600 (default)
    // result.urls.large - 1200x1200
    // result.urls.original - original size
  }

  return (
    <div>
      <ImageUploader 
        authToken={authToken}
        onImageUploaded={handleImageUploaded}
      />
      
      <DragDropImageUploader
        authToken={authToken}
        onImageUploaded={handleImageUploaded}
        multiple={true}
      />
    </div>
  )
}

// Advanced usage with manual upload service
const AdvancedComponent = () => {
  const authToken = 'your-auth-token'
  const uploadService = new UploadService(authToken)

  const handleManualUpload = async (file: File) => {
    try {
      const result = await uploadService.uploadImage(file)
      console.log('Uploaded image URL:', result.url)
      
      // You can also upload from base64
      // const base64Result = await uploadService.uploadFromBuffer(
      //   'data:image/png;base64,iVBORw0KGgoAAAANS...',
      //   'my-image',
      //   'custom-folder'
      // )
      
    } catch (error) {
      console.error('Upload failed:', error)
    }
  }

  const handleDocumentUpload = async (file: File) => {
    try {
      const result = await uploadService.uploadDocument(file)
      console.log('Document URL:', result.url)
    } catch (error) {
      console.error('Document upload failed:', error)
    }
  }

  return (
    <div>
      {/* Your component JSX */}
    </div>
  )
}

// ===== UTILITY FUNCTIONS =====

// File validation helper
export const validateImageFile = (file: File, maxSize: number = 5 * 1024 * 1024): string | null => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  
  if (!allowedTypes.includes(file.type)) {
    return 'Please select a valid image file (JPEG, PNG, GIF, WebP)'
  }
  
  if (file.size > maxSize) {
    const maxSizeMB = maxSize / (1024 * 1024)
    return `File size must be less than ${maxSizeMB}MB`
  }
  
  return null
}

// Image preview generator
export const generateImagePreview = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target?.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// Compress image before upload (optional)
export const compressImage = (file: File, maxWidth: number = 1920, quality: number = 0.8): Promise<File> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!
    const img = new Image()
    
    img.onload = () => {
      const ratio = Math.min(maxWidth / img.width, maxWidth / img.height)
      canvas.width = img.width * ratio
      canvas.height = img.height * ratio
      
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      
      canvas.toBlob((blob) => {
        const compressedFile = new File([blob!], file.name, {
          type: file.type,
          lastModified: Date.now()
        })
        resolve(compressedFile)
      }, file.type, quality)
    }
    
    img.src = URL.createObjectURL(file)
  })
}