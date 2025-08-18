"use client"

import type React from "react"
import { useState } from "react"
import { Upload, User, Mail, MapPin, Phone, Calendar, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { motion } from "framer-motion"
import { useDoctorFormStore } from "@/lib/store"

export function PersonalInfoStep() {
  const { formData, updateFormData, uploadPicture, uploadProgress, errors, clearFieldError } = useDoctorFormStore()
  const [dragActive, setDragActive] = useState(false)

  const handleFileUpload = async (file: File) => {
    if (file && file.type.startsWith("image/")) {
      await uploadPicture(file)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0])
    }
  }

  const handleInputChange = (field: string, value: string) => {
    updateFormData({ [field]: value })
    if (errors[field]) {
      clearFieldError(field)
    }
  }

  return (
    <motion.div className="space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      {/* Photo Upload Section */}
      <div className="flex flex-col items-center space-y-4 pb-6 border-b border-gray-100 dark:border-gray-800">
        <div
          className={`relative w-24 h-24 rounded-full border-2 border-dashed transition-all duration-200 ${
            dragActive
              ? "border-blue-400 bg-blue-50 dark:bg-blue-950 scale-105"
              : "border-gray-300 dark:border-gray-600 hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-950/50"
          } flex items-center justify-center cursor-pointer group`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => document.getElementById("photo-upload")?.click()}
        >
          {formData.profilePicture ? (
            <img
              src={formData.profilePicture || "/placeholder.svg"}
              alt="Doctor"
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <User className="w-10 h-10 text-gray-400 dark:text-gray-500 group-hover:text-blue-500 transition-colors" />
          )}
          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
              <div className="text-white text-xs font-medium">{uploadProgress}%</div>
            </div>
          )}
        </div>

        <input
          id="photo-upload"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
        />

        <div className="flex space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => document.getElementById("photo-upload")?.click()}
            className="text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-950"
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload Photo
          </Button>
          {formData.profilePicture && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => updateFormData({ profilePicture: "" })}
              className="text-red-600 dark:text-red-400 border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-950"
            >
              Remove
            </Button>
          )}
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center max-w-xs">
          Upload a professional photo. Best if it has good lighting and is square format.
        </p>
        {errors.profilePicture && <p className="text-red-500 text-sm">{errors.profilePicture}</p>}
      </div>

      {/* Form Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* First Name */}
        <div className="space-y-2">
          <Label
            htmlFor="firstName"
            className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2"
          >
            <User className="w-4 h-4" />
            First Name *
          </Label>
          <Input
            id="firstName"
            value={formData.firstName}
            onChange={(e) => handleInputChange("firstName", e.target.value)}
            placeholder="John"
            className={`h-11 border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:border-blue-500 focus:ring-blue-500/20 ${
              errors.firstName ? "border-red-500 focus:border-red-500" : ""
            }`}
          />
          {errors.firstName && <p className="text-red-500 text-sm">{errors.firstName}</p>}
        </div>

        {/* Last Name */}
        <div className="space-y-2">
          <Label
            htmlFor="lastName"
            className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2"
          >
            <User className="w-4 h-4" />
            Last Name *
          </Label>
          <Input
            id="lastName"
            value={formData.lastName}
            onChange={(e) => handleInputChange("lastName", e.target.value)}
            placeholder="Smith"
            className={`h-11 border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:border-blue-500 focus:ring-blue-500/20 ${
              errors.lastName ? "border-red-500 focus:border-red-500" : ""
            }`}
          />
          {errors.lastName && <p className="text-red-500 text-sm">{errors.lastName}</p>}
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label
            htmlFor="email"
            className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2"
          >
            <Mail className="w-4 h-4" />
            Email Address *
          </Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            placeholder="john.smith@example.com"
            className={`h-11 border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:border-blue-500 focus:ring-blue-500/20 ${
              errors.email ? "border-red-500 focus:border-red-500" : ""
            }`}
          />
          {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <Label
            htmlFor="phone"
            className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2"
          >
            <Phone className="w-4 h-4" />
            Phone Number *
          </Label>
          <Input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => handleInputChange("phone", e.target.value)}
            placeholder="+250 788 123 456"
            className={`h-11 border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:border-blue-500 focus:ring-blue-500/20 ${
              errors.phone ? "border-red-500 focus:border-red-500" : ""
            }`}
          />
          {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}
        </div>

        {/* Date of Birth */}
        <div className="space-y-2">
          <Label
            htmlFor="dateOfBirth"
            className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2"
          >
            <Calendar className="w-4 h-4" />
            Date of Birth *
          </Label>
          <Input
            id="dateOfBirth"
            type="date"
            value={formData.dateOfBirth}
            onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
            className={`h-11 border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:border-blue-500 focus:ring-blue-500/20 ${
              errors.dateOfBirth ? "border-red-500 focus:border-red-500" : ""
            }`}
          />
          {errors.dateOfBirth && <p className="text-red-500 text-sm">{errors.dateOfBirth}</p>}
        </div>

        {/* Gender */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Gender *</Label>
          <Select
            value={formData.gender}
            onValueChange={(value: "male" | "female" | "other") => handleInputChange("gender", value)}
          >
            <SelectTrigger
              className={`h-11 border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white ${
                errors.gender ? "border-red-500" : ""
              }`}
            >
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
          {errors.gender && <p className="text-red-500 text-sm">{errors.gender}</p>}
        </div>
      </div>

      {/* Address Section */}
      <div className="space-y-5">
        {/* Address */}
        <div className="space-y-2">
          <Label
            htmlFor="address"
            className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2"
          >
            <MapPin className="w-4 h-4" />
            Street Address *
          </Label>
          <Textarea
            id="address"
            value={formData.address}
            onChange={(e) => handleInputChange("address", e.target.value)}
            placeholder="123 Main Street, Apartment 4B"
            rows={2}
            className={`border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:border-blue-500 focus:ring-blue-500/20 resize-none ${
              errors.address ? "border-red-500 focus:border-red-500" : ""
            }`}
          />
          {errors.address && <p className="text-red-500 text-sm">{errors.address}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* City */}
          <div className="space-y-2">
            <Label htmlFor="city" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              City *
            </Label>
            <Input
              id="city"
              value={formData.city}
              onChange={(e) => handleInputChange("city", e.target.value)}
              placeholder="Kigali"
              className={`h-11 border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:border-blue-500 focus:ring-blue-500/20 ${
                errors.city ? "border-red-500 focus:border-red-500" : ""
              }`}
            />
            {errors.city && <p className="text-red-500 text-sm">{errors.city}</p>}
          </div>

          {/* State */}
          <div className="space-y-2">
            <Label htmlFor="state" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              State/Province *
            </Label>
            <Input
              id="state"
              value={formData.state}
              onChange={(e) => handleInputChange("state", e.target.value)}
              placeholder="Kigali City"
              className={`h-11 border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:border-blue-500 focus:ring-blue-500/20 ${
                errors.state ? "border-red-500 focus:border-red-500" : ""
              }`}
            />
            {errors.state && <p className="text-red-500 text-sm">{errors.state}</p>}
          </div>

          {/* Zip Code */}
          <div className="space-y-2">
            <Label htmlFor="zipCode" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Zip Code *
            </Label>
            <Input
              id="zipCode"
              value={formData.zipCode}
              onChange={(e) => handleInputChange("zipCode", e.target.value)}
              placeholder="00000"
              className={`h-11 border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:border-blue-500 focus:ring-blue-500/20 ${
                errors.zipCode ? "border-red-500 focus:border-red-500" : ""
              }`}
            />
            {errors.zipCode && <p className="text-red-500 text-sm">{errors.zipCode}</p>}
          </div>
        </div>

        {/* Country */}
        <div className="space-y-2">
          <Label
            htmlFor="country"
            className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2"
          >
            <Globe className="w-4 h-4" />
            Country *
          </Label>
          <Input
            id="country"
            value={formData.country}
            onChange={(e) => handleInputChange("country", e.target.value)}
            placeholder="Rwanda"
            className={`h-11 border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:border-blue-500 focus:ring-blue-500/20 ${
              errors.country ? "border-red-500 focus:border-red-500" : ""
            }`}
          />
          {errors.country && <p className="text-red-500 text-sm">{errors.country}</p>}
        </div>
      </div>
    </motion.div>
  )
}
