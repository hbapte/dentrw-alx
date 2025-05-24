"use client"

import type React from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Briefcase, Award, FileText, Globe, DollarSign, Clock, Plus, Trash2 } from "lucide-react"
import { doctorSchema, type DoctorFormSchema } from "../../validations/doctor.validations"
import type { DoctorFormData, DayOfWeek } from "../../types/doctor.types"
import { createEmptyAvailability, createEmptyTimeSlot, getDaysOfWeek, formatDayOfWeek } from "../../utils/doctor.utils"

interface DoctorFormProps {
  initialData?: DoctorFormData
  onSubmit: (data: DoctorFormData) => void
  isEditing?: boolean
  users?: { id: string; name: string }[]
}

const DoctorForm: React.FC<DoctorFormProps> = ({ initialData, onSubmit, isEditing = false, users = [] }) => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<DoctorFormSchema>({
    resolver: zodResolver(doctorSchema),
    defaultValues: {
      userId: initialData?.userId || "",
      specialization: initialData?.specialization || "",
      qualifications: initialData?.qualifications || "",
      experience: initialData?.experience || 0,
      licenseNumber: initialData?.licenseNumber || "",
      bio: initialData?.bio || "",
      languages: initialData?.languages || "",
      consultationFee: initialData?.consultationFee || 0,
      availability: initialData?.availability || getDaysOfWeek().map((day) => createEmptyAvailability(day)),
    },
  })

  const availability = watch("availability") || []

  const handleFormSubmit = (data: DoctorFormSchema) => {
    // Convert form schema to DoctorFormData with proper type safety
    const formData: DoctorFormData = {
      userId: data.userId,
      specialization: data.specialization,
      qualifications: data.qualifications,
      experience: data.experience,
      licenseNumber: data.licenseNumber,
      bio: data.bio || "", // Ensure bio is always a string
      languages: data.languages,
      consultationFee: data.consultationFee,
      availability: (data.availability || []).map((a) => ({
        ...a,
        day: a.day as DayOfWeek,
      })),
    }
    onSubmit(formData)
  }

  const handleAddTimeSlot = (dayIndex: number) => {
    const newAvailability = [...availability]
    if (newAvailability[dayIndex]) {
      newAvailability[dayIndex].slots.push(createEmptyTimeSlot())
      setValue("availability", newAvailability)
    }
  }

  const handleRemoveTimeSlot = (dayIndex: number, slotIndex: number) => {
    const newAvailability = [...availability]
    if (newAvailability[dayIndex] && newAvailability[dayIndex].slots.length > 1) {
      newAvailability[dayIndex].slots.splice(slotIndex, 1)
      setValue("availability", newAvailability)
    }
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {users.length > 0 && (
          <div className="sm:col-span-2">
            <label htmlFor="userId" className="block text-sm font-medium text-gray-700">
              User
            </label>
            <div className="mt-1">
              <select
                id="userId"
                {...register("userId")}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="">Select a user</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
            </div>
            {errors.userId && <p className="mt-1 text-sm text-red-600">{errors.userId.message}</p>}
          </div>
        )}

        <div>
          <label htmlFor="specialization" className="block text-sm font-medium text-gray-700">
            Specialization
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Briefcase className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              id="specialization"
              {...register("specialization")}
              className="block w-full pl-10 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="e.g., Cardiology, Pediatrics"
            />
          </div>
          {errors.specialization && <p className="mt-1 text-sm text-red-600">{errors.specialization.message}</p>}
        </div>

        <div>
          <label htmlFor="licenseNumber" className="block text-sm font-medium text-gray-700">
            License Number
          </label>
          <div className="mt-1">
            <input
              type="text"
              id="licenseNumber"
              {...register("licenseNumber")}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          {errors.licenseNumber && <p className="mt-1 text-sm text-red-600">{errors.licenseNumber.message}</p>}
        </div>

        <div>
          <label htmlFor="qualifications" className="block text-sm font-medium text-gray-700">
            Qualifications
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Award className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              id="qualifications"
              {...register("qualifications")}
              className="block w-full pl-10 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="e.g., MD, PhD, MBBS (comma separated)"
            />
          </div>
          {errors.qualifications && <p className="mt-1 text-sm text-red-600">{errors.qualifications.message}</p>}
        </div>

        <div>
          <label htmlFor="experience" className="block text-sm font-medium text-gray-700">
            Experience (years)
          </label>
          <div className="mt-1">
            <input
              type="number"
              id="experience"
              {...register("experience", { valueAsNumber: true })}
              min="0"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          {errors.experience && <p className="mt-1 text-sm text-red-600">{errors.experience.message}</p>}
        </div>

        <div>
          <label htmlFor="languages" className="block text-sm font-medium text-gray-700">
            Languages
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Globe className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              id="languages"
              {...register("languages")}
              className="block w-full pl-10 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="e.g., English, Spanish (comma separated)"
            />
          </div>
          {errors.languages && <p className="mt-1 text-sm text-red-600">{errors.languages.message}</p>}
        </div>

        <div>
          <label htmlFor="consultationFee" className="block text-sm font-medium text-gray-700">
            Consultation Fee
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <DollarSign className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="number"
              id="consultationFee"
              {...register("consultationFee", { valueAsNumber: true })}
              min="0"
              step="0.01"
              className="block w-full pl-10 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          {errors.consultationFee && <p className="mt-1 text-sm text-red-600">{errors.consultationFee.message}</p>}
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
            Bio
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 pt-3 pointer-events-none">
              <FileText className="h-5 w-5 text-gray-400" />
            </div>
            <textarea
              id="bio"
              rows={4}
              {...register("bio")}
              className="block w-full pl-10 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="Professional background and expertise"
            />
          </div>
          {errors.bio && <p className="mt-1 text-sm text-red-600">{errors.bio.message}</p>}
        </div>

        <div className="sm:col-span-2">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Availability Schedule</h3>
          <div className="space-y-4">
            <Controller
              control={control}
              name="availability"
              render={({ field }) => (
                <div className="space-y-6">
                  {field.value &&
                    field.value.map((daySchedule, dayIndex) => (
                      <div key={daySchedule.day} className="border rounded-md p-4">
                        <h4 className="font-medium text-gray-700 mb-2">
                          {formatDayOfWeek(daySchedule.day as DayOfWeek)}
                        </h4>
                        <div className="space-y-3">
                          {daySchedule.slots.map((slot, slotIndex) => (
                            <div key={slot.id || slotIndex} className="flex items-center space-x-3">
                              <div className="flex-shrink-0">
                                <Clock className="h-5 w-5 text-gray-400" />
                              </div>
                              <div className="flex-grow grid grid-cols-2 gap-3">
                                <div>
                                  <label
                                    htmlFor={`start-${dayIndex}-${slotIndex}`}
                                    className="block text-xs font-medium text-gray-500"
                                  >
                                    Start Time
                                  </label>
                                  <input
                                    type="time"
                                    id={`start-${dayIndex}-${slotIndex}`}
                                    value={slot.startTime}
                                    onChange={(e) => {
                                      if (field.value) {
                                        const newValue = [...field.value]
                                        newValue[dayIndex].slots[slotIndex].startTime = e.target.value
                                        field.onChange(newValue)
                                      }
                                    }}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                  />
                                </div>
                                <div>
                                  <label
                                    htmlFor={`end-${dayIndex}-${slotIndex}`}
                                    className="block text-xs font-medium text-gray-500"
                                  >
                                    End Time
                                  </label>
                                  <input
                                    type="time"
                                    id={`end-${dayIndex}-${slotIndex}`}
                                    value={slot.endTime}
                                    onChange={(e) => {
                                      if (field.value) {
                                        const newValue = [...field.value]
                                        newValue[dayIndex].slots[slotIndex].endTime = e.target.value
                                        field.onChange(newValue)
                                      }
                                    }}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                  />
                                </div>
                              </div>
                              <div className="flex-shrink-0">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveTimeSlot(dayIndex, slotIndex)}
                                  disabled={daySchedule.slots.length <= 1}
                                  className="inline-flex items-center p-1 border border-transparent rounded-full text-red-600 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                                >
                                  <Trash2 className="h-4 w-4" />
                                  <span className="sr-only">Remove time slot</span>
                                </button>
                              </div>
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => handleAddTimeSlot(dayIndex)}
                            className="mt-2 inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            Add Time Slot
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          {isSubmitting ? "Saving..." : isEditing ? "Update Doctor" : "Create Doctor"}
        </button>
      </div>
    </form>
  )
}

export default DoctorForm
