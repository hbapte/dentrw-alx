// apps\client\src\components\admin\doctors\doctor-form\staff-info-step.tsx
import { useState } from 'react'
import { Upload, User, Mail, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { motion } from 'framer-motion'
import { useDoctorFormStore } from '@/store/doctor-form.store'

const specializations = [
  'Oral Surgeon',
  'Pediatric Dentistry', 
  'Gear Conversion',
  'General Dentistry',
  'Orthodontics',
  'Periodontics',
  'Endodontics',
  'Prosthodontics',
  'Cosmetic Dentistry',
  'Implantology'
]

export function StaffInfoStep() {
  const { formData, updateFormData, uploadPicture, uploadProgress, errors } = useDoctorFormStore()
  const [dragActive, setDragActive] = useState(false)

  const handleFileUpload = async (file: File) => {
    if (file && file.type.startsWith('image/')) {
      await uploadPicture(file)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
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

  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Photo Upload Section */}
      <div className="flex flex-col items-center space-y-4 pb-6 border-b border-gray-100">
        <div
          className={`relative w-20 h-20 rounded-full border-2 border-dashed transition-all duration-200 ${
            dragActive 
              ? 'border-blue-400 bg-blue-50 scale-105' 
              : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50/50'
          } flex items-center justify-center cursor-pointer group`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => document.getElementById('photo-upload')?.click()}
        >
          {formData.picture ? (
            <img
              src={formData.picture || "/placeholder.svg"}
              alt="Doctor"
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <User className="w-8 h-8 text-gray-400 group-hover:text-blue-500 transition-colors" />
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
            onClick={() => document.getElementById('photo-upload')?.click()}
            className="text-blue-600 border-blue-200 hover:bg-blue-50"
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload Photo
          </Button>
          {formData.picture && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => updateFormData({ picture: '' })}
              className="text-red-600 border-red-200 hover:bg-red-50"
            >
              Delete
            </Button>
          )}
        </div>
        <p className="text-xs text-gray-500 text-center max-w-xs">
          An image of the person. It's best if it has the same light and height.
        </p>
        {errors.picture && <p className="text-red-500 text-sm">{errors.picture}</p>}
      </div>

      {/* Form Fields */}
      <div className="space-y-5">
        {/* Employment Type */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-gray-700">Type</Label>
          <div className="flex space-x-3">
            <Button
              type="button"
              variant={formData.type === 'full-time' ? 'default' : 'outline'}
              onClick={() => updateFormData({ type: 'full-time' })}
              className={`flex-1 h-11 ${
                formData.type === 'full-time' 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm' 
                  : 'border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Full time
            </Button>
            <Button
              type="button"
              variant={formData.type === 'part-time' ? 'default' : 'outline'}
              onClick={() => updateFormData({ type: 'part-time' })}
              className={`flex-1 h-11 ${
                formData.type === 'part-time' 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm' 
                  : 'border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Part-Time
            </Button>
          </div>
        </div>

        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="names" className="text-sm font-medium text-gray-700">Name</Label>
          <Input
            id="names"
            value={formData.names}
            onChange={(e) => updateFormData({ names: e.target.value })}
            placeholder="Darrel stuwert"
            className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
          />
          {errors.names && <p className="text-red-500 text-sm">{errors.names}</p>}
        </div>

        {/* Specialist */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">Specialist</Label>
          <Select
            value={formData.specialization[0] || ''}
            onValueChange={(value) => updateFormData({ specialization: [value] })}
          >
            <SelectTrigger className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20">
              <SelectValue placeholder="Select specialist doctor" />
            </SelectTrigger>
            <SelectContent>
              {specializations.map((spec) => (
                <SelectItem key={spec} value={spec} className="py-2">
                  <div className="flex flex-col">
                    <span className="font-medium">{spec}</span>
                    <span className="text-xs text-gray-500">Sp.BMMF</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.specialization && <p className="text-red-500 text-sm">{errors.specialization}</p>}
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Email
          </Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => updateFormData({ email: e.target.value })}
            placeholder="darrelstuwerr@gmail.com"
            className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
          />
          {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
        </div>

        {/* Address */}
        <div className="space-y-2">
          <Label htmlFor="address" className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Address
          </Label>
          <Textarea
            id="address"
            value={formData.address}
            onChange={(e) => updateFormData({ address: e.target.value })}
            placeholder="North Arizona, AZ 32 TH"
            rows={3}
            className="border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 resize-none"
          />
          <div className="flex justify-end">
            <span className="text-xs text-gray-400">{formData.address.length}/200</span>
          </div>
          {errors.address && <p className="text-red-500 text-sm">{errors.address}</p>}
        </div>
      </div>
    </motion.div>
  )
}
