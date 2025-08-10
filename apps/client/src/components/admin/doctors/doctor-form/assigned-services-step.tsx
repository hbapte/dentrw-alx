import { motion } from 'framer-motion'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { ChevronUp, ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { useDoctorFormStore } from '@/store/doctor-form.store'

const serviceCategories = {
  'Cosmetic services': [
    'Teeth Whitening',
    'Dental Veneers', 
    'Dental Bonding',
    'Dental Crown',
    'Inlays and Onlays',
    'Dental Implants'
  ],
  'Treatment service': [
    'Bridges',
    'Crowns',
    'Fillings',
    'Root canal treatment'
  ]
}

export function AssignedServicesStep() {
  const { formData, updateFormData, errors } = useDoctorFormStore()
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    'Cosmetic services': true,
    'Treatment service': true
  })

  const handleServiceToggle = (service: string, checked: boolean) => {
    const currentServices = formData.dentalSpecialties || []
    
    if (checked) {
      updateFormData({ 
        dentalSpecialties: [...currentServices, service] 
      })
    } else {
      updateFormData({ 
        dentalSpecialties: currentServices.filter(s => s !== service) 
      })
    }
  }

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }))
  }

  const getCategorySelectedCount = (services: string[]) => {
    return services.filter(service => formData.dentalSpecialties?.includes(service)).length
  }

  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {Object.entries(serviceCategories).map(([category, services], categoryIndex) => {
        const selectedCount = getCategorySelectedCount(services)
        const isExpanded = expandedCategories[category]
        
        return (
          <motion.div 
            key={category} 
            className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: categoryIndex * 0.1 }}
          >
            {/* Category Header */}
            <div 
              className="flex items-center justify-between p-4 bg-gray-50/50 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => toggleCategory(category)}
            >
              <div className="flex items-center gap-3">
                <h3 className="font-medium text-gray-900">{category}</h3>
                <Badge 
                  variant="secondary" 
                  className="bg-blue-100 text-blue-700 hover:bg-blue-100"
                >
                  {selectedCount} Selected
                </Badge>
              </div>
              <button className="p-1 hover:bg-gray-200 rounded-full transition-colors">
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4 text-gray-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                )}
              </button>
            </div>
            
            {/* Services List */}
            <motion.div
              initial={false}
              animate={{ 
                height: isExpanded ? 'auto' : 0,
                opacity: isExpanded ? 1 : 0
              }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="p-4 space-y-4">
                {services.map((service, serviceIndex) => (
                  <motion.div 
                    key={service} 
                    className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: (categoryIndex * 0.1) + (serviceIndex * 0.05) }}
                  >
                    <Checkbox
                      id={service}
                      checked={formData.dentalSpecialties?.includes(service) || false}
                      onCheckedChange={(checked) => handleServiceToggle(service, checked as boolean)}
                      className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                    />
                    <Label 
                      htmlFor={service} 
                      className="text-sm font-normal text-gray-700 cursor-pointer flex-1"
                    >
                      {service}
                    </Label>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )
      })}
      
      {/* Summary */}
      <motion.div 
        className="bg-blue-50 border border-blue-200 rounded-lg p-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-blue-900">
            Total Services Selected
          </span>
          <Badge className="bg-blue-600 text-white">
            {formData.dentalSpecialties?.length || 0}
          </Badge>
        </div>
      </motion.div>
      
      {errors.dentalSpecialties && (
        <motion.p 
          className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-lg p-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {errors.dentalSpecialties}
        </motion.p>
      )}
    </motion.div>
  )
}
