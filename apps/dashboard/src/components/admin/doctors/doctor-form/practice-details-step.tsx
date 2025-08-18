"use client"
import { Stethoscope, Globe, DollarSign, CheckCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import { useDoctorFormStore } from "@/lib/store"

const languages = ["English", "French", "Kinyarwanda", "Swahili", "German", "Spanish", "Portuguese"]

const dentalSpecialties = [
  "Teeth Cleaning",
  "Fillings",
  "Root Canal",
  "Crowns & Bridges",
  "Dental Implants",
  "Teeth Whitening",
  "Orthodontic Braces",
  "Invisalign",
  "Oral Surgery",
  "Gum Treatment",
  "Pediatric Care",
  "Emergency Care",
  "Cosmetic Dentistry",
  "Dentures",
  "TMJ Treatment",
]

export function PracticeDetailsStep() {
  const { formData, updateFormData, errors, clearFieldError } = useDoctorFormStore()

  const handleInputChange = (field: string, value: any) => {
    updateFormData({ [field]: value })
    if (errors[field]) {
      clearFieldError(field)
    }
  }

  const handleLanguageToggle = (language: string, checked: boolean) => {
    const currentLanguages = formData.languages || []
    let updatedLanguages

    if (checked) {
      updatedLanguages = [...currentLanguages, language]
    } else {
      updatedLanguages = currentLanguages.filter((l) => l !== language)
    }

    handleInputChange("languages", updatedLanguages)
  }

  const handleSpecialtyToggle = (specialty: string, checked: boolean) => {
    const currentSpecialties = formData.dentalSpecialties || []
    let updatedSpecialties

    if (checked) {
      updatedSpecialties = [...currentSpecialties, specialty]
    } else {
      updatedSpecialties = currentSpecialties.filter((s) => s !== specialty)
    }

    handleInputChange("dentalSpecialties", updatedSpecialties)
  }

  const handleConsultationFeeChange = (field: string, value: string) => {
    const numValue = Number.parseFloat(value) || 0
    const updatedFees = { ...formData.consultationFee, [field]: numValue }
    updateFormData({ consultationFee: updatedFees })

    const errorField = `consultationFee.${field}`
    if (errors[errorField]) {
      clearFieldError(errorField)
    }
  }

  return (
    <motion.div className="space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      {/* Bio */}
      <div className="space-y-2">
        <Label htmlFor="bio" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
          <Stethoscope className="w-4 h-4" />
          Professional Bio *
        </Label>
        <Textarea
          id="bio"
          value={formData.bio}
          onChange={(e) => handleInputChange("bio", e.target.value)}
          placeholder="Tell us about your experience, approach to patient care, and what makes you unique as a dental professional..."
          rows={4}
          className={`border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:border-blue-500 focus:ring-blue-500/20 resize-none ${
            errors.bio ? "border-red-500" : ""
          }`}
        />
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-400 dark:text-gray-500">{formData.bio.length}/1000</span>
          {errors.bio && <p className="text-red-500 text-sm">{errors.bio}</p>}
        </div>
      </div>

      {/* Languages */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
          <Globe className="w-4 h-4" />
          Languages Spoken *
        </Label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {languages.map((language) => (
            <div key={language} className="flex items-center space-x-2">
              <Checkbox
                id={language}
                checked={formData.languages?.includes(language) || false}
                onCheckedChange={(checked) => handleLanguageToggle(language, checked as boolean)}
                className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
              />
              <Label htmlFor={language} className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                {language}
              </Label>
            </div>
          ))}
        </div>
        {formData.languages && formData.languages.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {formData.languages.map((lang) => (
              <Badge
                key={lang}
                variant="secondary"
                className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"
              >
                <CheckCircle className="w-3 h-3 mr-1" />
                {lang}
              </Badge>
            ))}
          </div>
        )}
        {errors.languages && <p className="text-red-500 text-sm">{errors.languages}</p>}
      </div>

      {/* Consultation Fees */}
      <div className="space-y-4">
        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
          <DollarSign className="w-4 h-4" />
          Consultation Fees (RWF) *
        </Label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="initialFee" className="text-xs text-gray-600 dark:text-gray-400">
              Initial Consultation
            </Label>
            <Input
              id="initialFee"
              type="number"
              min="0"
              value={formData.consultationFee.initial || ""}
              onChange={(e) => handleConsultationFeeChange("initial", e.target.value)}
              placeholder="50000"
              className={`h-10 border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:border-blue-500 focus:ring-blue-500/20 ${
                errors["consultationFee.initial"] ? "border-red-500" : ""
              }`}
            />
            {errors["consultationFee.initial"] && (
              <p className="text-red-500 text-xs">{errors["consultationFee.initial"]}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="followUpFee" className="text-xs text-gray-600 dark:text-gray-400">
              Follow-up
            </Label>
            <Input
              id="followUpFee"
              type="number"
              min="0"
              value={formData.consultationFee.followUp || ""}
              onChange={(e) => handleConsultationFeeChange("followUp", e.target.value)}
              placeholder="30000"
              className={`h-10 border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:border-blue-500 focus:ring-blue-500/20 ${
                errors["consultationFee.followUp"] ? "border-red-500" : ""
              }`}
            />
            {errors["consultationFee.followUp"] && (
              <p className="text-red-500 text-xs">{errors["consultationFee.followUp"]}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="emergencyFee" className="text-xs text-gray-600 dark:text-gray-400">
              Emergency
            </Label>
            <Input
              id="emergencyFee"
              type="number"
              min="0"
              value={formData.consultationFee.emergency || ""}
              onChange={(e) => handleConsultationFeeChange("emergency", e.target.value)}
              placeholder="75000"
              className="h-10 border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:border-blue-500 focus:ring-blue-500/20"
            />
          </div>
        </div>
      </div>

      {/* Dental Specialties */}
      <div className="space-y-4">
        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
          <Stethoscope className="w-4 h-4" />
          Services Offered *
        </Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {dentalSpecialties.map((specialty) => (
            <div
              key={specialty}
              className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <Checkbox
                id={specialty}
                checked={formData.dentalSpecialties?.includes(specialty) || false}
                onCheckedChange={(checked) => handleSpecialtyToggle(specialty, checked as boolean)}
                className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
              />
              <Label htmlFor={specialty} className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer flex-1">
                {specialty}
              </Label>
            </div>
          ))}
        </div>

        {/* Selected Services Summary */}
        {formData.dentalSpecialties && formData.dentalSpecialties.length > 0 && (
          <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-900 dark:text-blue-300">Selected Services</span>
              <Badge className="bg-blue-600 text-white">{formData.dentalSpecialties.length}</Badge>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.dentalSpecialties.slice(0, 5).map((service) => (
                <Badge
                  key={service}
                  variant="secondary"
                  className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs"
                >
                  {service}
                </Badge>
              ))}
              {formData.dentalSpecialties.length > 5 && (
                <Badge
                  variant="secondary"
                  className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs"
                >
                  +{formData.dentalSpecialties.length - 5} more
                </Badge>
              )}
            </div>
          </div>
        )}
        {errors.dentalSpecialties && <p className="text-red-500 text-sm">{errors.dentalSpecialties}</p>}
      </div>
    </motion.div>
  )
}
