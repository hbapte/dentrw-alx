/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"
import type React from "react"
import { useState, useRef } from "react"
import { Camera, Upload, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { toast } from "sonner"
import { useProfileStore } from "../../store/profile-store"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface ProfilePictureUploadProps {
  user: any
  size?: "sm" | "md" | "lg"
  showLabel?: boolean
  className?: string
}

export const ProfilePictureUpload = ({
  user,
  size = "md",
  showLabel = true,
  className = "",
}: ProfilePictureUploadProps) => {
  const { uploadProfilePicture, deleteProfilePicture, loading, uploadProgress } = useProfileStore()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const sizeClasses = {
    sm: "w-16 h-16",
    md: "w-24 h-24",
    lg: "w-32 h-32",
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const validateFile = (file: File): string | null => {
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"]
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      return "Please upload a valid image file (JPEG, PNG, GIF, WebP)"
    }

    if (file.size > 5 * 1024 * 1024) {
      return "File size must be less than 5MB"
    }

    return null
  }

  const handleFileSelect = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    e.target.value = ""
    await processFile(file)
  }

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragOver(false)

    const files = Array.from(e.dataTransfer.files)
    const file = files[0]

    if (!file) return
    await processFile(file)
  }

  const processFile = async (file: File) => {
    const error = validateFile(file)
    if (error) {
      toast.error(error)
      return
    }

    try {
      await uploadProfilePicture(file)
      toast.success("Profile picture updated successfully")
    } catch (error: any) {
      toast.error(error.message || "Failed to upload profile picture")
    }
  }

  const handleDeletePicture = async () => {
    try {
      await deleteProfilePicture()
      toast.success("Profile picture deleted successfully")
      setShowDeleteDialog(false)
    } catch (error: any) {
      toast.error(error.message || "Failed to delete profile picture")
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragOver(false)
  }

  return (
    <div className={`flex flex-col items-center space-y-4 ${className}`}>
      {showLabel && <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Profile Picture</label>}

      <div className="relative">
        <div
          className={`${sizeClasses[size]} rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 relative cursor-pointer transition-all duration-200 ${
            dragOver ? "border-primary bg-primary/5" : ""
          } ${loading ? "opacity-75" : ""}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={!loading ? handleFileSelect : undefined}
        >
          {user?.picture ? (
            <img
              src={user.picture || "/placeholder.svg"}
              alt={user.names}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.style.display = "none"
              }}
            />
          ) : (
            <div className="w-full h-full bg-primary/10 flex items-center justify-center">
              <span className="text-primary font-semibold text-lg">{getInitials(user?.names || "User")}</span>
            </div>
          )}

          {/* Upload Progress Overlay */}
          {loading && uploadProgress > 0 && (
            <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
              <div className="text-white text-xs font-medium">{uploadProgress}%</div>
            </div>
          )}

          {/* Hover Overlay */}
          {!loading && (
            <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-50 rounded-full flex items-center justify-center transition-all duration-200 group">
              <Camera className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            </div>
          )}
        </div>

        {/* Upload Progress Bar */}
        {loading && uploadProgress > 0 && (
          <div className="absolute -bottom-2 left-0 right-0">
            <Progress value={uploadProgress} className="h-1" />
          </div>
        )}

        {/* Action Buttons */}
        {!loading && (
          <div className="absolute -bottom-2 -right-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full w-8 h-8 p-0 bg-white dark:bg-gray-800 shadow-md"
                >
                  <Camera className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={handleFileSelect}>
                  <Upload className="w-4 h-4 mr-2" />
                  {user?.picture ? "Change Picture" : "Upload Picture"}
                </DropdownMenuItem>
                {user?.picture && (
                  <DropdownMenuItem
                    onClick={() => setShowDeleteDialog(true)}
                    className="text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Picture
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
          onChange={handleFileChange}
          disabled={loading}
        />
      </div>

      {/* Upload Instructions */}
      <div className="text-center">
        <p className="text-xs text-gray-500 dark:text-gray-400">Click or drag to upload</p>
        <p className="text-xs text-gray-400 dark:text-gray-500">JPEG, PNG, GIF, WebP (max 5MB)</p>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Profile Picture</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete your profile picture? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePicture} disabled={loading} className="bg-red-600 hover:bg-red-700">
              {loading ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
