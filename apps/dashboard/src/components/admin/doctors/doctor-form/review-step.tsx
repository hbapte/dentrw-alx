"use client"

import { CheckCircle, User, Award, Stethoscope, Clock, Calendar } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import { useDoctorFormStore } from "@/lib/store"

export function ReviewStep() {
  const { formData } = useDoctorFormStore()

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-RW", {
      style: "currency",
      currency: "RWF",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const getWorkingDaysCount = () => {
    return formData.workingHours.filter((day) => day.isWorking).length
  }

  return (
    <motion.div className="space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Review Doctor Information</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Please review all information before creating the doctor profile
        </p>
      </div>

      {/* Personal Information */}
      <Card className="border border-gray-200 dark:border-gray-700">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-4">
            {formData.picture && (
              <img
                src={formData.picture || "/placeholder.svg"}
                alt="Doctor"
                className="w-16 h-16 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
              />
            )}
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">{formData.names}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{formData.email}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{formData.phone}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Employment Type:</span>
              <Badge variant="secondary" className="ml-2 capitalize">
                {formData.type.replace("-", " ")}
              </Badge>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Address:</span>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{formData.address}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Professional Information */}
      <Card className="border border-gray-200 dark:border-gray-700">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Award className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Professional Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Specializations:</span>
            <div className="flex flex-wrap gap-2 mt-1">
              {formData.specialization.map((spec) => (
                <Badge
                  key={spec}
                  variant="secondary"
                  className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                >
                  {spec}
                </Badge>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Experience:</span>
              <p className="text-sm text-gray-600 dark:text-gray-400">{formData.experience} years</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">License Number:</span>
              <p className="text-sm text-gray-600 dark:text-gray-400">{formData.licenseNumber}</p>
            </div>
          </div>

          {formData.qualifications.length > 0 && (
            <div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Qualifications:</span>
              <div className="space-y-2 mt-1">
                {formData.qualifications.map((qual, index) => (
                  <div key={index} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                    <p className="font-medium text-gray-900 dark:text-white">{qual.degree}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {qual.institution} • {qual.year} • {qual.country}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Practice Details */}
      <Card className="border border-gray-200 dark:border-gray-700">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Stethoscope className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Practice Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Bio:</span>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 leading-relaxed">{formData.bio}</p>
          </div>

          <div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Languages:</span>
            <div className="flex flex-wrap gap-2 mt-1">
              {formData.languages.map((lang) => (
                <Badge
                  key={lang}
                  variant="secondary"
                  className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"
                >
                  {lang}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Consultation Fees:</span>
            <div className="grid grid-cols-3 gap-4 mt-2">
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400">Initial</p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {formatCurrency(formData.consultationFee.initial)}
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400">Follow-up</p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {formatCurrency(formData.consultationFee.followUp)}
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400">Emergency</p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {formatCurrency(formData.consultationFee.emergency)}
                </p>
              </div>
            </div>
          </div>

          <div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Services Offered:</span>
            <div className="flex flex-wrap gap-2 mt-1">
              {formData.dentalSpecialties.slice(0, 6).map((service) => (
                <Badge
                  key={service}
                  variant="secondary"
                  className="bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300"
                >
                  {service}
                </Badge>
              ))}
              {formData.dentalSpecialties.length > 6 && (
                <Badge variant="secondary" className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                  +{formData.dentalSpecialties.length - 6} more
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Schedule Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border border-gray-200 dark:border-gray-700">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Working Hours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {formData.workingHours
                .filter((day) => day.isWorking)
                .map((day) => (
                  <div key={day.day} className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">{day.day}</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {day.slots[0]?.startTime} - {day.slots[0]?.endTime}
                    </span>
                  </div>
                ))}
            </div>
            <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Working Days</span>
                <Badge className="bg-blue-600 text-white">{getWorkingDaysCount()} days/week</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 dark:border-gray-700">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Days Off
            </CardTitle>
          </CardHeader>
          <CardContent>
            {formData.daysOff && formData.daysOff.length > 0 ? (
              <div className="space-y-2">
                {formData.daysOff.slice(0, 3).map((dayOff, index) => (
                  <div key={index} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                    <p className="font-medium text-gray-900 dark:text-white text-sm">{dayOff.name}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {new Date(dayOff.startDate).toLocaleDateString()} -{" "}
                      {new Date(dayOff.endDate).toLocaleDateString()}
                    </p>
                  </div>
                ))}
                {formData.daysOff.length > 3 && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                    +{formData.daysOff.length - 3} more days off
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">No days off scheduled</p>
            )}
          </CardContent>
        </Card>
      </div>
    </motion.div>
  )
}
