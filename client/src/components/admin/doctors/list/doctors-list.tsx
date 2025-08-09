// client\src\components\doctors\doctors-list.tsx
'use client'

import { useState, useEffect } from 'react'
import { Plus, Filter, MoreVertical, Users, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { motion } from 'framer-motion'
import DoctorService from '@/services/doctor.service'
import { DoctorFormModal } from '../doctor-form/doctor-form-modal'
import type { Doctor } from '@/types/doctor.types'
import { formatPhoneNumber } from '@/utils/patient.utils'

const daysOfWeek = [
  { key: 'sunday', label: 'S' },
  { key: 'monday', label: 'M' },
  { key: 'tuesday', label: 'T' },
  { key: 'wednesday', label: 'W' },
  { key: 'thursday', label: 'T' },
  { key: 'friday', label: 'F' },
  { key: 'saturday', label: 'S' }
]

export function DoctorsList() {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [activeTab, setActiveTab] = useState('doctor-staff')

  useEffect(() => {
    fetchDoctors()
  }, [])

  const fetchDoctors = async () => {
    try {
      setLoading(true)
      const data = await DoctorService.getAllDoctors({ limit: 50 })
      console.log('Fetched doctors:', data)
      setDoctors(data)
    } catch (error) {
      console.error('Failed to fetch doctors:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredDoctors = doctors.filter(doctor =>
    doctor.user?.names?.toLowerCase().includes(searchTerm.toLowerCase()) 
  )

  const getWorkingDays = (workingHours: Doctor['workingHours']) => {
    return daysOfWeek.map(day => {
      const workingDay = workingHours.find(wh => wh.day.toLowerCase() === day.key)
      return {
        ...day,
        isWorking: workingDay?.isWorking || false
      }
    })
  }

  const getEmploymentType = (doctor: Doctor) => {
    // This would typically come from the API, but we'll derive it from working hours
    const workingDaysCount = doctor.workingHours.filter(wh => wh.isWorking).length
    return workingDaysCount >= 5 ? 'FULL-TIME' : 'PART-TIME'
  }



  return (
    <div className=" bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <TabsList className="grid w-fit grid-cols-2 bg-gray-100">
                <TabsTrigger value="doctor-staff" className="data-[state=active]:bg-white">
                  Doctor Staff
                </TabsTrigger>
                <TabsTrigger value="general-staff" className="data-[state=active]:bg-white">
                  General Staff
                </TabsTrigger>
              </TabsList>

              <div className="flex items-center gap-3">
                <Button variant="outline" className="flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Filters
                </Button>
                <Button 
                  onClick={() => setShowAddModal(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Doctor
                </Button>
              </div>
            </div>

            <TabsContent value="doctor-staff" className="mt-0">
              {/* Stats and Search */}
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <span className="text-2xl font-semibold text-gray-900">{doctors.length}</span>
                    <span className="text-gray-500 ml-2">Doctor</span>
                  </div>
                </div>

                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search doctors..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-80"
                  />
                </div>
              </div>

              {/* Table Header */}
              <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-gray-50 border-b border-gray-200 text-sm font-medium text-gray-600 uppercase tracking-wide">
                <div className="col-span-3">Name</div>
                <div className="col-span-2">Contact</div>
                <div className="col-span-3">Working Days</div>
                <div className="col-span-2">Assigned Treatment</div>
                <div className="col-span-1">Type</div>
                <div className="col-span-1"></div>
              </div>

              {/* Table Content */}
              <div className="divide-y divide-gray-200">
                {loading ? (
                  <div className="p-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-500 mt-2">Loading doctors...</p>
                  </div>
                ) : filteredDoctors.length === 0 ? (
                  <div className="p-8 text-center">
                    <p className="text-gray-500">No doctors found</p>
                  </div>
                ) : (
                  filteredDoctors.map((doctor, index) => {
                    const workingDays = getWorkingDays(doctor.workingHours)
                    const employmentType = getEmploymentType(doctor)
                    
                    return (
                      <motion.div
                        key={doctor._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-gray-50 transition-colors"
                      >
                        {/* Name Column */}
                        <div className="col-span-3 flex items-center gap-3">
                          <Avatar className="w-10 h-10">
                            <AvatarImage 
                              src={doctor.user?.picture || "/placeholder.svg"} 
                              alt={doctor.user?.names}
                            />
                            <AvatarFallback>
                              {doctor.user?.names.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-medium text-gray-900">{doctor.user?.names}</h3>
                            <p className="text-sm text-gray-500">
                              {doctor.specialization.join(', ')}
                            </p>
                          </div>
                        </div>

                        {/* Contact Column */}
                        <div className="col-span-2">
                          <p className="text-sm text-gray-900">
                            {formatPhoneNumber(doctor.user.phoneNumber)}
                          </p>
                          <p className="text-sm text-blue-600 hover:text-blue-800 cursor-pointer">
                            {doctor.user.email}
                          </p>
                        </div>

                        {/* Working Days Column */}
                        <div className="col-span-3 flex items-center gap-1">
                          {workingDays.map((day) => (
                            <div
                              key={day.key}
                              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium ${
                                day.isWorking
                                  ? 'bg-blue-500 text-white'
                                  : 'bg-gray-200 text-gray-400'
                              }`}
                            >
                              {day.label}
                            </div>
                          ))}
                        </div>

                        {/* Assigned Treatment Column */}
                        <div className="col-span-2">
                          <div className="flex flex-wrap gap-1">
                            {doctor.dentalSpecialties.slice(0, 2).map((specialty, idx) => (
                              <span key={idx} className="text-sm text-gray-700">
                                {specialty}
                                {idx < Math.min(doctor.dentalSpecialties.length - 1, 1) && ', '}
                              </span>
                            ))}
                            {doctor.dentalSpecialties.length > 2 && (
                              <span className="text-sm text-blue-600">
                                +{doctor.dentalSpecialties.length - 2}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Type Column */}
                        <div className="col-span-1">
                          <Badge 
                            variant={employmentType === 'FULL-TIME' ? 'default' : 'secondary'}
                            className={
                              employmentType === 'FULL-TIME' 
                                ? 'bg-green-100 text-green-800 hover:bg-green-100' 
                                : 'bg-orange-100 text-orange-800 hover:bg-orange-100'
                            }
                          >
                            {employmentType}
                          </Badge>
                        </div>

                        {/* Actions Column */}
                        <div className="col-span-1 flex justify-end">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>View Profile</DropdownMenuItem>
                              <DropdownMenuItem>Edit Doctor</DropdownMenuItem>
                              <DropdownMenuItem>View Schedule</DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600">
                                Deactivate
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </motion.div>
                    )
                  })
                )}
              </div>
            </TabsContent>

            <TabsContent value="general-staff" className="mt-0">
              <div className="p-8 text-center">
                <p className="text-gray-500">General staff management coming soon...</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Add Doctor Modal */}
      <DoctorFormModal 
        open={showAddModal} 
        onOpenChange={setShowAddModal}
      />
    </div>
  )
}
