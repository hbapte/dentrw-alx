// client/src/components/auth/steps/PreferencesStep.tsx
"use client"

import type React from "react"
import { motion } from "framer-motion"
import { Globe } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { containerVariants} from "@/constants/animations"
import type { RegisterFormData } from "@/store/register-form-store"

interface PreferencesStepProps {
  formData: RegisterFormData
  handleSelectChange: (value: string) => void
  loading: boolean
  disabled: boolean | undefined
}

export const PreferencesStep: React.FC<PreferencesStepProps> = ({
  formData,
  handleSelectChange,
  loading,
  disabled,
}) => {
  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4">
      {/* Language Preference */}
      <motion.div 
    //   variants={itemVariants} 
      className="space-y-2">
        <Label htmlFor="preferredLanguage" className="text-gray-700">
          Preferred Language
        </Label>
        <div className="relative group">
          <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-500 group-hover:text-blue-600 transition-colors z-10" />
          <Select value={formData.preferredLanguage} onValueChange={handleSelectChange} disabled={loading || disabled}>
            <SelectTrigger className="pl-10 border-gray-300 bg-white/70 focus:border-blue-500 focus:ring-blue-500 transition-all rounded-lg">
              <SelectValue placeholder="Select a language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="fr">French</SelectItem>
              <SelectItem value="rw">Kinyarwanda</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </motion.div>
    </motion.div>
  )
}
