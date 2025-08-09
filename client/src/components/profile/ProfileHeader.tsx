/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"
import type React from "react"
import { useState, useRef } from "react"
import { Camera, Trash2, Upload } from "lucide-react"
import { useProfileStore } from "../../store/profile-store"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
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

interface ProfileHeaderProps {
  user: any
}

export const ProfileHeader = ({ user }: ProfileHeaderProps) => {
  const { uploadProfilePicture, deleteProfilePicture, loading, uploadProgress } = useProfileStore()
  const [hovering, setHovering] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Reset file input
    e.target.value = ""

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"]
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      toast.error("Please upload a valid image file (JPEG, PNG, GIF, WebP)")
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB")
      return
    }

    try {
      await uploadProfilePicture(file)

      // toast.success("Profile picture updated successfully")
    } catch (error: any) {
      console.error(error)
      // toast.error(error.message || "Failed to upload profile picture")
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

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <>
      <div className="flex flex-col md:flex-row items-center gap-6 p-6 bg-white dark:bg-accent rounded-lg shadow-sm">
        <div className="relative">
          <div
            className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center border border-gray-200 relative"
            onMouseEnter={() => setHovering(true)}
            onMouseLeave={() => setHovering(false)}
          >
            {user?.picture ? (
              <img
                src={user.picture || "/placeholder.svg"}
                alt={user.names}
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback to initials if image fails to load
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
            <div
              className={`absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center transition-opacity duration-200 ${
                hovering && !loading ? "opacity-100" : "opacity-0"
              }`}
            >
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-2 rounded-full hover:bg-black hover:bg-opacity-20 text-white"
                  >
                    <Camera className="w-5 h-5" />
                    <span className="sr-only">Profile picture options</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center" className="w-48">
                  <DropdownMenuItem onClick={handleFileSelect} disabled={loading}>
                    <Upload className="w-4 h-4 mr-2" />
                    {user?.picture ? "Change Picture" : "Upload Picture"}
                  </DropdownMenuItem>
                  {user?.picture && (
                    <DropdownMenuItem
                      onClick={() => setShowDeleteDialog(true)}
                      disabled={loading}
                      className="text-red-600 focus:text-red-600"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Picture
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Upload Progress Bar */}
          {loading && uploadProgress > 0 && (
            <div className="absolute -bottom-2 left-0 right-0">
              <Progress value={uploadProgress} className="h-1" />
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

        <div className="flex-1 text-center md:text-left">
          <h1 className="text-2xl font-bold">{user?.names}</h1>
          <p className="text-gray-500">{user?.email}</p>
          <div className="mt-2 flex flex-wrap gap-2 justify-center md:justify-start">
            <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full capitalize">{user?.role}</span>
            {user?.emailVerified && (
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Verified</span>
            )}
            <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
              {user?.preferredLanguage === "en"
                ? "English"
                : user?.preferredLanguage === "fr"
                  ? "French"
                  : user?.preferredLanguage === "rw"
                    ? "Kinyarwanda"
                    : "Not set"}
            </span>
          </div>
        </div>
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
    </>
  )
}
