"use client"

import { useEffect, useRef, useState } from "react"
import { Camera } from "lucide-react"
import { useFileUpload } from "@/hooks/use-file-upload"
// import { useProfilePictureUpload } from "@/hooks/use-profile-picture-upload"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ProfilePictureCropper } from "./profile-picture-cropper"
import { useProfileStore } from "@/store/profile-store"

interface ProfilePictureUploadProps {
  currentAvatarUrl?: string
  firstName: string
  lastName: string
  onAvatarUpdate: (avatarUrl: string) => Promise<void>
  size?: "sm" | "md" | "lg"
}

export function ProfilePictureUpload({
  currentAvatarUrl,
  firstName,
  lastName,
  onAvatarUpdate,
  size = "lg",
}: ProfilePictureUploadProps) {
  const [
    { files, isDragging },
    { handleDragEnter, handleDragLeave, handleDragOver, handleDrop, openFileDialog, removeFile, getInputProps },
  ] = useFileUpload({
    accept: "image/*",
    maxFiles: 1,
  })

    const { uploadProfilePicture, deleteProfilePicture, loading, uploadProgress } = useProfileStore()

  const previewUrl = files[0]?.preview || null
  const fileId = files[0]?.id
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const previousFileIdRef = useRef<string | undefined | null>(null)

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return "h-12 w-12"
      case "md":
        return "h-16 w-16"
      case "lg":
      default:
        return "h-20 w-20"
    }
  }

  const getButtonSize = () => {
    switch (size) {
      case "sm":
        return "h-6 w-6"
      case "md":
        return "h-7 w-7"
      case "lg":
      default:
        return "h-8 w-8"
    }
  }

  const handleCameraClick = () => {
    openFileDialog()
  }

  const handleCropComplete = async (croppedFile: File) => {
    try {
      // Upload the cropped image
      const uploadResult = await uploadProfilePicture(croppedFile)
      if (uploadResult?.url) {
        // Update the profile with new avatar URL
        // Use the main URL for the profile, but you could also use thumbnailUrl for smaller displays
        await onAvatarUpdate(uploadResult.url)

        // Clean up
        if (fileId) {
          removeFile(fileId)
        }

        // Close the dialog
        setIsDialogOpen(false)
      }
    } catch (error) {
      console.error("Error uploading cropped image:", error)
    }
  }

  // Effect to open dialog when a new file is ready
  useEffect(() => {
    if (fileId && fileId !== previousFileIdRef.current) {
      setIsDialogOpen(true)
    }
    previousFileIdRef.current = fileId
  }, [fileId])

  return (
    <>
      <div className="relative">
        <Avatar className={`${getSizeClasses()} border-4 border-white shadow-lg`}>
          <AvatarImage src={currentAvatarUrl || ""} alt={`${firstName} ${lastName}`} />
          <AvatarFallback className="bg-white text-2xl font-bold text-gray-800">
            {getInitials(firstName, lastName)}
          </AvatarFallback>
        </Avatar>
        <Button
          size="sm"
          onClick={handleCameraClick}
          disabled={loading}
          className={`absolute -right-2 -bottom-2 ${getButtonSize()} rounded-full bg-white p-0 text-gray-800 hover:bg-gray-100 disabled:opacity-50`}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          data-dragging={isDragging || undefined}
        >
          <Camera className="h-4 w-4" />
        </Button>
        <input {...getInputProps()} className="sr-only" aria-label="Upload profile picture" tabIndex={-1} />
      </div>

      {/* Cropper Dialog */}
      <ProfilePictureCropper
        dialogOpen={isDialogOpen}
        setDialogOpen={setIsDialogOpen}
        imageUrl={previewUrl}
        onCropComplete={handleCropComplete}
        firstName={firstName}
        lastName={lastName}
        isUploading={loading}
      />
    </>
  )
}
