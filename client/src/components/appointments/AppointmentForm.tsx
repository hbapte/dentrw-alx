"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Calendar, Clock, User, UserPlus, FileText, MessageSquare, Check } from "lucide-react"
import { appointmentSchema, type AppointmentFormSchema } from "../../validations/appointment.validations"
import type { AppointmentFormData } from "../../types/appointment.types"
import { generateTimeSlots } from "../../utils/appointment.utils"
import api from "../../services/api"

interface AppointmentFormProps {
  initialData?: AppointmentFormData
  onSubmit: (data: AppointmentFormData) => void
  isEditing?: boolean
  patientId?: string
  doctorId?: string
}

interface Patient {
  id: string
  name: string
}

interface Doctor {
  id: string
  name: string
  specialization: string
}

const AppointmentForm: React.FC<AppointmentFormProps> = ({
  initialData,
  onSubmit,
  isEditing = false,
  patientId,
  doctorId,
}) => {
  const [patients, setPatients] = useState<Patient[]>([])
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loadingOptions, setLoadingOptions] = useState(false)
  const [checkingAvailability, setCheckingAvailability] = useState(false)
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<AppointmentFormSchema>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: initialData || {
      patientId: patientId || "",
      doctorId: doctorId || "",
      date: "",
      startTime: "",
      endTime: "",
      type: "consultation",
      notes: "",
      reason: "",
    },
  })

  const selectedDoctorId = watch("doctorId")
  const selectedDate = watch("date")
  const selectedStartTime = watch("startTime")

  // Generate time slots for the form
  const timeSlots = generateTimeSlots()

  useEffect(() => {
    const fetchOptions = async () => {
      setLoadingOptions(true)
      try {
        // Fetch patients
        const patientsResponse = await api.get("/patients")
        const patientsData = patientsResponse.data.data.patients || []
        setPatients(
          patientsData.map((patient: any) => ({
            id: patient._id,
            name:
              patient.firstName && patient.lastName ? `${patient.firstName} ${patient.lastName}` : "Unknown Patient",
          })),
        )

        // Fetch doctors
        const doctorsResponse = await api.get("/doctors")
        const doctorsData = doctorsResponse.data.data.doctors || []
        setDoctors(
          doctorsData.map((doctor: any) => ({
            id: doctor._id,
            name: doctor.user?.names || "Dr. Unknown",
            specialization: doctor.specialization || "",
          })),
        )
      } catch (error) {
        console.error("Error fetching options:", error)
      } finally {
        setLoadingOptions(false)
      }
    }

    fetchOptions()
  }, [])

  // Check doctor availability when doctor, date, or start time changes
  useEffect(() => {
    const checkAvailability = async () => {
      if (selectedDoctorId && selectedDate && selectedStartTime) {
        setCheckingAvailability(true)
        try {
          const response = await api.post("/appointments/check-availability", {
            doctorId: selectedDoctorId,
            date: selectedDate,
            time: selectedStartTime,
          })
          setIsAvailable(response.data.data.available || false)
        } catch (error) {
          console.error("Error checking availability:", error)
          setIsAvailable(false)
        } finally {
          setCheckingAvailability(false)
        }
      }
    }

    if (selectedDoctorId && selectedDate && selectedStartTime) {
      checkAvailability()
    } else {
      setIsAvailable(null)
    }
  }, [selectedDoctorId, selectedDate, selectedStartTime])

  // Update end time when start time changes
  useEffect(() => {
    if (selectedStartTime && !isEditing) {
      // Default appointment duration is 30 minutes
      const [hours, minutes] = selectedStartTime.split(":").map(Number)
      const endHour = minutes + 30 >= 60 ? hours + 1 : hours
      const endMinutes = (minutes + 30) % 60
      const endTime = `${endHour.toString().padStart(2, "0")}:${endMinutes.toString().padStart(2, "0")}`
      setValue("endTime", endTime)
    }
  }, [selectedStartTime, setValue, isEditing])

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="patientId" className="block text-sm font-medium text-gray-700">
            Patient
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-gray-400" />
            </div>
            <select
              id="patientId"
              {...register("patientId")}
              disabled={!!patientId || loadingOptions}
              className="block w-full pl-10 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:bg-gray-50 disabled:text-gray-500"
            >
              <option value="">Select a patient</option>
              {patients.map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {patient.name}
                </option>
              ))}
            </select>
          </div>
          {errors.patientId && <p className="mt-1 text-sm text-red-600">{errors.patientId.message}</p>}
        </div>

        <div>
          <label htmlFor="doctorId" className="block text-sm font-medium text-gray-700">
            Doctor
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <UserPlus className="h-5 w-5 text-gray-400" />
            </div>
            <select
              id="doctorId"
              {...register("doctorId")}
              disabled={!!doctorId || loadingOptions}
              className="block w-full pl-10 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:bg-gray-50 disabled:text-gray-500"
            >
              <option value="">Select a doctor</option>
              {doctors.map((doctor) => (
                <option key={doctor.id} value={doctor.id}>
                  {doctor.name} - {doctor.specialization}
                </option>
              ))}
            </select>
          </div>
          {errors.doctorId && <p className="mt-1 text-sm text-red-600">{errors.doctorId.message}</p>}
        </div>

        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700">
            Date
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Calendar className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="date"
              id="date"
              {...register("date")}
              min={new Date().toISOString().split("T")[0]}
              className="block w-full pl-10 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          {errors.date && <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">
              Start Time
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Clock className="h-5 w-5 text-gray-400" />
              </div>
              <select
                id="startTime"
                {...register("startTime")}
                className="block w-full pl-10 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="">Select start time</option>
                {timeSlots.map((slot) => (
                  <option key={`start-${slot.value}`} value={slot.value}>
                    {slot.label}
                  </option>
                ))}
              </select>
            </div>
            {errors.startTime && <p className="mt-1 text-sm text-red-600">{errors.startTime.message}</p>}
            {isAvailable === false && <p className="mt-1 text-sm text-red-600">Doctor is not available at this time</p>}
            {isAvailable === true && <p className="mt-1 text-sm text-green-600">Doctor is available at this time</p>}
          </div>

          <div>
            <label htmlFor="endTime" className="block text-sm font-medium text-gray-700">
              End Time
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Clock className="h-5 w-5 text-gray-400" />
              </div>
              <select
                id="endTime"
                {...register("endTime")}
                className="block w-full pl-10 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="">Select end time</option>
                {timeSlots.map((slot) => (
                  <option key={`end-${slot.value}`} value={slot.value}>
                    {slot.label}
                  </option>
                ))}
              </select>
            </div>
            {errors.endTime && <p className="mt-1 text-sm text-red-600">{errors.endTime.message}</p>}
          </div>
        </div>

        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700">
            Appointment Type
          </label>
          <div className="mt-1">
            <select
              id="type"
              {...register("type")}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="consultation">Consultation</option>
              <option value="checkup">Check-up</option>
              <option value="treatment">Treatment</option>
              <option value="follow-up">Follow-up</option>
            </select>
          </div>
          {errors.type && <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>}
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="reason" className="block text-sm font-medium text-gray-700">
            Reason for Visit
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 pt-3 pointer-events-none">
              <MessageSquare className="h-5 w-5 text-gray-400" />
            </div>
            <textarea
              id="reason"
              rows={2}
              {...register("reason")}
              className="block w-full pl-10 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="Brief description of the reason for this appointment"
            />
          </div>
          {errors.reason && <p className="mt-1 text-sm text-red-600">{errors.reason.message}</p>}
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
            Notes
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 pt-3 pointer-events-none">
              <FileText className="h-5 w-5 text-gray-400" />
            </div>
            <textarea
              id="notes"
              rows={3}
              {...register("notes")}
              className="block w-full pl-10 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="Additional notes or special instructions"
            />
          </div>
          {errors.notes && <p className="mt-1 text-sm text-red-600">{errors.notes.message}</p>}
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
          disabled={isSubmitting || isAvailable === false}
          className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {isSubmitting ? (
            "Saving..."
          ) : (
            <>
              <Check className="mr-2 h-4 w-4" />
              {isEditing ? "Update Appointment" : "Schedule Appointment"}
            </>
          )}
        </button>
      </div>
    </form>
  )
}

export default AppointmentForm
