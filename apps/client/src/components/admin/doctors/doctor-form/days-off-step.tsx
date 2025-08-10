import { useState } from 'react'
import { Plus, X, Calendar, RotateCcw } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useDoctorFormStore } from '@/store/doctor-form.store'

export function DaysOffStep() {
  const { formData, updateFormData } = useDoctorFormStore()
  const [showAddForm, setShowAddForm] = useState(false)
  const [newDayOff, setNewDayOff] = useState({
    name: '',
    startDate: '',
    endDate: '',
    repeatYearly: false
  })

  const addDayOff = () => {
    if (newDayOff.name && newDayOff.startDate && newDayOff.endDate) {
      updateFormData({
        daysOff: [...(formData.daysOff || []), newDayOff]
      })
      setNewDayOff({ name: '', startDate: '', endDate: '', repeatYearly: false })
      setShowAddForm(false)
    }
  }

  const removeDayOff = (index: number) => {
    const newDaysOff = formData.daysOff?.filter((_, i) => i !== index) || []
    updateFormData({ daysOff: newDaysOff })
  }

  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate).toLocaleDateString('en-US', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    })
    const end = new Date(endDate).toLocaleDateString('en-US', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    })
    return `${start} - ${end}`
  }

  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Existing Days Off */}
      <AnimatePresence>
        {formData.daysOff?.map((dayOff, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border border-gray-200 hover:shadow-sm transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-medium text-gray-900">{dayOff.name}</h4>
                      <p className="text-sm text-gray-500">
                        {formatDateRange(dayOff.startDate, dayOff.endDate)}
                      </p>
                      {dayOff.repeatYearly && (
                        <Badge variant="secondary" className="bg-green-100 text-green-700">
                          <RotateCcw className="w-3 h-3 mr-1" />
                          Repeat yearly
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeDayOff(index)}
                    className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Add Day Off Modal */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="border-2 border-blue-200 shadow-lg">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Plus className="w-5 h-5 text-blue-600" />
                    Add Day Off
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAddForm(false)}
                    className="h-8 w-8 p-0 hover:bg-gray-100"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="dayOffName" className="text-sm font-medium text-gray-700">
                      Day Off Name
                    </Label>
                    <Input
                      id="dayOffName"
                      value={newDayOff.name}
                      onChange={(e) => setNewDayOff({ ...newDayOff, name: e.target.value })}
                      placeholder="Maternity leave"
                      className="mt-1 h-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="startDate" className="text-sm font-medium text-gray-700">
                        Date
                      </Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={newDayOff.startDate}
                        onChange={(e) => setNewDayOff({ ...newDayOff, startDate: e.target.value })}
                        className="mt-1 h-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                      />
                    </div>
                    <div>
                      <Label htmlFor="endDate" className="text-sm font-medium text-gray-700">
                        to
                      </Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={newDayOff.endDate}
                        onChange={(e) => setNewDayOff({ ...newDayOff, endDate: e.target.value })}
                        className="mt-1 h-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="repeatYearly"
                      checked={newDayOff.repeatYearly}
                      onCheckedChange={(checked) => 
                        setNewDayOff({ ...newDayOff, repeatYearly: checked as boolean })
                      }
                      className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                    />
                    <Label htmlFor="repeatYearly" className="text-sm text-gray-700">
                      Repeat this day off yearly
                    </Label>
                  </div>

                  <div className="flex space-x-3 pt-2">
                    <Button 
                      onClick={addDayOff} 
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                      disabled={!newDayOff.name || !newDayOff.startDate || !newDayOff.endDate}
                    >
                      Save
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setShowAddForm(false)}
                      className="flex-1 border-gray-200 text-gray-600 hover:bg-gray-50"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Button */}
      {!showAddForm && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Button
            variant="outline"
            onClick={() => setShowAddForm(true)}
            className="w-full h-12 border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 text-gray-600 hover:text-blue-600 transition-all duration-200"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Day Off
          </Button>
        </motion.div>
      )}

      {/* Summary */}
      {formData.daysOff && formData.daysOff.length > 0 && (
        <motion.div 
          className="bg-blue-50 border border-blue-200 rounded-lg p-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-blue-900">
              Total Days Off
            </span>
            <Badge className="bg-blue-600 text-white">
              {formData.daysOff.length}
            </Badge>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
