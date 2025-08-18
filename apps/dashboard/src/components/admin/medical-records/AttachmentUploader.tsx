"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Upload, X, File, ImageIcon, FileText, Video, Music } from "lucide-react"
import type { Attachment } from "@/types/medical-record.types"
import { getFileIcon } from "@/utils/medical-record.utils"

interface AttachmentUploaderProps {
  attachments: Attachment[]
  onUpload: (file: File) => Promise<void>
  onRemove: (attachmentId: string) => Promise<void>
  readOnly?: boolean
}

const AttachmentUploader: React.FC<AttachmentUploaderProps> = ({
  attachments,
  onUpload,
  onRemove,
  readOnly = false,
}) => {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)

    if (readOnly) return

    const files = e.dataTransfer.files
    if (files.length > 0) {
      await handleFileUpload(files[0])
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      await handleFileUpload(files[0])
    }
  }

  const handleFileUpload = async (file: File) => {
    try {
      setIsUploading(true)
      await onUpload(file)
    } catch (error) {
      console.error("Error uploading file:", error)
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const getFileTypeIcon = (fileType: string) => {
    const iconType = getFileIcon(fileType)
    switch (iconType) {
      case "image":
        return <ImageIcon className="h-6 w-6 text-blue-500" />
      case "file-text":
        return <FileText className="h-6 w-6 text-green-500" />
      case "file-spreadsheet":
        return <FileText className="h-6 w-6 text-green-500" />
      case "video":
        return <Video className="h-6 w-6 text-purple-500" />
      case "music":
        return <Music className="h-6 w-6 text-yellow-500" />
      default:
        return <File className="h-6 w-6 text-gray-500" />
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Attachments</h3>
      </div>

      {!readOnly && (
        <div
          className={`border-2 border-dashed rounded-md p-6 text-center ${
            isDragging ? "border-indigo-500 bg-indigo-50" : "border-gray-300"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center">
            <Upload className="h-10 w-10 text-gray-400" />
            <p className="mt-2 text-sm font-medium text-gray-900">
              {isUploading ? "Uploading..." : "Drag and drop a file here, or click to select a file"}
            </p>
            <p className="mt-1 text-xs text-gray-500">PDF, Images, Documents up to 10MB</p>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleFileChange}
              disabled={isUploading}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="mt-4 inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
            >
              Select File
            </button>
          </div>
        </div>
      )}

      {attachments.length > 0 ? (
        <ul className="divide-y divide-gray-200 border rounded-md">
          {attachments.map((attachment) => (
            <li key={attachment.id} className="flex items-center justify-between py-3 px-4">
              <div className="flex items-center">
                {getFileTypeIcon(attachment.fileType)}
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">{attachment.name}</p>
                  <p className="text-xs text-gray-500">
                    Uploaded on {new Date(attachment.uploadedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <a
                  href={attachment.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center rounded-md bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700 hover:bg-indigo-100"
                >
                  View
                </a>
                {!readOnly && (
                  <button
                    type="button"
                    onClick={() => onRemove(attachment.id || "")}
                    className="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-100"
                  >
                    <X className="mr-1 h-3 w-3" />
                    Remove
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="rounded-md bg-gray-50 p-4 text-center text-sm text-gray-500">
          No attachments added yet.
          {!readOnly && <div className="mt-2">Drag and drop files or click "Select File" to add attachments.</div>}
        </div>
      )}
    </div>
  )
}

export default AttachmentUploader
