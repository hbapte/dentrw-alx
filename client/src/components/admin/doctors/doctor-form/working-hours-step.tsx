import { motion } from 'framer-motion'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Clock } from 'lucide-react'
import { useDoctorFormStore } from '@/store/doctor-form.store'

const days = [
  'Monday',
  'Tuesday', 
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday'
]

const timeSlots = [
  '09:00 am', '10:00 am', '11:00 am', '12:00 pm',
  '01:00 pm', '02:00 pm', '03:00 pm', '04:00 pm', '05:00 pm'
]

export function WorkingHoursStep() {
  const { formData, updateFormData, errors } = useDoctorFormStore()

  const updateWorkingDay = (dayIndex: number, updates: Partial<typeof formData.workingHours[0]>) => {
    const newWorkingHours = [...formData.workingHours]
    newWorkingHours[dayIndex] = { ...newWorkingHours[dayIndex], ...updates }
    updateFormData({ workingHours: newWorkingHours })
  }

  const updateTimeSlot = (dayIndex: number, field: 'startTime' | 'endTime', value: string) => {
    const newWorkingHours = [...formData.workingHours]
    if (newWorkingHours[dayIndex].slots.length === 0) {
      newWorkingHours[dayIndex].slots = [{ startTime: '09:00', endTime: '17:00' }]
    }
    newWorkingHours[dayIndex].slots[0] = {
      ...newWorkingHours[dayIndex].slots[0],
      [field]: value
    }
    updateFormData({ workingHours: newWorkingHours })
  }



  return (
    <motion.div 
      className="space-y-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {days.map((day, index) => {
        const dayData = formData.workingHours[index]
        const isWorking = dayData?.isWorking || false
        
        return (
          <motion.div 
            key={day} 
            className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-white hover:shadow-sm transition-all duration-200"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <div className="flex items-center space-x-4">
              <Switch
                checked={isWorking}
                onCheckedChange={(checked) => 
                  updateWorkingDay(index, { 
                    isWorking: checked,
                    slots: checked ? [{ startTime: '09:00', endTime: '17:00' }] : []
                  })
                }
                className="data-[state=checked]:bg-blue-600"
              />
              <Label className="font-medium text-gray-900 min-w-[80px]">{day}</Label>
            </div>
            
            {isWorking ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <Select
                    value={dayData.slots[0]?.startTime || '09:00'}
                    onValueChange={(value) => updateTimeSlot(index, 'startTime', value)}
                  >
                    <SelectTrigger className="w-28 h-9 text-sm border-gray-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map((time) => (
                        <SelectItem key={time} value={time.split(' ')[0]}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <span className="text-gray-400 text-sm">to</span>
                
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <Select
                    value={dayData.slots[0]?.endTime || '17:00'}
                    onValueChange={(value) => updateTimeSlot(index, 'endTime', value)}
                  >
                    <SelectTrigger className="w-28 h-9 text-sm border-gray-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map((time) => (
                        <SelectItem key={time} value={time.split(' ')[0]}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ) : (
              <span className="text-gray-400 text-sm italic">Not working on this day</span>
            )}
          </motion.div>
        )
      })}
      
      {/* Summary */}
      <motion.div 
        className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-blue-900">
            Working Days
          </span>
          <span className="text-sm font-semibold text-blue-700">
            {formData.workingHours.filter(day => day.isWorking).length} days/week
          </span>
        </div>
      </motion.div>
      
      {errors.workingHours && (
        <motion.p 
          className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-lg p-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {errors.workingHours}
        </motion.p>
      )}
    </motion.div>
  )
}
