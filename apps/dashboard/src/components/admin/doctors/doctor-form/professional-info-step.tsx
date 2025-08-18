"use client"

import { useState } from "react"
import { Plus, X, GraduationCap, Award, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { motion, AnimatePresence } from "framer-motion"
import { useDoctorFormStore } from "@/lib/store"

const specializations = [
  "General Dentistry",
  "Orthodontics",
  "Periodontics",
  "Endodontics",
  "Oral Surgery",
  "Prosthodontics",
  "Pediatric Dentistry",
  "Oral Pathology",
  "Oral Radiology",
  "Cosmetic Dentistry",
  "Implantology",
  "Oral Medicine",
  "Preventive Dentistry",
  "Community Dentistry",
]

const countries = [
  "Rwanda",
  "Kenya",
  "Uganda",
  "Tanzania",
  "Burundi",
  "DRC",
  "United States",
  "United Kingdom",
  "Canada",
  "Germany",
  "France",
  "Other",
]

export function ProfessionalInfoStep() {
  const { formData, updateFormData, errors, clearFieldError } = useDoctorFormStore()
  const [showQualificationForm, setShowQualificationForm] = useState(false)
  const [newQualification, setNewQualification] = useState({
    degree: "",
    institution: "",
    year: new Date().getFullYear(),
    country: "Rwanda",
  })

  const handleInputChange = (field: string, value: any) => {
    updateFormData({ [field]: value })
    if (errors[field]) {
      clearFieldError(field)
    }
  }

  const addQualification = () => {
    if (newQualification.degree && newQualification.institution) {
      const updatedQualifications = [...formData.qualifications, newQualification]
      updateFormData({ qualifications: updatedQualifications })
      setNewQualification({ degree: "", institution: "", year: new Date().getFullYear(), country: "Rwanda" })
      setShowQualificationForm(false)
      if (errors.qualifications) {
        clearFieldError("qualifications")
      }
    }
  }

  const removeQualification = (index: number) => {
    const updatedQualifications = formData.qualifications.filter((_, i) => i !== index)
    updateFormData({ qualifications: updatedQualifications })
  }

  const handleSpecializationChange = (value: string) => {
    const currentSpecs = formData.specialization || []
    if (!currentSpecs.includes(value)) {
      const updatedSpecs = [...currentSpecs, value]
      handleInputChange("specialization", updatedSpecs)
    }
  }

  const removeSpecialization = (spec: string) => {
    const updatedSpecs = formData.specialization.filter((s) => s !== spec)
    handleInputChange("specialization", updatedSpecs)
  }

  return (
    <motion.div className="space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      {/* Specializations */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
          <Award className="w-4 h-4" />
          Specializations *
        </Label>
        <Select onValueChange={handleSpecializationChange}>
          <SelectTrigger
            className={`h-11 border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:border-blue-500 focus:ring-blue-500/20 ${
              errors.specialization ? "border-red-500" : ""
            }`}
          >
            <SelectValue placeholder="Select specializations" />
          </SelectTrigger>
          <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
            {specializations.map((spec) => (
              <SelectItem key={spec} value={spec} className="dark:text-white dark:hover:bg-gray-700">
                {spec}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Selected Specializations */}
        {formData.specialization.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {formData.specialization.map((spec) => (
              <Badge
                key={spec}
                variant="secondary"
                className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
              >
                {spec}
                <button onClick={() => removeSpecialization(spec)} className="ml-2 hover:text-red-600">
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
        {errors.specialization && <p className="text-red-500 text-sm">{errors.specialization}</p>}
      </div>

      {/* Experience */}
      <div className="space-y-2">
        <Label htmlFor="experience" className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Years of Experience
        </Label>
        <Input
          id="experience"
          type="number"
          min="0"
          max="50"
          value={formData.experience}
          onChange={(e) => handleInputChange("experience", Number.parseInt(e.target.value) || 0)}
          placeholder="5"
          className="h-11 border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:border-blue-500 focus:ring-blue-500/20"
        />
      </div>

      {/* License Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label
            htmlFor="licenseNumber"
            className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            License Number *
          </Label>
          <Input
            id="licenseNumber"
            value={formData.licenseNumber}
            onChange={(e) => handleInputChange("licenseNumber", e.target.value)}
            placeholder="DL-2024-001"
            className={`h-11 border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:border-blue-500 focus:ring-blue-500/20 ${
              errors.licenseNumber ? "border-red-500" : ""
            }`}
          />
          {errors.licenseNumber && <p className="text-red-500 text-sm">{errors.licenseNumber}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="licenseExpiryDate" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            License Expiry Date
          </Label>
          <Input
            id="licenseExpiryDate"
            type="date"
            value={formData.licenseExpiryDate}
            onChange={(e) => handleInputChange("licenseExpiryDate", e.target.value)}
            className="h-11 border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:border-blue-500 focus:ring-blue-500/20"
          />
        </div>
      </div>

      {/* Registration Number */}
      <div className="space-y-2">
        <Label htmlFor="registrationNumber" className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Medical Council Registration Number *
        </Label>
        <Input
          id="registrationNumber"
          value={formData.registrationNumber}
          onChange={(e) => handleInputChange("registrationNumber", e.target.value)}
          placeholder="RMC-2024-001"
          className={`h-11 border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:border-blue-500 focus:ring-blue-500/20 ${
            errors.registrationNumber ? "border-red-500" : ""
          }`}
        />
        {errors.registrationNumber && <p className="text-red-500 text-sm">{errors.registrationNumber}</p>}
      </div>

      {/* Qualifications */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <GraduationCap className="w-4 h-4" />
            Qualifications *
          </Label>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowQualificationForm(true)}
            className="text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-950"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Qualification
          </Button>
        </div>

        {/* Existing Qualifications */}
        <AnimatePresence>
          {formData.qualifications.map((qual, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="border border-gray-200 dark:border-gray-700 hover:shadow-sm transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <h4 className="font-medium text-gray-900 dark:text-white">{qual.degree}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{qual.institution}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        {qual.year} • {qual.country}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeQualification(index)}
                      className="h-8 w-8 p-0 hover:bg-red-50 dark:hover:bg-red-950 hover:text-red-600"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Add Qualification Form */}
        <AnimatePresence>
          {showQualificationForm && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="border-2 border-blue-200 dark:border-blue-800 shadow-lg">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900 dark:text-white">Add Qualification</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowQualificationForm(false)}
                      className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Degree</Label>
                      <Input
                        value={newQualification.degree}
                        onChange={(e) => setNewQualification({ ...newQualification, degree: e.target.value })}
                        placeholder="Doctor of Dental Medicine (DMD)"
                        className="mt-1 h-10 border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Institution</Label>
                      <Input
                        value={newQualification.institution}
                        onChange={(e) => setNewQualification({ ...newQualification, institution: e.target.value })}
                        placeholder="University of Rwanda"
                        className="mt-1 h-10 border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Year</Label>
                      <Input
                        type="number"
                        min="1950"
                        max={new Date().getFullYear()}
                        value={newQualification.year}
                        onChange={(e) =>
                          setNewQualification({ ...newQualification, year: Number.parseInt(e.target.value) })
                        }
                        className="mt-1 h-10 border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Country</Label>
                      <Select
                        value={newQualification.country}
                        onValueChange={(value) => setNewQualification({ ...newQualification, country: value })}
                      >
                        <SelectTrigger className="mt-1 h-10 border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                          {countries.map((country) => (
                            <SelectItem
                              key={country}
                              value={country}
                              className="dark:text-white dark:hover:bg-gray-700"
                            >
                              {country}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex space-x-3 pt-2">
                    <Button
                      onClick={addQualification}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white"
                      disabled={!newQualification.degree || !newQualification.institution}
                    >
                      Add Qualification
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowQualificationForm(false)}
                      className="flex-1 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {errors.qualifications && <p className="text-red-500 text-sm">{errors.qualifications}</p>}
      </div>
    </motion.div>
  )
}
