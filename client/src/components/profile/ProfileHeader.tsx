/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import type React from "react"

import { useState } from "react"
import { Camera, User } from "lucide-react"
import { useProfileStore } from "../../store/profile-store"
import { toast } from "react-hot-toast"


interface ProfileHeaderProps {
  user: any
}

export const ProfileHeader = ({ user }: ProfileHeaderProps) => {
  const { uploadProfilePicture, loading } = useProfileStore()
  const [hovering, setHovering] = useState(false)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload a valid image file")
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size exceeds 5MB")
      return
    }

    try {
      await uploadProfilePicture(file)
      toast.success("Profile picture updated successfully",
      )
    } catch (error: any) {
      toast.error( error.message || "Failed to upload profile picture")
    }
  }

  return (
    <div className="flex flex-col md:flex-row items-center gap-6 p-6 bg-white rounded-lg shadow-sm">
      <div className="relative" onMouseEnter={() => setHovering(true)} onMouseLeave={() => setHovering(false)}>
        <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center border border-gray-200">
          {user?.picture ? (
            <img src={user.picture || "/placeholder.svg"} alt={user.names} className="w-full h-full object-cover" />
          ) : (
            <User className="w-12 h-12 text-gray-400" />
          )}
        </div>

        {/* Upload overlay */}
        <div
          className={`absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center transition-opacity duration-200 ${
            hovering ? "opacity-100" : "opacity-0"
          }`}
        >
          <label
            htmlFor="profile-picture"
            className="cursor-pointer p-2 rounded-full hover:bg-black hover:bg-opacity-20"
          >
            <Camera className="w-6 h-6 text-white" />
            <span className="sr-only">Upload profile picture</span>
          </label>
          <input
            type="file"
            id="profile-picture"
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
            disabled={loading}
          />
        </div>
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
  )
}
